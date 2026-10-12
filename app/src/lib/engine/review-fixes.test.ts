import { describe, expect, it } from 'vitest';
import { applyAction, computeView, createCharacter, type Action, type Character } from './index';
import { ruleData, type RuleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const view = (c: Character, rd: RuleData = ruleData) => computeView(c, rd);
const act = (c: Character, ...actions: Action[]) => actions.reduce((x, a) => applyAction(x, a, ruleData), c);
const d = (...dice: number[]) => ({ dice, source: 'manual' as const });

// KON 14 → TP 19, Wundschwelle 3
const base = () => playWith(ruleData, ...arrayAttributes(), { type: 'chooseSpecies', species: 'mensch' });

describe('Glück im Spiel', () => {
	it('Kinder behalten ihren Bonus von +2 auch beim Neuwürfeln im Spiel', () => {
		const child = act(base(), { type: 'setAge', years: 10 }, { type: 'rollLuck', roll: d(4, 9) });
		expect(view(child).live.luck).toBe(11);
		expect(view(act(child, { type: 'rerollLuck', roll: d(3, 7) })).live.luck).toBe(9);
		expect(view(act(child, { type: 'rest', hours: 4, luck: d(12, 2) })).live.luck).toBe(14);
	});
});

describe('Kampfunfähig', () => {
	it('fällt ein Charakter ohne Wunde auf 0 TP, erhält er nach dem Kampf ebenfalls eine schwere Wunde', () => {
		const c = act(
			base(),
			{ type: 'takeDamage', amount: 3 },
			{ type: 'takeDamage', amount: 3 },
			{ type: 'takeDamage', amount: 3 }
		);
		expect(view(c).live.pendingWounds).toBe(0);
		const down = act(
			c,
			{ type: 'takeDamage', amount: 3 },
			{ type: 'takeDamage', amount: 3 },
			{ type: 'takeDamage', amount: 3 },
			{ type: 'takeDamage', amount: 1 }
		);
		expect(view(down).live).toMatchObject({ tp: 0, pendingWounds: 1 });
		expect(view(down).live.conditions).toContain('kampfunfaehig');
		expect(view(down).live.conditions).not.toContain('sterbend');
	});

	it('im Sterben liegt nur, wer schon vorher eine schwere Wunde hatte', () => {
		// Ein Treffer von 10 gibt zwei Wunden, aber TP bleiben über 0; der nächste Treffer bringt den Charakter auf 0
		const c = act(base(), { type: 'takeDamage', amount: 10 }, { type: 'takeDamage', amount: 9 });
		expect(view(c).live.conditions).toContain('sterbend');
		// Wird ein Charakter ohne vorherige Wunde mit einem verwundenden Treffer auf 0 gebracht, ist er kampfunfähig
		const one = act(
			base(),
			{ type: 'takeDamage', amount: 2 },
			{ type: 'takeDamage', amount: 2 },
			{ type: 'takeDamage', amount: 2 },
			{ type: 'takeDamage', amount: 2 },
			{ type: 'takeDamage', amount: 2 },
			{ type: 'takeDamage', amount: 2 },
			{ type: 'takeDamage', amount: 2 },
			{ type: 'takeDamage', amount: 2 },
			{ type: 'takeDamage', amount: 3 }
		);
		expect(view(one).live.tp).toBe(0);
		expect(view(one).live.conditions).toContain('kampfunfaehig');
	});
});

describe('Werte direkt setzen', () => {
	it('TP bleiben zwischen 0 und dem Maximum, Stabilität höchstens beim Maximum', () => {
		const c = act(base(), { type: 'setCurrent', key: 'tp', value: 30 }, { type: 'setCurrent', key: 'stability', value: 99 });
		expect(view(c).live).toMatchObject({ tp: 19, stability: view(c).live.maxStability });
		expect(view(act(c, { type: 'setCurrent', key: 'tp', value: -4 })).live.tp).toBe(0);
	});
});

describe('Warnungen im lebenden Bogen', () => {
	it('liefert die Warnung „unter halber Start-Stabilität“ fertig berechnet', () => {
		const c = act(base(), { type: 'setStabilityStart', value: 50 }, { type: 'setCurrent', key: 'stability', value: 25 });
		expect(view(c).live.stabilityWarning).toBe(false);
		expect(view(act(c, { type: 'setCurrent', key: 'stability', value: 24 })).live.stabilityWarning).toBe(true);
	});
});

describe('Attribute mit Halb- und Fünftelwert', () => {
	it('die Ansicht liefert ½ und ⅕ der Grundattribute', () => {
		expect(view(base()).attributes.STR).toMatchObject({ effective: 16, half: 8, fifth: 3 });
	});
});

describe('Zauber: wählbare Zauber', () => {
	it('die Ansicht sagt, welche Zauber gerade noch wählbar sind', () => {
		const c = act(base(), { type: 'assignHeroSkill', slot: 1, skill: 'mystik' });
		const mystik = () => view(c2).magicStep.disciplines.find((x) => x.skill === 'mystik')!;
		const tier2 = ruleData.magic.spells.filter((s) => s.skill === 'mystik' && s.tier === 2).map((s) => s.id);
		let c2 = c;
		// Mystik 12: vier Zauber, höchstens einer der Stufe II
		expect(tier2.every((id) => mystik().selectable.includes(id))).toBe(true);
		c2 = act(c, { type: 'toggleSpell', spell: tier2[0] });
		expect(mystik().selectable.some((id) => tier2.includes(id))).toBe(false);
	});
});

describe('Hinweis auf geänderte Regeldaten', () => {
	it('bleibt bestehen, solange der Charakter ungültig ist, auch nach weiteren Aktionen', () => {
		const EIGHT = ['akrobatik', 'klettern', 'schleichen', 'navigieren', 'sondieren', 'beschwatzen', 'ersteHilfe', 'reiten'];
		const old = { ...ruleData, version: ruleData.version - 1 };
		let c = EIGHT.reduce(
			(x, skill) => applyAction(x, { type: 'toggleProfessionSkill', skill }, old),
			createCharacter('x', old.version)
		);
		const stricter: RuleData = { ...ruleData, profession: { ...ruleData.profession, professionSkillCount: 7 } };
		expect(view(c, stricter).ruleDataChanged).toBe(true);
		c = applyAction(c, { type: 'setName', name: 'Agnes' }, stricter);
		expect(view(c, stricter).ruleDataChanged).toBe(true);
		c = applyAction(c, { type: 'toggleProfessionSkill', skill: 'reiten' }, stricter);
		expect(view(c, stricter).ruleDataChanged).toBe(false);
	});
});
