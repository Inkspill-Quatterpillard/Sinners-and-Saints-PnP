import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);
const view = (c: Character) => computeView(c, ruleData);
const status = (c: Character) => view(c).steps.find((s) => s.id === 'interests')?.status;
const skill = (c: Character, key: string) => view(c).skills.find((s) => s.key === key)!;

// KLU 12, INT 10 (Reihenfolge: STR KON GES KLU WAH INT CHA WIL → 16 14 12 12 10 10 10 8)
const ATTRS = arrayAttributes(['STR', 'KON', 'GES', 'KLU', 'WAH', 'INT', 'CHA', 'WIL']);

describe('Persönliche Interessen', () => {
	it('vorausgewählt ist das höhere von KLU und INT, die Punkte betragen das Doppelte', () => {
		const v = view(play(...ATTRS));
		expect(v.interestsStep).toMatchObject({ basis: 'KLU', total: 24, spent: 0, remaining: 24 });
	});

	it('der Spieler darf stattdessen INT wählen', () => {
		const v = view(play(...ATTRS, { type: 'setInterestBasis', attribute: 'INT' }));
		expect(v.interestsStep).toMatchObject({ basis: 'INT', total: 20 });
	});

	it('Punkte erhöhen Fertigkeiten und den Status', () => {
		const c = play(
			...ATTRS,
			{ type: 'setInterestPoints', target: 'medizin', points: 10 },
			{ type: 'setInterestPoints', target: 'status', points: 4 }
		);
		// Medizin ⅕ KLU 12 = 2 + 10
		expect(skill(c, 'medizin').value).toBe(12);
		expect(skill(c, 'medizin').bonuses).toEqual([{ source: 'Persönliche Interessen', value: 10 }]);
		expect(view(c).socialStatus.value).toBe(9);
		expect(view(c).interestsStep.remaining).toBe(10);
	});

	it('alle Punkte verteilt: gültig; Rest übrig: offen', () => {
		const partial = play(...ATTRS, { type: 'setInterestPoints', target: 'medizin', points: 20 });
		expect(status(partial)).toBe('open');
		const all = applyAction(partial, { type: 'setInterestPoints', target: 'charme', points: 4 }, ruleData);
		expect(status(all)).toBe('valid');
	});

	it('zu viele Punkte machen den Schritt ungültig', () => {
		const c = play(...ATTRS, { type: 'setInterestPoints', target: 'medizin', points: 30 });
		expect(status(c)).toBe('invalid');
		expect(view(c).interestsStep.remaining).toBe(-6);
	});

	it('Kampf- und Magiefertigkeiten sind ausgeschlossen', () => {
		const c = play(...ATTRS, { type: 'setInterestPoints', target: 'schwerter', points: 4 });
		expect(skill(c, 'schwerter').bonuses).toEqual([]);
		expect(view(c).interestsStep.spent).toBe(0);
	});

	it('Punkte auf Spezialisierungen sind möglich', () => {
		const c = play(
			...ATTRS,
			{ type: 'addSpecialization', skill: 'fremdsprachen', specialization: 'Latin' },
			{ type: 'setInterestPoints', target: 'fremdsprachen:Latin', points: 5 }
		);
		// ⅕ INT 10 = 2 + 5
		expect(skill(c, 'fremdsprachen:Latin').value).toBe(7);
	});

	it('Punkte auf Professionsfertigkeiten addieren sich zum Professionsbonus', () => {
		const c = play(
			...ATTRS,
			{ type: 'toggleProfessionSkill', skill: 'medizin' },
			{ type: 'setInterestPoints', target: 'medizin', points: 3 }
		);
		expect(skill(c, 'medizin').value).toBe(10);
	});

	it('sinkt KLU nachträglich, werden die Punkte neu bewertet', () => {
		const c = play(...ATTRS, { type: 'setInterestPoints', target: 'medizin', points: 24 });
		expect(status(c)).toBe('valid');
		// KLU bekommt die 8 (Platz 7), WIL die 12
		const lower = applyAction(c, { type: 'assignAttribute', attribute: 'KLU', slot: 7 }, ruleData);
		// höheres ist jetzt INT 10 – aber die Wahl ist nicht gespeichert, also zählt das höhere: 20
		expect(view(lower).interestsStep).toMatchObject({ basis: 'INT', total: 20, remaining: -4 });
		expect(status(lower)).toBe('invalid');
	});

	it('eine ausdrücklich getroffene Wahl bleibt bestehen, auch wenn das andere Attribut höher wird', () => {
		const c = play(...ATTRS, { type: 'setInterestBasis', attribute: 'KLU' }, { type: 'assignAttribute', attribute: 'KLU', slot: 7 });
		expect(view(c).interestsStep).toMatchObject({ basis: 'KLU', total: 16 });
	});

	it('ohne Attribute gibt es noch keine Punkte', () => {
		expect(view(play()).interestsStep.total).toBeUndefined();
		expect(status(play())).toBe('open');
	});
});
