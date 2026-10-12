/**
 * Referenzcharaktere: vollständig von Hand nachgerechnete Charaktere als Regressionstests über die gesamte Erstellung.
 * Sie laufen gegen die echten Regeldaten. Ändert sich ein Ergebnis, hat sich entweder eine Regel oder der Regelkern geändert.
 */
import { describe, expect, it } from 'vitest';
import { applyAction, computeView, createCharacter, type Action, type Character, type CharacterView } from './index';
import { ruleData, type AttributeId } from '$lib/ruleData';

const play = (...actions: Action[]): Character =>
	actions.reduce((c, a) => applyAction(c, a, ruleData), createCharacter('ref', ruleData.version));
const roll = (...dice: number[]) => ({ dice, source: 'manual' as const });

/** Grundattribute über eingetragene 4W6-Würfe (ein gestrichener Würfel mit 1). */
function attributes(values: Record<AttributeId, number>): Action[] {
	const dice = (v: number) => {
		const a = Math.min(6, v - 2);
		const b = Math.min(6, v - a - 1);
		return [a, b, v - a - b, 1];
	};
	const order = Object.keys(values) as AttributeId[];
	return [
		{ type: 'setAttributeMethod', method: 'roll' },
		...order.flatMap((attribute, slot): Action[] => [
			{ type: 'rollAttributeSlot', slot, roll: roll(...dice(values[attribute])) },
			{ type: 'assignAttribute', attribute, slot }
		])
	];
}
const profession = (name: string, skills: string[], die: number): Action[] => [
	{ type: 'setProfessionName', name },
	...skills.map((skill): Action => ({ type: 'toggleProfessionSkill', skill })),
	{ type: 'rollStatus', roll: roll(die) }
];
const heroes = (...skills: string[]): Action[] => skills.map((skill, slot): Action => ({ type: 'assignHeroSkill', slot, skill }));
const interests = (points: Record<string, number>): Action[] =>
	Object.entries(points).map(([target, n]): Action => ({ type: 'setInterestPoints', target, points: n }));
const technique = (skill: string, tier: number) =>
	ruleData.combat.techniques.find((t) => t.skill === skill && t.tier === tier)!.id;

const attrs = (v: CharacterView) => Object.fromEntries(ruleData.attributes.map((a) => [a.id, v.attributes[a.id].effective]));
const secondary = (v: CharacterView) => ({
	tp: v.secondary.tp.value,
	stability: v.secondary.stability.value,
	magicPoints: v.secondary.magicPoints.value,
	luck: v.secondary.luck.value,
	movement: v.secondary.movement.value,
	dodge: v.secondary.dodge.value,
	damageBonus: v.secondary.damageBonus.value,
	woundThreshold: v.secondary.woundThreshold.value
});
const skill = (v: CharacterView, key: string) => v.skills.find((s) => s.key === key)?.value;
const problems = (v: CharacterView) => [
	...v.steps.filter((s) => s.status !== 'valid'),
	...v.issues.filter((i) => i.severity === 'invalid')
];

