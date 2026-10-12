import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData, type RuleData } from '$lib/ruleData';
import { arrayAttributes, playWith, testRuleData } from './testing/fixtures';

/**
 * Testdaten für den lebenden Bogen: ohne optionale Regeln und mit einer Spezies ohne Eigenschaften,
 * damit ein vollständiger Charakter mit wenigen Aktionen entsteht.
 */
const rd: RuleData = { ...testRuleData, optionalRules: testRuleData.optionalRules.map((r) => ({ ...r, defaultEnabled: false })) };
const view = (c: Character) => computeView(c, rd);
const act = (c: Character, ...actions: Action[]) => actions.reduce((x, a) => applyAction(x, a, rd), c);

// KON 14 → TP 19, Wundschwelle 3
const COMPLETE: Action[] = [
	...arrayAttributes(),
	{ type: 'chooseSpecies', species: 'anderes' },
	{ type: 'setAge', years: 25 },
	{ type: 'rollMaturity', index: 0, attribute: 'KLU', roll: { dice: [1], source: 'manual' } },
	{ type: 'chooseReligion', religion: 'kultDesLanhann' },
	{ type: 'setProfessionName', name: 'Söldnerin' },
	...['akrobatik', 'klettern', 'schleichen', 'navigieren', 'sondieren', 'beschwatzen', 'ersteHilfe', 'reiten'].map(
		(skill): Action => ({ type: 'toggleProfessionSkill', skill })
	),
	{ type: 'rollStatus', roll: { dice: [4], source: 'manual' } },
	...['schwerter', 'boegen', 'faustkampf', 'dolcheUndMesser', 'hiebwaffen'].map((skill, slot): Action => ({
		type: 'assignHeroSkill',
		slot,
		skill
	})),
	{ type: 'setInterestPoints', target: 'medizin', points: 6 },
	{ type: 'setInterestPoints', target: 'akrobatik', points: 14 },
	{ type: 'rollLuck', roll: { dice: [12], source: 'manual' } },
	{ type: 'toggleStunt', stunt: 'abrollen' },
	{ type: 'setName', name: 'Agnes' }
];
const created = () => playWith(rd, ...COMPLETE);
const finished = () => act(created(), { type: 'finishCreation' });

describe('Abschließen', () => {
	it('der Testcharakter ist vollständig und gültig', () => {
		const v = view(created());
		expect(v.steps.filter((s) => s.status !== 'valid')).toEqual([]);
		expect(v.canFinish).toBe(true);
	});

	it('ein vollständiger Charakter lässt sich abschließen', () => {
		expect(view(finished()).status).toBe('finished');
	});

	it('ein unvollständiger Charakter lässt sich nicht abschließen', () => {
		const c = act(playWith(rd, ...COMPLETE.slice(0, -1)), { type: 'finishCreation' });
		expect(view(c).canFinish).toBe(false);
		expect(view(c).status).toBe('inCreation');
	});

	it('beim Abschließen werden nicht mehr genutzte Angaben entfernt, die Werte bleiben gleich', () => {
		// Erst 500 Jahre alt mit Atrophia und Vergreisung, dann wieder 25; dazu Reste anderer Wege.
		const detour = playWith(
			rd,
			{ type: 'setAge', years: 500 },
			{ type: 'setAtrophiaPoints', attribute: 'STR', points: 2 },
			{ type: 'rollSenility', index: 3, roll: { dice: [99], source: 'manual' } },
			{ type: 'rollMaturity', index: 7, attribute: 'INT', roll: { dice: [20], source: 'manual' } },
			{ type: 'setAttributeMethod', method: 'roll' },
			{ type: 'rollAttributeSlot', slot: 0, roll: { dice: [6, 6, 6, 6], source: 'manual' } },
			{ type: 'chooseTraitOption', trait: 'gibtEsNicht', option: 'x' },
			...COMPLETE
		);
		const before = view(detour);
		expect(before.issues.filter((i) => i.severity === 'invalid')).toEqual([]);
		expect(before.canFinish).toBe(true);
		const done = act(detour, { type: 'finishCreation' });
		const b = done.basis;
		expect(b.age.atrophia).toEqual({});
		expect(b.age.senility).toEqual({});
		expect(Object.keys(b.age.maturity)).toEqual(['0']);
		expect(b.attributes.rolls).toEqual({});
		expect(b.choices).toEqual({});
		const after = view(done);
		expect(after.attributes).toEqual(before.attributes);
		expect(after.skills).toEqual(before.skills);
		expect(after.secondary).toEqual(before.secondary);
	});

	it('beim Abschließen wird die Start-Stabilität festgehalten', () => {
		// (WIL 8 + KON 14) × 2,5 = 55
		expect(view(finished()).live.stabilityStart).toBe(55);
	});
});

