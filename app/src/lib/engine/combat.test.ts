import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData, type RuleData } from '$lib/ruleData';
import { arrayAttributes, playWith, testRuleData } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);
const view = (c: Character, rd: RuleData = ruleData) => computeView(c, rd);
const status = (c: Character, rd: RuleData = ruleData) => view(c, rd).steps.find((s) => s.id === 'combat')?.status;
const unlocks = (c: Character, skill: string, rd: RuleData = ruleData) =>
	view(c, rd).combatStep.skills.find((s) => s.skill === skill)!;
const technique = (skill: string, tier: number, n = 0) =>
	ruleData.combat.techniques.filter((t) => t.skill === skill && t.tier === tier)[n].id;

const ATTRS = arrayAttributes();
// Schwerter 14, Bögen 12, Faustkampf 10, Dolche 8, Mystik 8
const HEROES: Action[] = [
	{ type: 'assignHeroSkill', slot: 0, skill: 'schwerter' },
	{ type: 'assignHeroSkill', slot: 1, skill: 'boegen' },
	{ type: 'assignHeroSkill', slot: 2, skill: 'faustkampf' },
	{ type: 'assignHeroSkill', slot: 3, skill: 'dolcheUndMesser' },
	{ type: 'assignHeroSkill', slot: 4, skill: 'mystik' }
];

/** Testdaten: eine Spezies mit +4 auf Schwerter, damit 18 Punkte erreichbar sind. */
const veteranData: RuleData = {
	...testRuleData,
	species: [
		...testRuleData.species,
		{
			id: 'veteran',
			name: 'Veteran',
			source: { file: 'test' },
			attributeModifiers: {},
			age: testRuleData.species[0].age,
			traits: [{ id: 'drill', name: 'Drill', text: '+4 Schwerter', effects: [{ type: 'skill', skill: 'schwerter', value: 4 }] }]
		}
	]
};

describe('Kampftechniken', () => {
	it('alle Waffengattungen haben Techniken der Stufen I bis III', () => {
		for (const skill of ruleData.combat.meleeSkills.concat(ruleData.combat.rangedSkills)) {
			expect(new Set(ruleData.combat.techniques.filter((t) => t.skill === skill).map((t) => t.tier))).toEqual(new Set([1, 2, 3]));
		}
	});

	it.each([
		['dolcheUndMesser', 8, 0, 0],
		['faustkampf', 10, 1, 1],
		['boegen', 12, 2, 1],
		['schwerter', 14, 3, 2]
	])('%s mit %i Punkten: %i Techniken bis Stufe %i', (skill, value, count, maxTier) => {
		expect(unlocks(play(...ATTRS, ...HEROES), skill)).toMatchObject({ value, allowed: count, maxTier });
	});

	it('ab 18 Punkten ist Stufe III frei', () => {
		const c = playWith(veteranData, ...ATTRS, ...HEROES, { type: 'chooseSpecies', species: 'veteran' });
		expect(unlocks(c, 'schwerter', veteranData)).toMatchObject({ value: 18, allowed: 5, maxTier: 3 });
	});

	it('gewählte Techniken innerhalb der Freischaltung sind gültig', () => {
		const c = play(
			...ATTRS,
			...HEROES,
			{ type: 'toggleTechnique', technique: technique('schwerter', 2) },
			{ type: 'toggleTechnique', technique: technique('faustkampf', 1) }
		);
		expect(status(c)).toBe('valid');
		expect(unlocks(c, 'schwerter').chosen).toEqual([technique('schwerter', 2)]);
	});

	it('eine Technik über der freigeschalteten Stufe lässt sich nicht wählen', () => {
		const c = play(...ATTRS, ...HEROES, { type: 'toggleTechnique', technique: technique('faustkampf', 2) });
		expect(unlocks(c, 'faustkampf').chosen).toEqual([]);
	});

	it('mehr Techniken als freigeschaltet lassen sich nicht wählen', () => {
		const c = play(
			...ATTRS,
			...HEROES,
			{ type: 'toggleTechnique', technique: technique('faustkampf', 1, 0) },
			{ type: 'toggleTechnique', technique: technique('faustkampf', 1, 1) }
		);
		expect(unlocks(c, 'faustkampf').chosen).toHaveLength(1);
	});

	it('sinkt der Fertigkeitswert, werden zu viele oder zu hohe Techniken ungültig', () => {
		const c = play(...ATTRS, ...HEROES, { type: 'toggleTechnique', technique: technique('schwerter', 2) });
		// Schwerter wandert auf den 10er-Platz
		const lowered = applyAction(c, { type: 'assignHeroSkill', slot: 2, skill: 'schwerter' }, ruleData);
		expect(status(lowered)).toBe('invalid');
		expect(view(lowered).issues.some((i) => i.step === 'combat' && i.severity === 'invalid')).toBe(true);
	});

	it('ohne gewählte Techniken ist der Schritt gültig (Techniken sind freiwillig)', () => {
		expect(status(play(...ATTRS, ...HEROES))).toBe('valid');
	});
});

describe('Kampfstile', () => {
	it('unter 18 Punkten gibt es keinen Kampfstil', () => {
		const c = play(...ATTRS, ...HEROES, { type: 'chooseStyle', style: 'kampfstilDesWolfes' });
		expect(view(c).combatStep.styleAllowed).toEqual({ melee: false, ranged: false });
		expect(status(c)).toBe('invalid');
	});

	it('ab 18 Punkten in einer Nahkampffertigkeit ist ein Nahkampfstil wählbar, aber kein Fernkampfstil', () => {
		const c = playWith(veteranData, ...ATTRS, ...HEROES, { type: 'chooseSpecies', species: 'veteran' });
		expect(view(c, veteranData).combatStep.styleAllowed).toEqual({ melee: true, ranged: false });
		const melee = applyAction(c, { type: 'chooseStyle', style: 'kampfstilDesWolfes' }, veteranData);
		expect(status(melee, veteranData)).toBe('valid');
		const ranged = applyAction(c, { type: 'chooseStyle', style: 'kampfstilDesWindhundes' }, veteranData);
		expect(status(ranged, veteranData)).toBe('invalid');
	});

	it('ein Kampfstil lässt sich wieder abwählen', () => {
		const c = play(...ATTRS, { type: 'chooseStyle', style: 'kampfstilDesWolfes' }, { type: 'chooseStyle', style: undefined });
		expect(view(c).combatStep.style).toBeUndefined();
		expect(status(c)).toBe('valid');
	});
});
