import type { CharacteristicDef, RuleData } from '$lib/ruleData';
import type { Basis, Roll } from '../character';
import { applyTrait } from '../choices';
import type { Derivation, StepStatus } from '../derivation';
import { messages } from '../messages';

export type CharacteristicMode = 'none' | 'free' | 'roll';

export type CharacteristicAction =
	| { type: 'setCharacteristicMode'; mode: CharacteristicMode }
	| { type: 'pickCharacteristic'; slot: number; characteristic: string | undefined }
	| { type: 'rollCharacteristic'; slot: number; roll: Roll | undefined }
	| { type: 'rerollCharacteristic'; slot: number; roll: Roll };

export interface CharacteristicSlotView {
	index: number;
	/** `free`: frei gewählt; `roll`: per W100 oder als am Tisch gewürfeltes Ergebnis ausgewählt. */
	kind: 'free' | 'roll';
	/** Zusätzlicher Platz durch eine Spezies-Eigenschaft. */
	extra: boolean;
	id?: string;
	name?: string;
	text?: string;
	note?: string;
	roll?: Roll;
	/** Würfelplatz, dessen Ergebnis direkt ausgewählt statt gewürfelt wurde. */
	picked?: boolean;
	rerolled?: boolean;
	/** Dieselbe Charakteristik ist schon in einem früheren Platz: neu würfeln bzw. anders wählen. */
	duplicate?: boolean;
}

export interface CharacteristicStepView {
	mode?: CharacteristicMode;
	maxSlots: number;
	slots: CharacteristicSlotView[];
	rerollAvailable: boolean;
	/** Durch eine Spezies-Eigenschaft ist keine Charakteristik erlaubt. */
	forbidden: boolean;
}

export function characteristicForRoll(rd: RuleData, value: number): CharacteristicDef | undefined {
	return rd.characteristics.entries.find((c) => value >= c.range[0] && value <= c.range[1]);
}

export function applyCharacteristicAction(basis: Basis, action: CharacteristicAction, rd: RuleData): void {
	const c = basis.characteristics;
	switch (action.type) {
		case 'setCharacteristicMode':
			c.mode = action.mode;
			break;
		// Ein Platz hat entweder eine Auswahl oder einen Wurf; das Neueste gilt.
		case 'pickCharacteristic':
			delete c.rolls[action.slot];
			if (action.characteristic) c.picks[action.slot] = action.characteristic;
			else delete c.picks[action.slot];
			break;
		case 'rollCharacteristic':
			delete c.picks[action.slot];
			if (action.roll) c.rolls[action.slot] = action.roll;
			else delete c.rolls[action.slot];
			break;
		case 'rerollCharacteristic':
			// Nur so oft wie erlaubt (einmal insgesamt) und nur für einen bereits gewürfelten Platz.
			if (Object.keys(c.rerolledSlots).length < rd.characteristics.rerolls && c.rolls[action.slot]) {
				c.rolls[action.slot] = action.roll;
				c.rerolledSlots[action.slot] = true;
			}
			break;
	}
}

/** Charakteristik: frei wählen oder bis zu zwei würfeln (auch am Tisch, dann ausgewählt); Effekte wirken automatisch. */
export function evaluateCharacteristic(d: Derivation): CharacteristicStepView {
	const rd = d.ruleData;
	const c = d.character.basis.characteristics;
	const { extra, forbidden } = d.characteristicAllowance;
	const rerolls = Object.keys(c.rerolledSlots).length;
	const view: CharacteristicStepView = {
		mode: c.mode,
		maxSlots: 0,
		slots: [],
		rerollAvailable: rerolls < rd.characteristics.rerolls,
		forbidden
	};
	if (!d.options.optionalRules.charakteristik) return view;

	if (!c.mode) {
		d.steps.push({ id: 'characteristic', status: 'open' });
		return view;
	}

	let status: StepStatus = 'valid';
	const baseSlots = c.mode === 'none' ? 0 : c.mode === 'free' ? 1 : rd.characteristics.maxRolled;
	const extraSlots = c.mode === 'none' ? 0 : extra;
	view.maxSlots = baseSlots + extraSlots;
	const seen = new Set<string>();

	for (let index = 0; index < view.maxSlots; index++) {
		const isExtra = index >= baseSlots;
		const kind: CharacteristicSlotView['kind'] = c.mode === 'free' && !isExtra ? 'free' : 'roll';
		const slot: CharacteristicSlotView = { index, kind, extra: isExtra };
		let def: CharacteristicDef | undefined;
		if (kind === 'roll' && !c.picks[index]) {
			slot.picked = false;
			slot.roll = c.rolls[index];
			slot.rerolled = c.rerolledSlots[index] ?? false;
			if (slot.roll) def = characteristicForRoll(rd, slot.roll.dice[0]);
		} else {
			if (kind === 'roll') slot.picked = true;
			def = rd.characteristics.entries.find((e) => e.id === c.picks[index]);
		}
		if (def) {
			Object.assign(slot, { id: def.id, name: def.name, text: def.text, note: def.note });
			if (seen.has(def.id)) {
				slot.duplicate = true;
				if (kind === 'roll' && !slot.picked) {
					status = status === 'invalid' ? status : 'open';
					d.issues.push({ step: 'characteristic', severity: 'warning', message: messages.characteristicDuplicateRoll(def.name) });
				} else {
					status = 'invalid';
					d.issues.push({ step: 'characteristic', severity: 'invalid', message: messages.characteristicDuplicatePick(def.name) });
				}
			} else if (forbidden) {
				status = 'invalid';
			} else {
				seen.add(def.id);
				const { status: effectStatus } = applyTrait(
					d,
					{ id: `charakteristik:${def.id}`, name: def.name, text: def.text, effects: def.effects },
					'characteristic'
				);
				if (effectStatus === 'invalid') status = 'invalid';
			}
		} else if (kind === 'free' && index === 0) {
			status = status === 'invalid' ? status : 'open';
		}
		view.slots.push(slot);
	}
	if (forbidden && seen.size === 0 && view.slots.some((s) => s.id)) {
		d.issues.push({ step: 'characteristic', severity: 'invalid', message: messages.characteristicForbidden });
	}
	d.steps.push({ id: 'characteristic', status });
	return view;
}
