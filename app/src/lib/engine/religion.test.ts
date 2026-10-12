import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);
const view = (c: Character) => computeView(c, ruleData);
const status = (c: Character) => view(c).steps.find((s) => s.id === 'religion')?.status;
const skill = (c: Character, key: string) => view(c).skills.find((s) => s.key === key)!;

// STR 16, KON 14, GES 12, WAH 12, KLU 10, INT 10, CHA 10, WIL 8
const ATTRS = arrayAttributes();

describe('Religion', () => {
	it('es gibt neun Religionen; ohne Wahl ist der Schritt offen', () => {
		expect(ruleData.religions).toHaveLength(9);
		expect(status(play(...ATTRS))).toBe('open');
	});

	it('eine Religion ohne Wahl ist sofort gültig und zeigt ihren Segen als Text', () => {
		const c = play(...ATTRS, { type: 'chooseReligion', religion: 'kultDesLanhann' });
		expect(status(c)).toBe('valid');
		expect(view(c).religionStep.trait?.name).toBe('Hand des Vaters');
		expect(view(c).religionStep.trait?.text).toContain('Gegenproben');
	});

	describe('Kirche der Acht', () => {
		it('verlangt die Wahl eines Gottes, der +1 auf ein Attribut gibt', () => {
			const c = play(...ATTRS, { type: 'chooseReligion', religion: 'kircheDerAcht' });
			expect(status(c)).toBe('open');
			const chosen = applyAction(c, { type: 'chooseTraitOption', trait: 'kircheDerAcht', option: 'nex' }, ruleData);
			expect(view(chosen).attributes.KLU.effective).toBe(11);
			expect(view(chosen).attributes.KLU.modifiers).toContainEqual({ source: 'Göttliches Zeichen', value: 1 });
			expect(status(chosen)).toBe('valid');
		});
	});

	describe('Herrin des Waldes', () => {
		it('+2 auf eine beliebige Fertigkeit, auch eine Heldenfertigkeit', () => {
			const c = play(
				...ATTRS,
				{ type: 'chooseReligion', religion: 'kultDerHerrinDesWaldes' },
				{ type: 'chooseTraitSkill', trait: 'kultDerHerrinDesWaldes', skill: 'boegen' }
			);
			// Bögen ⅕ WAH 12 = 2 + 2
			expect(skill(c, 'boegen').value).toBe(4);
			expect(status(c)).toBe('valid');
		});

		it('der Bonus wirkt auch über 20', () => {
			const c = play(
				...ATTRS,
				{ type: 'assignHeroSkill', slot: 0, skill: 'schwerter' },
				{ type: 'chooseReligion', religion: 'kultDerHerrinDesWaldes' },
				{ type: 'chooseTraitSkill', trait: 'kultDerHerrinDesWaldes', skill: 'schwerter' }
			);
			expect(skill(c, 'schwerter').value).toBe(16);
		});

		it('ohne gewählte Fertigkeit bleibt der Schritt offen', () => {
			expect(status(play(...ATTRS, { type: 'chooseReligion', religion: 'kultDerHerrinDesWaldes' }))).toBe('open');
		});
	});

	describe('Schwarzer Kult', () => {
		it('+1 auf eine beliebige Fertigkeit, aber keine Heldenfertigkeit', () => {
			const ok = play(
				...ATTRS,
				{ type: 'chooseReligion', religion: 'schwarzerKultVonSeraphir' },
				{ type: 'chooseTraitSkill', trait: 'schwarzerKultVonSeraphir', skill: 'okkultismus' }
			);
			expect(skill(ok, 'okkultismus').value).toBe(3);
			const hero = applyAction(ok, { type: 'chooseTraitSkill', trait: 'schwarzerKultVonSeraphir', skill: 'mystik' }, ruleData);
			expect(status(hero)).toBe('invalid');
			expect(skill(hero, 'mystik').bonuses).toEqual([]);
		});

		it('eine gewählte Spezialisierung, die entfernt wird, macht die Wahl ungültig', () => {
			const c = play(
				...ATTRS,
				{ type: 'addSpecialization', skill: 'natur', specialization: 'Kräuter' },
				{ type: 'chooseReligion', religion: 'schwarzerKultVonSeraphir' },
				{ type: 'chooseTraitSkill', trait: 'schwarzerKultVonSeraphir', skill: 'natur:Kräuter' },
				{ type: 'removeSpecialization', skill: 'natur', specialization: 'Kräuter' }
			);
			expect(status(c)).toBe('invalid');
		});
	});

	describe('Kult der Dana', () => {
		it('Glück mit Vorteil', () => {
			const c = play(
				...ATTRS,
				{ type: 'chooseReligion', religion: 'kultDerDana' },
				{ type: 'setAge', years: 30 },
				{ type: 'rollLuck', roll: { dice: [3, 15], source: 'app' } }
			);
			expect(view(c).luck).toMatchObject({ advantage: true, dice: 2 });
			expect(view(c).secondary.luck.value).toBe(15);
		});

		it('zusammen mit der Jugend ein doppelter Vorteil: drei Würfel, der höchste zählt', () => {
			const c = play(
				...ATTRS,
				{ type: 'chooseSpecies', species: 'mensch' },
				{ type: 'setAge', years: 16 },
				{ type: 'chooseReligion', religion: 'kultDerDana' },
				{ type: 'rollLuck', roll: { dice: [3, 9, 17], source: 'app' } }
			);
			expect(view(c).luck).toMatchObject({ advantage: true, dice: 3 });
			expect(view(c).secondary.luck.value).toBe(17);
		});
	});

	describe('Kult der sieben Erzdämonen', () => {
		it('verlangt die Wahl eines Höllenkreises', () => {
			const c = play(...ATTRS, { type: 'chooseReligion', religion: 'kultDerSiebenErzdaemonen' });
			expect(view(c).religionStep.trait?.options).toHaveLength(7);
			expect(status(c)).toBe('open');
			expect(
				status(applyAction(c, { type: 'chooseTraitOption', trait: 'kultDerSiebenErzdaemonen', option: 'kreis3' }, ruleData))
			).toBe('valid');
		});
	});

	it('der Kult des Allvaters gibt eine Ressource für einmal am Tag', () => {
		const c = play(...ATTRS, { type: 'chooseReligion', religion: 'kultDesAllvaters' });
		expect(view(c).resources).toContainEqual(expect.objectContaining({ id: 'zeichenDesBerges', per: 'day', uses: 1 }));
	});

	it('ein Religionswechsel behält die frühere Wahl, wendet sie aber nicht mehr an', () => {
		const c = play(
			...ATTRS,
			{ type: 'chooseReligion', religion: 'kircheDerAcht' },
			{ type: 'chooseTraitOption', trait: 'kircheDerAcht', option: 'vaerun' },
			{ type: 'chooseReligion', religion: 'kultDesLanhann' }
		);
		expect(view(c).attributes.STR.effective).toBe(16);
		const back = applyAction(c, { type: 'chooseReligion', religion: 'kircheDerAcht' }, ruleData);
		expect(view(back).attributes.STR.effective).toBe(17);
	});
});
