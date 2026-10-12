import type { StuntDef, TraitDef } from '$lib/ruleData';
import type { Basis } from '../character';
import { applyTrait, type TraitView } from '../choices';
import { effective, type Derivation, type StepStatus } from '../derivation';
import { messages } from '../messages';
import type { SecondaryValue } from './secondary';
import type { SkillView } from './skills';

export type OriginAction =
	| { type: 'chooseOriginOrStunt'; choice: 'origin' | 'stunt' }
	| { type: 'chooseOrigin'; origin: string }
	| { type: 'toggleStunt'; stunt: string };

export interface OriginStepView {
	choice?: 'origin' | 'stunt';
	selected?: string;
	abilities: { name: string; text: string }[];
	/** Wahl und Effekte der Herkunft (z. B. Element, Artefakt, Drache). */
	trait?: TraitView;
	note?: string;
}

export interface StuntView {
	id: string;
	name: string;
	tier: number;
	tierName: string;
	text: string;
	prerequisites: string[];
	/** Nicht erfüllte Voraussetzungen. */
	unmet: string[];
	available: boolean;
	chosen: boolean;
}

export interface StuntStepView {
	allowed: number;
	chosen: string[];
	stunts: StuntView[];
}

export function applyOriginAction(basis: Basis, action: OriginAction, allowedStunts: number): void {
	switch (action.type) {
		case 'chooseOriginOrStunt':
			basis.origin.choice = action.choice;
			break;
		case 'chooseOrigin':
			basis.origin.origin = action.origin;
			break;
		case 'toggleStunt':
			if (basis.stunts.includes(action.stunt)) basis.stunts = basis.stunts.filter((s) => s !== action.stunt);
			else if (basis.stunts.length < allowedStunts) basis.stunts.push(action.stunt);
			break;
	}
}

/** Wie viele Kunststücke erlaubt sind: immer eines, statt einer Besonderen Herkunft ein zweites. */
export function allowedStunts(basis: Basis, optionalRules: Record<string, boolean>): number {
	return optionalRules.besondereHerkunft && basis.origin.choice === 'stunt' ? 2 : 1;
}

export function evaluateOrigin(d: Derivation): OriginStepView {
	const basis = d.character.basis.origin;
	const view: OriginStepView = { choice: basis.choice, abilities: [] };
	if (!d.options.optionalRules.besondereHerkunft) return view;

	let status: StepStatus = 'open';
	if (basis.choice === 'stunt') status = 'valid';
	if (basis.choice === 'origin') {
		const origin = d.ruleData.origins.find((o) => o.id === basis.origin);
		if (origin) {
			view.selected = origin.id;
			view.abilities = origin.abilities;
			view.note = origin.note;
			const trait: TraitDef = {
				id: origin.id,
				name: origin.name,
				text: origin.description,
				effects: origin.effects,
				options: origin.options
			};
			const result = applyTrait(d, trait, 'origin');
			view.trait = result.view;
			status = result.status;
		}
	}
	d.steps.push({ id: 'origin', status });
	return view;
}

/** Atronach & Co.: prozentuale Zuschläge auf Sekundärattribute (abgerundet). */
export function applySecondaryPercent(d: Derivation, secondary: Record<string, SecondaryValue>): void {
	for (const [key, percent] of Object.entries(d.secondaryPercent)) {
		const value = secondary[key];
		if (value?.value === undefined || !percent) continue;
		const bonus = Math.floor((value.value * percent) / 100);
		value.modifiers = [...value.modifiers, { source: messages.percentSource(percent), value: bonus }];
		value.value += bonus;
	}
}

function unmetPrerequisites(
	stunt: StuntDef,
	d: Derivation,
	skills: SkillView[],
	secondary: Record<string, SecondaryValue>,
	status: number
): string[] {
	const unmet: string[] = [];
	for (const p of stunt.prerequisites) {
		let value: number | undefined;
		if (p.attribute) {
			value = effective(d.attributes[p.attribute]);
		} else if (p.skills) {
			// Eine der genannten Fertigkeiten genügt; nicht angelegte Spezialisierungen zählen nicht.
			const values = p.skills.map((key) => skills.find((s) => s.key === key)?.value).filter((v): v is number => v !== undefined);
			value = values.length ? Math.max(...values) : undefined;
		} else if (p.secondary) {
			value = secondary[p.secondary]?.value;
		} else if (p.status) {
			value = status;
		} else {
			continue;
		}
		if (value === undefined || value < (p.value ?? 0)) unmet.push(p.text);
	}
	return unmet;
}

/** Kunststücke: ihre Voraussetzungen werden an den endgültigen Werten geprüft. */
export function evaluateStunts(
	d: Derivation,
	skills: SkillView[],
	secondary: Record<string, SecondaryValue>,
	status: number
): StuntStepView {
	const allowed = allowedStunts(d.character.basis, d.options.optionalRules);
	const chosen = d.character.basis.stunts;
	const stunts = d.ruleData.stunts.map((stunt) => {
		const unmet = unmetPrerequisites(stunt, d, skills, secondary, status);
		return {
			id: stunt.id,
			name: stunt.name,
			tier: stunt.tier,
			tierName: stunt.tierName,
			text: stunt.text,
			prerequisites: stunt.prerequisites.map((p) => p.text),
			unmet,
			available: unmet.length === 0,
			chosen: chosen.includes(stunt.id)
		};
	});

	// Erfüllt der Charakter für weniger Kunststücke die Voraussetzungen als erlaubt, genügen die erfüllbaren.
	const choosable = stunts.filter((s) => s.available && !s.chosen).length;
	const needed = Math.min(allowed, chosen.length + choosable);
	let stepStatus: StepStatus = chosen.length > allowed ? 'invalid' : chosen.length >= needed ? 'valid' : 'open';
	if (chosen.length < allowed && choosable === 0) {
		d.issues.push({ step: 'stunts', severity: 'warning', message: messages.noStuntAvailable });
	}
	if (chosen.length > allowed) {
		d.issues.push({ step: 'stunts', severity: 'invalid', message: messages.tooManyStunts(chosen.length, allowed) });
	}
	for (const id of chosen) {
		const stunt = stunts.find((s) => s.id === id);
		if (!stunt) continue;
		if (!stunt.available) {
			stepStatus = 'invalid';
			d.issues.push({ step: 'stunts', severity: 'invalid', message: messages.stuntUnmet(stunt.name, stunt.unmet) });
		}
	}
	d.steps.push({ id: 'stunts', status: stepStatus });
	return { allowed, chosen, stunts };
}
