import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { type RuleData } from '$lib/ruleData';
import { arrayAttributes, playWith, testRuleData } from './testing/fixtures';

const rd: RuleData = { ...testRuleData, optionalRules: testRuleData.optionalRules.map((r) => ({ ...r, defaultEnabled: false })) };
const view = (c: Character) => computeView(c, rd);
const act = (c: Character, ...actions: Action[]) => actions.reduce((x, a) => applyAction(x, a, rd), c);
const d = (...dice: number[]) => ({ dice, source: 'manual' as const });

// TP 19, STA 55, MP 6 (WIL 8, KON 14, KLU/INT/CHA 10)
const sheet = () => act(playWith(rd, ...arrayAttributes(), { type: 'rollLuck', roll: d(12) }), { type: 'finishCreation' });
// Für diese Tests genügt ein Charakter mit Grundattributen; Abschließen ist nicht nötig, der Startwert wird gesetzt.
const started = () =>
	act(
		sheet(),
		{ type: 'overrideValue', key: 'maxStability', value: undefined },
		{ type: 'setCurrent', key: 'stability', value: 55 }
	);

describe('Stabilität', () => {
	it('Verlust senkt die Stabilität', () => {
		expect(view(act(started(), { type: 'loseStability', amount: 3, inCombat: false })).live.stability).toBe(52);
	});

	it('mehr als 5 Verlust auf einmal im Kampf: Panik', () => {
		const c = act(started(), { type: 'loseStability', amount: 6, inCombat: true });
		expect(view(c).live.conditions).toContain('panik');
		expect(view(act(started(), { type: 'loseStability', amount: 6, inCombat: false })).live.conditions).not.toContain('panik');
		expect(view(act(started(), { type: 'loseStability', amount: 5, inCombat: true })).live.conditions).not.toContain('panik');
	});

	it('mehr als 10 Verlust auf einmal: mentaler Zusammenbruch', () => {
		expect(view(act(started(), { type: 'loseStability', amount: 11, inCombat: false })).live.conditions).toContain(
			'mentalerZusammenbruch'
		);
	});

	it('unter der Hälfte des Startwerts: schleichender Wahnsinn', () => {
		const c = act(
			started(),
			{ type: 'setStabilityStart', value: 55 },
			{ type: 'loseStability', amount: 9, inCombat: false },
			{ type: 'loseStability', amount: 9, inCombat: false },
			{ type: 'loseStability', amount: 9, inCombat: false }
		);
		// 55 − 27 = 28: noch nicht unter 27,5
		expect(view(c).live.conditions).not.toContain('schleichenderWahnsinn');
		const lower = act(c, { type: 'loseStability', amount: 1, inCombat: false });
		expect(view(lower).live.stability).toBe(27);
		expect(view(lower).live.conditions).toContain('schleichenderWahnsinn');
	});
});

describe('Magiepunkte', () => {
	it('Ausgeben senkt die MP', () => {
		expect(view(act(started(), { type: 'spendMp', amount: 4 })).live.mp).toBe(2);
	});

	it('MP dürfen negativ werden; jeder überzogene Punkt kostet 1 TP, ab dem fünften 2 TP', () => {
		const c = act(started(), { type: 'spendMp', amount: 9 });
		// 6 − 9 = −3: 3 TP Schaden
		expect(view(c).live).toMatchObject({ mp: -3, tp: 16 });
		const more = act(c, { type: 'spendMp', amount: 3 });
		// −3 → −6: Punkt 4 kostet 1, Punkte 5 und 6 je 2 = 5 TP
		expect(view(more).live).toMatchObject({ mp: -6, tp: 11 });
	});

	it('Ruhephase: 8 Stunden füllen MP ganz, 4 Stunden zur Hälfte', () => {
		const c = act(started(), { type: 'spendMp', amount: 6 });
		expect(view(act(c, { type: 'rest', hours: 4 })).live.mp).toBe(3);
		expect(view(act(c, { type: 'rest', hours: 8 })).live.mp).toBe(6);
	});

	it('Meditation regeneriert je Stunde 1W6 + Bonus, höchstens bis zum Maximum', () => {
		const c = act(started(), { type: 'spendMp', amount: 6 }, { type: 'meditate', rolls: [d(2)], bonus: 1 });
		expect(view(c).live.mp).toBe(3);
		expect(view(act(c, { type: 'meditate', rolls: [d(6), d(6)], bonus: 0 })).live.mp).toBe(6);
	});

	it('der Meditationswürfel richtet sich nach Spezies-Eigenschaften (Wächter der Ströme: W10)', () => {
		expect(view(started()).meditationDie).toBe(6);
	});
});

describe('Ruhe', () => {
	it('eine Stunde Pause füllt die TP, der Wundenmalus bleibt', () => {
		const c = act(
			started(),
			{ type: 'takeDamage', amount: 4 },
			{ type: 'endCombat', rolls: [d(3)] },
			{ type: 'takeDamage', amount: 2 }
		);
		expect(view(c).live).toMatchObject({ maxTp: 16, tp: 13 });
		expect(view(act(c, { type: 'rest', hours: 1 })).live.tp).toBe(16);
	});

	it('eine Ruhephase kann das Glück neu würfeln', () => {
		expect(view(act(started(), { type: 'rest', hours: 4, luck: d(17) })).live.luck).toBe(17);
	});
});

describe('Glück', () => {
	it('neu würfeln nach einem Einsatz', () => {
		expect(view(act(started(), { type: 'rerollLuck', roll: d(5) })).live.luck).toBe(5);
	});

	it('mit Vorteil zählt der höchste Würfel', () => {
		expect(view(act(started(), { type: 'rerollLuck', roll: d(5, 14) })).live.luck).toBe(14);
	});

	it('nach einem Patzer +1', () => {
		expect(view(act(started(), { type: 'fumble' })).live.luck).toBe(13);
	});
});