describe('Referenzcharakter Mensch: Gelehrter, 45 Jahre, Kirche der Acht, Charakteristik, Magie', () => {
	const v = computeView(
		play(
			...attributes({ STR: 14, KON: 13, GES: 12, WAH: 11, KLU: 15, INT: 9, CHA: 10, WIL: 12 }),
			{ type: 'chooseSpecies', species: 'mensch' },
			{ type: 'setAge', years: 45 },
			{ type: 'rollMaturity', index: 0, attribute: 'KLU', roll: roll(18) },
			{ type: 'rollMaturity', index: 1, attribute: 'KLU', roll: roll(12) },
			{ type: 'setAtrophiaPoints', attribute: 'GES', points: 1 },
			{ type: 'chooseReligion', religion: 'kircheDerAcht' },
			{ type: 'chooseTraitOption', trait: 'kircheDerAcht', option: 'vaerun' },
			{ type: 'setCharacteristicMode', mode: 'free' },
			{ type: 'pickCharacteristic', slot: 0, characteristic: 'muskelberg' },
			...profession(
				'Gelehrter',
				['kalkulation', 'medizin', 'recherche', 'sprachkunst', 'okkultismus', 'religion', 'inspizieren', 'menschenkenntnis'],
				5
			),
			...heroes('mystik', 'faustkampf', 'dolcheUndMesser', 'elementaristik', 'boegen'),
			...interests({ medizin: 12, status: 3, recherche: 10, sprachkunst: 7 }),
			{ type: 'rollLuck', roll: roll(9) },
			{ type: 'rollSenility', index: 0, roll: roll(75) },
			{ type: 'toggleStunt', stunt: 'reporter' },
			{ type: 'toggleSpell', spell: 'mystik:auraAnalysieren' },
			{ type: 'toggleSpell', spell: 'mystik:magieStoeren' },
			{ type: 'toggleSpell', spell: 'elementaristik:energieFormen' },
			{ type: 'addItem', catalogId: 'standard:leichteRuestung:gambeson' },
			{ type: 'setName', name: 'Magister Anselm' }
		),
		ruleData
	);

	it('ist vollständig und gültig', () => {
		expect(problems(v)).toEqual([]);
		expect(v.canFinish).toBe(true);
	});

	it('Grundattribute: Spezies, Reifewurf, Atrophia, Göttliches Zeichen und Muskelberg', () => {
		// STR 14 + 1 (Vaerun) + 1 (Muskelberg); KLU 15 + 1 (Reifewurf 18 > 15; zweiter Wurf 12 nicht über 16);
		// GES 12 − 1 (Atrophia); WAH 11 − 1, WIL 12 − 1, CHA 10 + 1 (Mensch)
		expect(attrs(v)).toEqual({ STR: 16, KON: 13, GES: 11, WAH: 10, KLU: 16, INT: 9, CHA: 11, WIL: 11 });
	});

	it('Sekundärattribute', () => {
		// TP 13 + 5; STA (11 + 13) × 2,5 = 60, Vergreisungswurf 75 > 60: −5; MP 11/2 = 5 + 16/5 = 3;
		// BEW: GES + KON = 24 → 8, Muskelberg −1; Ausweichen (11 + 10)/2 = 10; SB bei STR 16: +2; WS 18/5 = 3
		expect(secondary(v)).toEqual({
			tp: 18,
			stability: 55,
			magicPoints: 8,
			luck: 9,
			movement: 7,
			dodge: 10,
			damageBonus: 2,
			woundThreshold: 3
		});
	});

	it('Fertigkeiten, Status und Ausstattung', () => {
		// Medizin ⅕ KLU 16 = 3 + 5 + 12; Recherche ⅕ WAH 10 = 2 + 5 + 10; Sprachkunst 3 + 5 + 7; Kalkulation 3 + 5
		expect([skill(v, 'medizin'), skill(v, 'recherche'), skill(v, 'sprachkunst'), skill(v, 'kalkulation')]).toEqual([
			20, 17, 15, 8
		]);
		expect([skill(v, 'mystik'), skill(v, 'faustkampf'), skill(v, 'elementaristik')]).toEqual([14, 12, 8]);
		// Status 5 + 2 (W6: 5) + 3 = 10: wohlhabend, 30 Kronen − 10 Kronen Gambeson
		expect(v.socialStatus.value).toBe(10);
		expect(v.equipmentStep).toMatchObject({ stage: 'wohlhabend', purse: 3000, remaining: 2000 });
	});

	it('Magie: Kontingent und Basiszauber', () => {
		const mystik = v.magicStep.disciplines.find((d) => d.skill === 'mystik')!;
		const elementaristik = v.magicStep.disciplines.find((d) => d.skill === 'elementaristik')!;
		expect(mystik.contingent).toEqual({ total: 5, maxTier: 2, tier2: 2, tier3: 0 });
		expect(elementaristik.basics).toEqual(['elementaristik:energieBuendelnUndWerfen']);
		expect(elementaristik.chosen).toEqual(['elementaristik:energieFormen']);
	});
});

