import { describe, expect, it } from 'vitest';
import { applyAction, computeView, createCharacter, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';

function play(...actions: Action[]): Character {
	return actions.reduce((c, a) => applyAction(c, a, ruleData), createCharacter('c1', ruleData.version));
}

const ARRAY_ASSIGNMENT: Action[] = [
	{ type: 'setAttributeMethod', method: 'array' },
	{ type: 'assignAttribute', attribute: 'STR', slot: 0 },
	{ type: 'assignAttribute', attribute: 'KON', slot: 1 },
	{ type: 'assignAttribute', attribute: 'GES', slot: 2 },
	{ type: 'assignAttribute', attribute: 'WAH', slot: 3 },
	{ type: 'assignAttribute', attribute: 'KLU', slot: 4 },
	{ type: 'assignAttribute', attribute: 'INT', slot: 5 },
	{ type: 'assignAttribute', attribute: 'CHA', slot: 6 },
	{ type: 'assignAttribute', attribute: 'WIL', slot: 7 }
];

describe('Erstellungsablauf', () => {
	it('ein neuer Charakter beginnt mit gültigen Standardoptionen und offenen Grundattributen', () => {
		const view = computeView(createCharacter('c1'), ruleData);
		expect(view.steps.slice(0, 2).map((s) => [s.id, s.status])).toEqual([
			['options', 'valid'],
			['attributes', 'open']
		]);
	});

	it('optionale Regeln sind jederzeit umschaltbar', () => {
		const c = play({ type: 'setOptionalRule', rule: 'charakteristik', enabled: false });
		expect(computeView(c, ruleData).options.optionalRules.charakteristik).toBe(false);
		const back = applyAction(c, { type: 'setOptionalRule', rule: 'charakteristik', enabled: true }, ruleData);
		expect(computeView(back, ruleData).options.optionalRules.charakteristik).toBe(true);
	});

	it('das Setting ist wählbar', () => {
		const c = play({ type: 'setSetting', setting: 'fallout' });
		expect(computeView(c, ruleData).options.setting).toBe('fallout');
	});
});

describe('Grundattribute', () => {
	it('mit dem festen Array stehen die Werte 16, 14, 12, 12, 10, 10, 10, 8 zur Verteilung', () => {
		const view = computeView(play({ type: 'setAttributeMethod', method: 'array' }), ruleData);
		expect(view.attributeStep.slots.map((s) => s.value)).toEqual([16, 14, 12, 12, 10, 10, 10, 8]);
	});

	it('beim Würfeln zählen die drei höchsten von 4W6', () => {
		const c = play(
			{ type: 'setAttributeMethod', method: 'roll' },
			{ type: 'rollAttributeSlot', slot: 0, roll: { dice: [1, 6, 4, 3], source: 'app' } }
		);
		const slot = computeView(c, ruleData).attributeStep.slots[0];
		expect(slot.value).toBe(13);
		expect(slot.roll).toEqual({ dice: [1, 6, 4, 3], source: 'app' });
	});

	it('ungewürfelte Plätze haben noch keinen Wert', () => {
		const view = computeView(play({ type: 'setAttributeMethod', method: 'roll' }), ruleData);
		expect(view.attributeStep.slots).toHaveLength(8);
		expect(view.attributeStep.slots.every((s) => s.value === undefined)).toBe(true);
	});

	it('zugewiesene Werte erscheinen als Grundattribute und der Schritt wird gültig', () => {
		const view = computeView(play(...ARRAY_ASSIGNMENT), ruleData);
		expect(view.attributes.STR.base).toBe(16);
		expect(view.attributes.WIL.base).toBe(8);
		expect(view.attributes.STR.effective).toBe(16);
		expect(view.steps.find((s) => s.id === 'attributes')?.status).toBe('valid');
	});

	it('solange nicht alle acht Grundattribute vergeben sind, bleibt der Schritt offen', () => {
		const view = computeView(play(...ARRAY_ASSIGNMENT.slice(0, 5)), ruleData);
		expect(view.steps.find((s) => s.id === 'attributes')?.status).toBe('open');
		expect(view.attributes.CHA.base).toBeUndefined();
	});

	it('wird ein vergebener Platz einem anderen Attribut zugewiesen, tauschen die beiden', () => {
		const view = computeView(play(...ARRAY_ASSIGNMENT, { type: 'assignAttribute', attribute: 'WIL', slot: 0 }), ruleData);
		expect(view.attributes.WIL.base).toBe(16);
		expect(view.attributes.STR.base).toBe(8);
	});

	it('ein von Hand eingetragener Wurf wird als eingetragen gekennzeichnet', () => {
		const c = play(
			{ type: 'setAttributeMethod', method: 'roll' },
			{ type: 'rollAttributeSlot', slot: 3, roll: { dice: [5, 5, 5, 2], source: 'manual' } }
		);
		const slot = computeView(c, ruleData).attributeStep.slots[3];
		expect(slot.value).toBe(15);
		expect(slot.roll?.source).toBe('manual');
	});

	it('ein Wechsel des Verfahrens behält die Zuordnung zu den Plätzen', () => {
		const c = play(...ARRAY_ASSIGNMENT, { type: 'setAttributeMethod', method: 'roll' });
		const view = computeView(c, ruleData);
		expect(view.attributes.STR.base).toBeUndefined();
		expect(view.steps.find((s) => s.id === 'attributes')?.status).toBe('open');
		const rolled = [0, 1, 2, 3, 4, 5, 6, 7].reduce(
			(acc, slot) => applyAction(acc, { type: 'rollAttributeSlot', slot, roll: { dice: [6, 6, 6, 1], source: 'app' } }, ruleData),
			c
		);
		expect(computeView(rolled, ruleData).attributes.STR.base).toBe(18);
	});
});