describe('Lebender Bogen', () => {
	it('zeigt TP, Stabilität, MP und Glück mit ihren Höchstwerten', () => {
		const live = view(finished()).live;
		expect(live).toMatchObject({
			tp: 19,
			maxTp: 19,
			stability: 55,
			maxStability: 55,
			mp: 6,
			maxMp: 6,
			luck: 12,
			woundThreshold: 3
		});
	});

	it('Schaden zieht TP ab; über der Wundschwelle entsteht eine Wunde', () => {
		const c = act(finished(), { type: 'takeDamage', amount: 2 });
		expect(view(c).live).toMatchObject({ tp: 17, pendingWounds: 0 });
		const wounded = act(c, { type: 'takeDamage', amount: 4 });
		expect(view(wounded).live).toMatchObject({ tp: 13, pendingWounds: 1 });
		expect(view(wounded).live.conditions).toContain('wunde');
	});

	it('Schaden von mindestens der Hälfte der TP auf einen Schlag gibt zwei Wunden', () => {
		expect(view(act(finished(), { type: 'takeDamage', amount: 10 })).live.pendingWounds).toBe(2);
	});

	it('mehr Schaden als die maximalen TP auf einen Schlag ist tödlich', () => {
		const v = view(act(finished(), { type: 'takeDamage', amount: 20 }));
		expect(v.live.tp).toBe(0);
		expect(v.live.conditions).toContain('tot');
	});

	it('fallen die TP mit einer Wunde auf null, liegt der Charakter im Sterben', () => {
		const v = view(act(finished(), { type: 'takeDamage', amount: 10 }, { type: 'takeDamage', amount: 9 }));
		expect(v.live.tp).toBe(0);
		expect(v.live.conditions).toContain('sterbend');
	});

	it('am Kampfende wird je Wunde ein W6 Wundenmalus von den maximalen TP abgezogen (kumulativ)', () => {
		const c = act(finished(), { type: 'takeDamage', amount: 4 }, { type: 'takeDamage', amount: 4 });
		expect(view(c).live.pendingWounds).toBe(2);
		const after = act(c, {
			type: 'endCombat',
			rolls: [
				{ dice: [3], source: 'app' },
				{ dice: [5], source: 'manual' }
			]
		});
		expect(view(after).live).toMatchObject({ pendingWounds: 0, woundMalus: 8, maxTp: 11, tp: 11 });
		const again = act(after, { type: 'takeDamage', amount: 4 }, { type: 'endCombat', rolls: [{ dice: [2], source: 'app' }] });
		expect(view(again).live).toMatchObject({ woundMalus: 10, maxTp: 9 });
	});

	it('geheilte Wundenpunkte senken den Wundenmalus; danach lassen sich die TP wieder ganz auffüllen', () => {
		const wounded = act(
			finished(),
			{ type: 'takeDamage', amount: 4 },
			{ type: 'endCombat', rolls: [{ dice: [5], source: 'app' }] }
		);
		expect(view(wounded).live).toMatchObject({ woundMalus: 5, maxTp: 14 });
		// Erste Hilfe: −1 Wundenmalus und 1 TP
		const aided = act(wounded, { type: 'healWounds', amount: 1, tp: 1 });
		expect(view(aided).live).toMatchObject({ woundMalus: 4, maxTp: 15 });
		const healed = act(aided, { type: 'healWounds', amount: 9 });
		expect(view(healed).live).toMatchObject({ woundMalus: 0, maxTp: 19 });
		expect(view(healed).live.conditions).not.toContain('wunde');
		expect(view(act(healed, { type: 'rest', hours: 1 })).live.tp).toBe(19);
	});

	it('Zustände lassen sich setzen und entfernen', () => {
		const c = act(finished(), { type: 'setCondition', condition: 'infektion', active: true });
		expect(view(c).live.conditions).toContain('infektion');
		expect(view(act(c, { type: 'setCondition', condition: 'infektion', active: false })).live.conditions).not.toContain(
			'infektion'
		);
	});

	it('jeder Wert lässt sich von Hand setzen und wieder zurücksetzen', () => {
		const c = act(
			finished(),
			{ type: 'overrideValue', key: 'maxTp', value: 25 },
			{ type: 'overrideValue', key: 'damageBonus', value: 3 }
		);
		expect(view(c).live).toMatchObject({ maxTp: 25, tp: 25 });
		expect(view(c).live.overrides).toEqual({ maxTp: 25, damageBonus: 3 });
		expect(view(c).secondary.damageBonus.value).toBe(3);
		const reset = act(c, { type: 'overrideValue', key: 'maxTp', value: undefined });
		expect(view(reset).live.maxTp).toBe(19);
	});

	it('aktuelle Werte lassen sich direkt setzen', () => {
		const c = act(finished(), { type: 'setCurrent', key: 'tp', value: 7 }, { type: 'setCurrent', key: 'luck', value: 3 });
		expect(view(c).live).toMatchObject({ tp: 7, luck: 3 });
	});

	it('der Charakter lässt sich zur Bearbeitung wieder öffnen', () => {
		expect(view(act(finished(), { type: 'reopenCreation' })).status).toBe('inCreation');
	});
});
