import type { AttributeId, RuleData } from '$lib/ruleData';
import type { AttributeMethod, Basis, Roll } from '../character';
import type { Derivation } from '../derivation';

export type AttributesAction =
	| { type: 'setAttributeMethod'; method: AttributeMethod }
	| { type: 'rollAttributeSlot'; slot: number; roll: Roll }
	| { type: 'assignAttribute'; attribute: AttributeId; slot: number };

export interface AttributeSlot {
	index: number;
	value?: number;
	roll?: Roll;
	assignedTo?: AttributeId;
}

export interface AttributeStepView {
	method?: AttributeMethod;
	slots: AttributeSlot[];
}

export function applyAttributesAction(basis: Basis, action: AttributesAction): void {
	const step = basis.attributes;
	switch (action.type) {
		case 'setAttributeMethod':
			step.method = action.method;
			break;
		case 'rollAttributeSlot':
			step.rolls[action.slot] = action.roll;
			break;
		case 'assignAttribute': {
			const previousSlot = step.assignment[action.attribute];
			const holder = (Object.keys(step.assignment) as AttributeId[]).find(
				(a) => a !== action.attribute && step.assignment[a] === action.slot
			);
			// Ist der Platz schon vergeben, tauschen die beiden Attribute ihre Plätze.
			if (holder) {
				if (previousSlot === undefined) delete step.assignment[holder];
				else step.assignment[holder] = previousSlot;
			}
			step.assignment[action.attribute] = action.slot;
			break;
		}
	}
}

/** Summe der höchsten Würfel gemäß Regeldaten (z. B. die drei höchsten von 4W6). */
export function keepHighest(dice: number[], keep: number): number {
	return [...dice]
		.sort((a, b) => b - a)
		.slice(0, keep)
		.reduce((sum, d) => sum + d, 0);
}

function slotValues(basis: Basis, ruleData: RuleData): (number | undefined)[] {
	const { method, rolls } = basis.attributes;
	const gen = ruleData.attributeGeneration;
	const count = ruleData.attributes.length;
	if (method === 'array') return gen.fixedArray.slice(0, count);
	if (method === 'roll') {
		return Array.from({ length: count }, (_, i) => (rolls[i] ? keepHighest(rolls[i].dice, gen.dice.keep) : undefined));
	}
	return Array.from({ length: count }, () => undefined);
}

export function attributeStepView(d: Derivation): AttributeStepView {
	const { method, rolls, assignment } = d.character.basis.attributes;
	const values = slotValues(d.character.basis, d.ruleData);
	const owners = Object.entries(assignment) as [AttributeId, number][];
	return {
		method,
		slots: values.map((value, index) => ({
			index,
			value,
			roll: method === 'roll' ? rolls[index] : undefined,
			assignedTo: owners.find(([, slot]) => slot === index)?.[0]
		}))
	};
}

export function evaluateAttributes(d: Derivation): void {
	const values = slotValues(d.character.basis, d.ruleData);
	const { assignment } = d.character.basis.attributes;
	let complete = true;
	for (const attr of d.ruleData.attributes) {
		const slot = assignment[attr.id];
		const value = slot === undefined ? undefined : values[slot];
		d.attributes[attr.id].base = value;
		if (value === undefined) complete = false;
	}
	d.steps.push({ id: 'attributes', status: complete ? 'valid' : 'open' });
}