describe('Referenzcharakter Zwerg: Schmied, 90 Jahre, Blutmagier, Eherner Wille ohne Charakteristik', () => {
	const v = computeView(
		play(
			{ type: 'setOptionalRule', rule: 'besondereHerkunft', enabled: true },
			...attributes({ STR: 15, KON: 16, GES: 10, WAH: 12, KLU: 13, INT: 11, CHA: 8, WIL: 14 }),
			{ type: 'chooseSpecies', species: 'zwerg' },
			{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'keineCharakteristik' },
			{ type: 'setAge', years: 90 },
			{ type: 'rollMaturity', index: 0, attribute: 'INT', roll: roll(15) },
			{ type: 'rollMaturity', index: 1, attribute: 'INT', roll: roll(12) },
			{ type: 'rollMaturity', index: 2, attribute: 'KLU', roll: roll(20) },
			{ type: 'setAtrophiaPoints', attribute: 'STR', points: 2 },
			{ type: 'setAtrophiaPoints', attribute: 'KON', points: 1 },
			{ type: 'setAtrophiaPoints', attribute: 'GES', points: 1 },
			{ type: 'chooseReligion', religion: 'kultDesAllvaters' },
			{ type: 'setCharacteristicMode', mode: 'none' },
			{ type: 'chooseOriginOrStunt', choice: 'origin' },
			{ type: 'chooseOrigin', origin: 'blutmagier' },
			{ type: 'addSpecialization', skill: 'handwerkUndKuenste', specialization: 'Schmieden' },
			{ type: 'addSpecialization', skill: 'natur', specialization: 'Gebirge' },
			...profession(
				'Schmied',
				[
					'reparierenUndKonstruieren',
					'handwerkUndKuenste:Schmieden',
					'inspizieren',
					'kalkulation',
					'autoritaet',
					'selbstbeherrschung',
					'natur:Gebirge',
					'umgangMitTieren'
				],
				4
			),
			...heroes('hiebwaffen', 'faustkampf', 'wurfwaffen', 'armbruesteUndSchusswaffen', 'stangenwaffen'),
			...interests({
				reparierenUndKonstruieren: 4,
				vorstellungskraft: 6,
				inspizieren: 8,
				status: 4,
				'handwerkUndKuenste:Schmieden': 6
			}),
			{ type: 'rollLuck', roll: roll(14) },
			{ type: 'toggleStunt', stunt: 'bastler' },
			{ type: 'toggleTechnique', technique: technique('hiebwaffen', 2) },
			{ type: 'toggleTechnique', technique: technique('hiebwaffen', 1) },
			{ type: 'setName', name: 'Borgrim' }
		),
		ruleData
	);

	it('ist vollständig und gültig', () => {
		expect(problems(v)).toEqual([]);
	});

	it('Altersstufe: zwei Alterungsstufen, drei Reifewürfe, vier Atrophia', () => {
		expect(v.ageStep).toMatchObject({ stage: 'aging', agingStages: 2 });
		expect(v.ageStep.maturityRolls.map((r) => r.success)).toEqual([true, false, true]);
		expect(v.senility.rolls).toEqual([]);
	});

	it('Grundattribute', () => {
		// STR 15 + 1 (Zwerg) − 2 (Atrophia); KON 16 + 2 − 1 (Atrophia) − 2 (Blutmagier); GES 10 − 1 − 1; WAH 12 − 2;
		// INT 11 + 1 (Reifewurf 15); KLU 13 + 1 (Reifewurf 20)
		expect(attrs(v)).toEqual({ STR: 14, KON: 15, GES: 8, WAH: 10, KLU: 14, INT: 12, CHA: 8, WIL: 14 });
	});

	it('Sekundärattribute', () => {
		// STA (14 + 15) × 2,5 = 72 + 10 (Eherner Wille); MP 7 + 14/5 = 2; BEW 23 → 8, in den 90ern −5;
		// Ausweichen (8 + 10)/2 = 9; SB bei STR 14: +1; WS 20/5 = 4
		expect(secondary(v)).toEqual({
			tp: 20,
			stability: 82,
			magicPoints: 9,
			luck: 14,
			movement: 3,
			dodge: 9,
			damageBonus: 1,
			woundThreshold: 4
		});
	});

	it('Fertigkeiten, Kunststück, Techniken und Ressourcen', () => {
		// Reparieren ½ INT 12 = 6 + 5 + 4; Vorstellungskraft ⅕ INT 12 = 2 + 6; Inspizieren ⅕ WAH 10 = 2 + 5 + 8; Schmieden 2 + 5 + 6
		expect([
			skill(v, 'reparierenUndKonstruieren'),
			skill(v, 'vorstellungskraft'),
			skill(v, 'inspizieren'),
			skill(v, 'handwerkUndKuenste:Schmieden')
		]).toEqual([15, 8, 15, 13]);
		expect(v.stuntStep.allowed).toBe(1);
		expect(v.combatStep.skills.find((s) => s.skill === 'hiebwaffen')).toMatchObject({ allowed: 3, maxTier: 2 });
		expect(v.socialStatus.value).toBe(10);
		expect(v.resources.map((r) => r.id)).toEqual(['zeichenDesBerges']);
	});
});

