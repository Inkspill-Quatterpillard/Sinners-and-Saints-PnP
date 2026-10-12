import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);
const view = (c: Character) => computeView(c, ruleData);
const ageStatus = (c: Character) => view(c).steps.find((s) => s.id === 'age')?.status;
const d20 = (n: number) => ({ dice: [n], source: 'manual' as const });

// STR 16, KON 14, GES 12, WAH 12, KLU 10, INT 10, CHA 10, WIL 8
const ATTRS = arrayAttributes();
const human = (...more: Action[]) => play(...ATTRS, { type: 'chooseSpecies', species: 'mensch' }, ...more);

describe('Alter', () => {
	it('ohne Alter ist der Schritt offen', () => {
		expect(ageStatus(human())).toBe('open');
	});

	it.each([
		['mensch', 14, 'child', 0],
		['mensch', 15, 'youth', 0],
		['mensch', 19, 'youth', 0],
		['mensch', 20, 'adult', 0],
		['mensch', 39, 'adult', 0],
		['mensch', 40, 'aging', 1],
		['mensch', 49, 'aging', 1],
		['mensch', 50, 'aging', 2],
		['zwerg', 79, 'adult', 0],
		['zwerg', 80, 'aging', 1],
		['zwerg', 105, 'aging', 3],
		['elf', 79, 'youth', 0],
		['elf', 80, 'adult', 0],
		['elf', 150, 'aging', 1],
		['elf', 189, 'aging', 2]
	] as const)('%s mit %i Jahren: %s, %i Alterungsstufen', (species, years, stage, agingStages) => {
		const v = view(play(...ATTRS, { type: 'chooseSpecies', species }, { type: 'setAge', years }));
		expect(v.ageStep.stage).toBe(stage);
		expect(v.ageStep.agingStages).toBe(agingStages);
	});

	describe('Kinder und Jugendliche', () => {
		it('ein Kind verteilt insgesamt 4 Malus-Punkte frei auf STR, KON und INT', () => {
			const open = human({ type: 'setAge', years: 12 });
			expect(view(open).ageStep.youngMalus).toMatchObject({ required: 4, distributed: 0, attributes: ['STR', 'KON', 'INT'] });
			expect(ageStatus(open)).toBe('open');

			const done = applyAction(
				applyAction(open, { type: 'setYoungMalus', attribute: 'STR', points: 3 }, ruleData),
				{ type: 'setYoungMalus', attribute: 'INT', points: 1 },
				ruleData
			);
			const v = view(done);
			expect(v.attributes.STR.effective).toBe(13);
			expect(v.attributes.INT.effective).toBe(9);
			expect(v.attributes.STR.modifiers).toContainEqual({ source: 'Alter: Kind', value: -3 });
			expect(ageStatus(done)).toBe('valid');
		});

		it('zu viele Malus-Punkte machen den Schritt ungültig', () => {
			const c = human({ type: 'setAge', years: 17 }, { type: 'setYoungMalus', attribute: 'KON', points: 3 });
			expect(ageStatus(c)).toBe('invalid');
		});

		it('Malus-Punkte dürfen kein Attribut unter 5 drücken', () => {
			// INT 10 − 6 wäre 4 (aber ein Kind hat nur 4 Punkte); mit WIL-Array: INT auf 8 legen
			const c = play(
				...arrayAttributes(['STR', 'KON', 'GES', 'WAH', 'KLU', 'CHA', 'WIL', 'INT']),
				{ type: 'chooseSpecies', species: 'zwerg' },
				{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'leben' },
				{ type: 'setAge', years: 10 },
				{ type: 'setYoungMalus', attribute: 'INT', points: 4 }
			);
			// INT 8 − 4 = 4 < 5
			expect(ageStatus(c)).toBe('invalid');
			expect(view(c).issues.some((i) => i.step === 'age' && i.severity === 'invalid')).toBe(true);
		});

		it('Kinder würfeln Glück mit Vorteil und erhalten +2', () => {
			const c = human({ type: 'setAge', years: 10 }, { type: 'rollLuck', roll: { dice: [7, 12], source: 'app' } });
			const v = view(c);
			expect(v.luck.advantage).toBe(true);
			expect(v.secondary.luck.value).toBe(14);
		});

		it('Jugendliche würfeln Glück mit Vorteil, ohne Bonus', () => {
			const c = human({ type: 'setAge', years: 16 }, { type: 'rollLuck', roll: { dice: [7, 12], source: 'app' } });
			expect(view(c).secondary.luck.value).toBe(12);
		});

		it('Erwachsene würfeln Glück ohne Vorteil', () => {
			const c = human({ type: 'setAge', years: 25 }, { type: 'rollLuck', roll: { dice: [7, 12], source: 'app' } });
			expect(view(c).luck.advantage).toBe(false);
			expect(view(c).secondary.luck.value).toBe(7);
		});
	});

	describe('Reifewürfe', () => {
		it('ein Erwachsener hat einen Reifewurf; liegt der W20 über dem Wert, steigt das Attribut um 1', () => {
			const c = human({ type: 'setAge', years: 25 });
			expect(view(c).ageStep.maturityRolls).toHaveLength(1);
			expect(ageStatus(c)).toBe('open');
			const rolled = applyAction(c, { type: 'rollMaturity', index: 0, attribute: 'KLU', roll: d20(15) }, ruleData);
			expect(view(rolled).attributes.KLU.effective).toBe(11);
			expect(view(rolled).ageStep.maturityRolls[0]).toMatchObject({ attribute: 'KLU', success: true });
			expect(ageStatus(rolled)).toBe('valid');
		});

		it('ein Wurf gleich dem Wert reicht nicht', () => {
			const c = human({ type: 'setAge', years: 25 }, { type: 'rollMaturity', index: 0, attribute: 'INT', roll: d20(10) });
			expect(view(c).attributes.INT.effective).toBe(10);
			expect(view(c).ageStep.maturityRolls[0].success).toBe(false);
		});

		it('ändert sich der Zielwert, wird der gespeicherte Wurf neu bewertet statt neu gewürfelt', () => {
			const c = human({ type: 'setAge', years: 25 }, { type: 'rollMaturity', index: 0, attribute: 'INT', roll: d20(11) });
			expect(view(c).attributes.INT.effective).toBe(11);
			// INT bekommt jetzt die 12 statt der 10
			const changed = applyAction(c, { type: 'assignAttribute', attribute: 'INT', slot: 3 }, ruleData);
			expect(view(changed).ageStep.maturityRolls[0]).toMatchObject({ roll: d20(11), success: false });
			expect(view(changed).attributes.INT.effective).toBe(12);
		});

		it('pro Alterungsstufe kommt ein Reifewurf hinzu (vorläufig zusätzlich zu dem des Erwachsenen)', () => {
			expect(view(human({ type: 'setAge', years: 55 })).ageStep.maturityRolls).toHaveLength(3);
		});

		it('mehrere Reifewürfe auf dasselbe Attribut zählen nacheinander', () => {
			const c = human(
				{ type: 'setAge', years: 45 },
				{ type: 'rollMaturity', index: 0, attribute: 'KLU', roll: d20(11) },
				{ type: 'rollMaturity', index: 1, attribute: 'KLU', roll: d20(11) }
			);
			// 10 → 11 (11 > 10), dann 11 gegen 11: kein Erfolg
			expect(view(c).attributes.KLU.effective).toBe(11);
			expect(view(c).ageStep.maturityRolls.map((r) => r.success)).toEqual([true, false]);
		});
	});

	describe('Atrophia', () => {
		it('ein alter Mensch verteilt pro Alterungsstufe einen Punkt Atrophia auf ein körperliches Attribut', () => {
			const c = human({ type: 'setAge', years: 52 });
			expect(view(c).ageStep.atrophia).toMatchObject({ required: 2, distributed: 0 });
			const done = applyAction(c, { type: 'setAtrophiaPoints', attribute: 'GES', points: 2 }, ruleData);
			expect(view(done).attributes.GES.effective).toBe(10);
		});

		it('wird der Charakter wieder jünger, gelten alte Atrophia-Punkte nicht mehr', () => {
			const old = applyAction(
				human({ type: 'setAge', years: 52 }),
				{ type: 'setAtrophiaPoints', attribute: 'GES', points: 2 },
				ruleData
			);
			const young = applyAction(old, { type: 'setAge', years: 25 }, ruleData);
			expect(view(young).attributes.GES.effective).toBe(12);
			expect(view(young).issues.filter((i) => i.step === 'age')).toEqual([]);
		});

		it('Zwerge erleiden zwei Atrophia je Alterungsstufe', () => {
			const c = play(...ATTRS, { type: 'chooseSpecies', species: 'zwerg' }, { type: 'setAge', years: 95 });
			expect(view(c).ageStep.atrophia.required).toBe(4);
		});

		it('nur körperliche Attribute sind erlaubt', () => {
			const c = human({ type: 'setAge', years: 45 }, { type: 'setAtrophiaPoints', attribute: 'KLU', points: 1 });
			expect(ageStatus(c)).toBe('invalid');
		});
	});

	describe('Vergreisungswürfe', () => {
		it('alte Elfen würfeln zwei Vergreisungswürfe je Alterungsstufe; liegt der W100 über der STA, sinkt sie um 5', () => {
			// Elf: KON 14 − 2 = 12, WIL 8 → STA (8 + 12) × 2,5 = 50
			const c = play(
				...ATTRS,
				{ type: 'chooseSpecies', species: 'elf' },
				{ type: 'chooseTraitOption', trait: 'blutDerAltenWelt', option: 'charakteristik' },
				{ type: 'setAge', years: 160 }
			);
			const v = view(c);
			expect(v.senility.rolls).toHaveLength(2);
			expect(v.steps.find((s) => s.id === 'age')?.status).toBe('open');
			const rolled = applyAction(
				applyAction(c, { type: 'rollSenility', index: 0, roll: { dice: [80], source: 'app' } }, ruleData),
				{ type: 'rollSenility', index: 1, roll: { dice: [46], source: 'app' } },
				ruleData
			);
			const r = view(rolled);
			// 80 > 50 → 45; 46 > 45 → 40
			expect(r.senility.rolls.map((x) => x.success)).toEqual([true, true]);
			expect(r.secondary.stability.value).toBe(40);
			// Die Vergreisungswürfe sind erledigt; offen sind nur noch die Reifewürfe der Elfe.
			expect(r.senility.rolls.every((x) => x.roll)).toBe(true);
		});

		it('ohne Vergreisungswürfe gibt es keine', () => {
			expect(view(human({ type: 'setAge', years: 25 })).senility.rolls).toEqual([]);
		});
	});

	it('Bewegung sinkt ab den 50ern um 1 je Jahrzehnt', () => {
		// GES 12 + KON 14 = 26 → 8
		expect(view(human({ type: 'setAge', years: 49 })).secondary.movement.value).toBe(8);
		expect(view(human({ type: 'setAge', years: 50 })).secondary.movement.value).toBe(7);
		expect(view(human({ type: 'setAge', years: 93 })).secondary.movement.value).toBe(3);
	});

	it('wechselt die Spezies, ändern sich Altersstufe und benötigte Würfe', () => {
		const c = human({ type: 'setAge', years: 60 });
		expect(view(c).ageStep.stage).toBe('aging');
		const dwarf = applyAction(c, { type: 'chooseSpecies', species: 'zwerg' }, ruleData);
		expect(view(dwarf).ageStep.stage).toBe('adult');
		expect(view(dwarf).ageStep.maturityRolls).toHaveLength(1);
	});

	describe('Altersstufe ohne Jahreszahl', () => {
		it('die Stufe lässt sich direkt wählen; bei „gealtert“ mit Anzahl der Alterungsstufen', () => {
			const c = human({ type: 'setAgeStage', stage: 'aging', agingStages: 2 });
			expect(view(c).ageStep).toMatchObject({ stage: 'aging', agingStages: 2, years: undefined });
			expect(view(c).ageStep.maturityRolls).toHaveLength(3);
		});

		it('ohne Jahre gilt für den Bewegungsabzug der Beginn der Stufe', () => {
			// Mensch, 2. Alterungsstufe: ab 50 Jahren → −1
			expect(view(human({ type: 'setAgeStage', stage: 'aging', agingStages: 2 })).secondary.movement.value).toBe(7);
		});

		it('passt eine eingetragene Jahreszahl nicht zur neuen Stufe, wird sie entfernt', () => {
			const c = human({ type: 'setAge', years: 45 }, { type: 'setAgeStage', stage: 'youth' });
			expect(view(c).ageStep).toMatchObject({ stage: 'youth', years: undefined });
			const same = human({ type: 'setAge', years: 45 }, { type: 'setAgeStage', stage: 'aging', agingStages: 1 });
			expect(view(same).ageStep.years).toBe(45);
		});
	});

	it('Menschen haben höchstens 10 Reifewürfe', () => {
		expect(view(human({ type: 'setAgeStage', stage: 'aging', agingStages: 15 })).ageStep.maturityRolls).toHaveLength(10);
	});

	it('Atrophia: die Ansicht sagt, wie viele Punkte je Attribut höchstens möglich sind (Untergrenze 5)', () => {
		// GES 12 → bis 5 also höchstens 7 Punkte
		expect(view(human({ type: 'setAge', years: 95 })).ageStep.atrophia.maxPerAttribute.GES).toBe(7);
	});

	it('ein Wurf lässt sich zurücksetzen', () => {
		const c = human({ type: 'setAge', years: 25 }, { type: 'rollMaturity', index: 0, attribute: 'KLU', roll: d20(15) });
		const reset = applyAction(c, { type: 'rollMaturity', index: 0, attribute: 'KLU', roll: undefined }, ruleData);
		expect(view(reset).ageStep.maturityRolls[0].roll).toBeUndefined();
	});
});
