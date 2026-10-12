import { describe, expect, it } from 'vitest';
import { applyAction, computeView, createCharacter } from './index';
import { ruleData } from '$lib/ruleData';

describe('Charakter anlegen', () => {
	it('ein neuer Charakter ist in Erstellung und hat noch keinen Namen', () => {
		const character = createCharacter('c1');
		const view = computeView(character, ruleData);
		expect(view.id).toBe('c1');
		expect(view.name).toBe('');
		expect(view.status).toBe('inCreation');
	});

	it('der Name lässt sich setzen', () => {
		const character = applyAction(createCharacter('c1'), { type: 'setName', name: 'Agnes' }, ruleData);
		expect(computeView(character, ruleData).name).toBe('Agnes');
	});

	it('eine Aktion verändert den ursprünglichen Charakter nicht', () => {
		const original = createCharacter('c1');
		applyAction(original, { type: 'setName', name: 'Agnes' }, ruleData);
		expect(computeView(original, ruleData).name).toBe('');
	});
});