describe('Referenzcharakter Elf: Jägerin, 17 Jahre, Blut der Alten Welt, zwei Charakteristiken, zweites Kunststück', () => {
	const v = computeView(
		play(
			{ type: 'setOptionalRule', rule: 'besondereHerkunft', enabled: true },
			{ type: 'setAttributeMethod', method: 'array' },
			...(['GES', 'WAH', 'KON', 'KLU', 'STR', 'INT', 'CHA', 'WIL'] as const).map((attribute, slot): Action => ({
				type: 'assignAttribute',
				attribute,
				slot
			})),
			{ type: 'chooseSpecies', species: 'elf' },
			{ type: 'chooseTraitOption', trait: 'blutDerAltenWelt', option: 'attribute' },
			{ type: 'setAge', years: 17 },
			{ type: 'setYoungMalus', attribute: 'STR', points: 1 },
			{ type: 'setYoungMalus', attribute: 'INT', points: 1 },
			{ type: 'chooseReligion', religion: 'kultDerHerrinDesWaldes' },
			{ type: 'chooseTraitSkill', trait: 'kultDerHerrinDesWaldes', skill: 'boegen' },
			{ type: 'setCharacteristicMode', mode: 'roll' },
			{ type: 'rollCharacteristic', slot: 0, roll: roll(25) },
			{ type: 'rollCharacteristic', slot: 1, roll: roll(87) },
			{ type: 'chooseOriginOrStunt', choice: 'stunt' },
			{ type: 'addSpecialization', skill: 'natur', specialization: 'Wald' },
			...profession(
				'Jägerin',
				['faehrtenlesen', 'navigieren', 'schleichen', 'klettern', 'sondieren', 'natur:Wald', 'reiten', 'akrobatik'],
				6
			),
			...heroes('boegen', 'dolcheUndMesser', 'wurfwaffen', 'schwerter', 'faustkampf'),
			...interests({ schleichen: 6, faehrtenlesen: 8, status: 2, sondieren: 6 }),
			{ type: 'rollLuck', roll: roll(6, 15) },
			{ type: 'toggleStunt', stunt: 'spurloseBewegung' },
			{ type: 'toggleStunt', stunt: 'abrollen' },
			{ type: 'toggleTechnique', technique: 'boegen:ueberdehnen' },
			{ type: 'toggleTechnique', technique: 'boegen:flankieren' },
			{ type: 'setName', name: 'Aeronwen' }
		),
		ruleData
	);

	it('ist vollständig und gültig; einzige Warnung: Faustkampf wird unter den Startwert gesetzt', () => {
		expect(problems(v)).toEqual([]);
		expect(v.issues.filter((i) => i.severity === 'warning').map((i) => i.message)).toEqual([
			expect.stringContaining('Faustkampf')
		]);
	});

	it('Grundattribute: Elf, Blut der Alten Welt auf GES, Jugend-Malus', () => {
		// GES 16 + 1 (Elf) + 2 (höchstes); WAH 14 + 2 − 1; KON 12 − 2 − 1; STR 10 − 1 − 1 − 1 (Jugend); INT 10 − 1 − 1 (Jugend);
		// KLU 12 − 1; CHA 10 − 1; WIL 8 − 1
		expect(attrs(v)).toEqual({ STR: 7, KON: 9, GES: 19, WAH: 15, KLU: 11, INT: 8, CHA: 9, WIL: 7 });
	});

	it('Sekundärattribute; Glück mit Vorteil', () => {
		// TP 9 + 5; STA (7 + 9) × 2,5 = 40; MP 7/2 = 3 + 11/5 = 2; BEW 28 → 8; Ausweichen (19 + 15)/2 = 17;
		// SB bei STR 7: −1; WS 14/5 = 2; Glück: höherer von 6 und 15
		expect(secondary(v)).toEqual({
			tp: 14,
			stability: 40,
			magicPoints: 5,
			luck: 15,
			movement: 8,
			dodge: 17,
			damageBonus: -1,
			woundThreshold: 2
		});
	});

	it('Fertigkeiten mit Charakteristik und Religion; Status', () => {
		// Schleichen ½ GES 19 = 9 + 5 + 6; Fährtenlesen ⅕ WAH 15 = 3 + 5 + 8; Sondieren ½ WAH 15 = 7 + 5 + 6;
		// Bögen 14 + 2 (Herrin des Waldes); Länderkunde ½ KLU 11 = 5 + 2 und Fremdsprachen ⅕ INT 8 = 1 + 2 (Weltenbummler)
		expect([
			skill(v, 'schleichen'),
			skill(v, 'faehrtenlesen'),
			skill(v, 'sondieren'),
			skill(v, 'boegen'),
			skill(v, 'laenderkunde'),
			skill(v, 'fremdsprachen')
		]).toEqual([20, 16, 18, 16, 7, 3]);
		// Status 5 + 3 (W6: 6) − 3 (Weltenbummler) + 2 = 7: durchschnittlich
		expect(v.socialStatus.value).toBe(7);
		expect(v.equipmentStep).toMatchObject({ stage: 'durchschnittlich', purse: 1000 });
	});

	it('zwei Kunststücke statt Besonderer Herkunft; Bögen schaltet vier Techniken bis Stufe II frei', () => {
		expect(v.stuntStep.allowed).toBe(2);
		expect(v.combatStep.skills.find((s) => s.skill === 'boegen')).toMatchObject({ value: 16, allowed: 4, maxTier: 2 });
		expect(v.characteristicStep.slots.map((s) => s.id)).toEqual(['weltenbummler', 'visionaer']);
	});
});
