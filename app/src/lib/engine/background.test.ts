import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { playWith } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);
const view = (c: Character) => computeView(c, ruleData);
const status = (c: Character) => view(c).steps.find((s) => s.id === 'background')?.status;

describe('Vorgeschichte', () => {
	it('die Tabellen des Regelwerks sind vorhanden', () => {
		const b = ruleData.background;
		expect(b.appearanceAdjectives).toHaveLength(36);
		expect([b.beliefs, b.worldviews, b.personRelations, b.personReasons, b.places, b.possessions].map((l) => l.length)).toEqual([
			10, 10, 10, 10, 10, 10
		]);
		expect(b.languages).toHaveLength(14);
		expect(b.names.map((n) => n.culture)).toContain('Zwergische');
	});

	it('der Schritt ist gültig, sobald ein Name vergeben ist', () => {
		expect(status(play())).toBe('open');
		expect(status(play({ type: 'setName', name: 'Agnes' }))).toBe('valid');
		expect(status(play({ type: 'setName', name: '   ' }))).toBe('open');
	});

	it('alle Felder sind frei beschreibbar', () => {
		const c = play(
			{ type: 'setBackground', field: 'gender', value: 'weiblich' },
			{ type: 'setBackground', field: 'belief', value: 'Skeptikerin' },
			{ type: 'setBackground', field: 'traits', value: 'Neugierig, stur.' }
		);
		expect(view(c).background).toMatchObject({ gender: 'weiblich', belief: 'Skeptikerin', traits: 'Neugierig, stur.' });
	});

	it('wichtige Personen lassen sich hinzufügen, bearbeiten und entfernen', () => {
		let c = play({ type: 'addPerson' }, { type: 'addPerson' });
		c = applyAction(c, { type: 'updatePerson', index: 1, person: { name: 'Meister Ulrich', relation: 'Lehrmeister' } }, ruleData);
		expect(view(c).background.people).toEqual([{}, { name: 'Meister Ulrich', relation: 'Lehrmeister' }]);
		c = applyAction(c, { type: 'removePerson', index: 0 }, ruleData);
		expect(view(c).background.people).toEqual([{ name: 'Meister Ulrich', relation: 'Lehrmeister' }]);
	});

	it('Sprachen mit oder ohne Schrift', () => {
		const c = play(
			{ type: 'toggleLanguage', language: 'hochkaiserlich' },
			{ type: 'toggleLanguage', language: 'latinisch' },
			{ type: 'setLanguageWriting', language: 'hochkaiserlich', writing: true },
			{ type: 'toggleLanguage', language: 'latinisch' }
		);
		expect(view(c).background.languages).toEqual([{ id: 'hochkaiserlich', writing: true }]);
	});

	it('Aussehen: ein oder zwei Adjektive', () => {
		const c = play({ type: 'setBackground', field: 'appearance', value: 'Drahtig, Gerissen' });
		expect(view(c).background.appearance).toBe('Drahtig, Gerissen');
	});
});
