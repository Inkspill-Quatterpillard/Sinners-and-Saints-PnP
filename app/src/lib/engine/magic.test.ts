import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData, type RuleData } from '$lib/ruleData';
import { arrayAttributes, playWith, testRuleData } from './testing/fixtures';

const view = (c: Character, rd: RuleData = ruleData) => computeView(c, rd);
const status = (c: Character, rd: RuleData = ruleData) => view(c, rd).steps.find((s) => s.id === 'magic')?.status;
const discipline = (c: Character, skill: string, rd: RuleData = ruleData) =>
	view(c, rd).magicStep.disciplines.find((x) => x.skill === skill)!;
const spell = (skill: string, tier: number, n = 0) =>
	ruleData.magic.spells.filter((s) => s.skill === skill && s.tier === tier)[n].id;

/** Testdaten: eine Spezies mit einem einstellbaren Bonus auf Elementaristik. */
function withBonus(bonus: number): RuleData {
	return {
		...testRuleData,
		species: [
			{
				id: 'magier',
				name: 'Magier',
				source: { file: 'test' },
				attributeModifiers: {},
				age: testRuleData.species[0].age,
				traits: [{ id: 'gabe', name: 'Gabe', text: '', effects: [{ type: 'skill', skill: 'elementaristik', value: bonus }] }]
			}
		]
	};
}

const ATTRS = arrayAttributes();
/** Elementaristik als Heldenfertigkeit auf `value` (14/12/10/8) plus Bonus aus den Testdaten. */
function mage(value: 14 | 12 | 10 | 8, bonus = 0, ...more: Action[]) {
	const slot = { 14: 0, 12: 1, 10: 2, 8: 3 }[value];
	const rd = withBonus(bonus);
	return {
		rd,
		c: playWith(
			rd,
			...ATTRS,
			{ type: 'chooseSpecies', species: 'magier' },
			{ type: 'assignHeroSkill', slot, skill: 'elementaristik' },
			...more
		)
	};
}

describe('Zauber', () => {
	it('jede Disziplin hat Zauber; Basiszauber gibt es in einigen Disziplinen', () => {
		expect(ruleData.magic.spells.length).toBeGreaterThan(80);
		expect(
			ruleData.magic.spells
				.filter((s) => s.tier === 0)
				.map((s) => s.skill)
				.sort()
		).toEqual(['elementaristik', 'illusion', 'verzauberung']);
	});

	it.each([
		[8, 0, 2, 1, 0, 0],
		[10, 0, 3, 1, 0, 0],
		[12, 0, 4, 2, 1, 0],
		[14, 0, 5, 2, 2, 0],
		[14, 2, 6, 2, 3, 0],
		[14, 4, 7, 3, 3, 1],
		[14, 6, 8, 3, 3, 3]
	] as const)(
		'Elementaristik %i + %i: %i Zauber, bis Stufe %i (höchstens %i der Stufe II, %i der Stufe III)',
		(value, bonus, total, maxTier, tier2, tier3) => {
			const { c, rd } = mage(value, bonus);
			expect(discipline(c, 'elementaristik', rd).contingent).toEqual({ total, maxTier, tier2, tier3 });
		}
	);

	it('unter 6 Punkten gibt es keine Zauber außer Basiszaubern', () => {
		const c = playWith(ruleData, ...ATTRS);
		// Elementaristik ⅕ WIL 8 = 1, nicht gelernt
		expect(discipline(c, 'elementaristik').contingent.total).toBe(0);
		expect(discipline(c, 'elementaristik').basics).toEqual([]);
	});

	it('Basiszauber gibt es automatisch, sobald die Fertigkeit gelernt ist', () => {
		const { c, rd } = mage(8);
		expect(discipline(c, 'elementaristik', rd).basics).toEqual(['elementaristik:energieBuendelnUndWerfen']);
	});

	it('Zauber lassen sich im Rahmen des Kontingents wählen', () => {
		const { c, rd } = mage(
			12,
			0,
			{ type: 'toggleSpell', spell: spell('elementaristik', 2) },
			{ type: 'toggleSpell', spell: spell('elementaristik', 1) }
		);
		expect(discipline(c, 'elementaristik', rd).chosen).toHaveLength(2);
		expect(status(c, rd)).toBe('valid');
	});

	it('mehr als erlaubt, zu hohe Stufen oder zu viele Stufe-II-Zauber lassen sich nicht wählen', () => {
		const tooHigh = mage(10, 0, { type: 'toggleSpell', spell: spell('elementaristik', 2) });
		expect(discipline(tooHigh.c, 'elementaristik', tooHigh.rd).chosen).toEqual([]);
		const tooMany = mage(
			12,
			0,
			{ type: 'toggleSpell', spell: spell('elementaristik', 2, 0) },
			{ type: 'toggleSpell', spell: spell('elementaristik', 2, 1) }
		);
		expect(discipline(tooMany.c, 'elementaristik', tooMany.rd).chosen).toHaveLength(1);
	});

	it('Basiszauber sind nicht wählbar (sie gibt es ohnehin)', () => {
		const { c, rd } = mage(8, 0, { type: 'toggleSpell', spell: 'elementaristik:energieBuendelnUndWerfen' });
		expect(discipline(c, 'elementaristik', rd).chosen).toEqual([]);
	});

	it('sinkt der Wert, werden zu viele Zauber ungültig', () => {
		const { c, rd } = mage(
			14,
			0,
			{ type: 'toggleSpell', spell: spell('elementaristik', 2, 0) },
			{ type: 'toggleSpell', spell: spell('elementaristik', 2, 1) }
		);
		expect(status(c, rd)).toBe('valid');
		const lowered = applyAction(c, { type: 'assignHeroSkill', slot: 1, skill: 'elementaristik' }, rd);
		// 12: nur ein Zauber der Stufe II
		expect(status(lowered, rd)).toBe('invalid');
	});

	it('die Kontingenttabelle ist in den Regeldaten als vorläufig markiert', () => {
		expect(ruleData.magic.provisional?.[0].question).toBe('W6');
	});
});
