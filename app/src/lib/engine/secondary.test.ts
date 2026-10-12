import { describe, expect, it } from 'vitest';
import { applyAction, computeView, createCharacter, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { playWith, testRuleData } from './testing/fixtures';

function play(...actions: Action[]): Character {
	return actions.reduce((c, a) => applyAction(c, a, ruleData), createCharacter('c1', ruleData.version));
}

/** Setzt alle Grundattribute über eingetragene Würfe (drei Würfel + eine 1 als gestrichener Würfel). */
function attributes(values: Record<string, number>): Action[] {
	const order = ['STR', 'KON', 'GES', 'WAH', 'KLU', 'INT', 'CHA', 'WIL'];
	const dice = (v: number) => {
		const a = Math.min(6, v - 2);
		const b = Math.min(6, v - a - 1);
		return [a, b, v - a - b, 1];
	};
	return [
		{ type: 'setAttributeMethod', method: 'roll' },
		...order.flatMap((attr, slot): Action[] => [
			{ type: 'rollAttributeSlot', slot, roll: { dice: dice(values[attr]), source: 'manual' } },
			{ type: 'assignAttribute', attribute: attr as never, slot }
		])
	];
}

const BASE = { STR: 13, KON: 11, GES: 9, WAH: 14, KLU: 12, INT: 15, CHA: 8, WIL: 7 };

describe('Sekundärattribute', () => {
	it('der Testaufbau setzt die gewünschten Grundattribute', () => {
		const view = computeView(play(...attributes(BASE)), ruleData);
		expect(view.attributes.INT.base).toBe(15);
		expect(view.attributes.CHA.base).toBe(8);
	});

	it('TP = KON + 5', () => {
		expect(computeView(play(...attributes(BASE)), ruleData).secondary.tp.value).toBe(16);
	});

	it('Stabilität = (WIL + KON) × 5 / 2, abgerundet', () => {
		// (7 + 11) × 5 / 2 = 45
		expect(computeView(play(...attributes(BASE)), ruleData).secondary.stability.value).toBe(45);
		// (7 + 12) × 5 / 2 = 47,5 → 47
		expect(computeView(play(...attributes({ ...BASE, KON: 12 })), ruleData).secondary.stability.value).toBe(47);
	});

	it('Magiepunkte = WIL/2 + höchstes aus CHA, INT, KLU geteilt durch 5, jeweils abgerundet', () => {
		// 7/2 = 3 (abgerundet), INT 15 / 5 = 3 → 6
		expect(computeView(play(...attributes(BASE)), ruleData).secondary.magicPoints.value).toBe(6);
		// WIL 9 → 4, KLU 14 / 5 = 2 → 6
		expect(computeView(play(...attributes({ ...BASE, WIL: 9, INT: 10, KLU: 14 })), ruleData).secondary.magicPoints.value).toBe(6);
	});

	it('Ausweichen = (GES + WAH) / 2, abgerundet', () => {
		// (9 + 14) / 2 = 11,5 → 11
		expect(computeView(play(...attributes(BASE)), ruleData).secondary.dodge.value).toBe(11);
	});

	it('Wundschwelle = TP / 5, abgerundet', () => {
		// 16 / 5 = 3,2 → 3
		expect(computeView(play(...attributes(BASE)), ruleData).secondary.woundThreshold.value).toBe(3);
	});

	it.each([
		[3, -2],
		[5, -2],
		[6, -1],
		[9, -1],
		[10, 0],
		[13, 0],
		[14, 1],
		[15, 1],
		[16, 2],
		[17, 2],
		[18, 3],
		[18, 3]
	])('Schadensbonus bei STR %i ist %i', (str, bonus) => {
		expect(computeView(play(...attributes({ ...BASE, STR: str })), ruleData).secondary.damageBonus.value).toBe(bonus);
	});

	it.each([
		[17, 3],
		[18, 4]
	])('Schadensbonus bei STR %i + 2 (Testspezies) ist %i', (str, bonus) => {
		const c = playWith(testRuleData, ...attributes({ ...BASE, STR: str }), { type: 'chooseSpecies', species: 'stark' });
		expect(computeView(c, testRuleData).secondary.damageBonus.value).toBe(bonus);
	});

	it.each([
		[9, 10, 7],
		[9, 11, 8],
		[15, 14, 8],
		[15, 15, 9],
		[18, 18, 9]
	])('Bewegung bei GES %i und KON %i ist %i', (ges, kon, movement) => {
		expect(computeView(play(...attributes({ ...BASE, GES: ges, KON: kon })), ruleData).secondary.movement.value).toBe(movement);
	});

	it('ohne vollständige Grundattribute gibt es noch keine Werte', () => {
		const view = computeView(play(), ruleData);
		expect(view.secondary.tp.value).toBeUndefined();
		expect(view.secondary.movement.value).toBeUndefined();
	});

	it('Modifikatoren der Spezies fließen über die effektiven Grundattribute ein', () => {
		// Zwerg: KON + 2 → TP 18
		const view = computeView(play(...attributes(BASE), { type: 'chooseSpecies', species: 'zwerg' }), ruleData);
		expect(view.secondary.tp.value).toBe(18);
	});

	it('direkte Boni auf Sekundärattribute werden addiert, Obergrenzen eingehalten', () => {
		const strong = { ...BASE, WIL: 18, KON: 18 };
		// (18 + 20 [KON 18 + 2 Zwerg]) × 5 / 2 = 95 → +20 Eherner Wille = 115, aber höchstens 99
		const view = computeView(
			play(
				...attributes(strong),
				{ type: 'chooseSpecies', species: 'zwerg' },
				{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'stabilitaet' }
			),
			ruleData
		);
		expect(view.secondary.stability.value).toBe(99);
		expect(view.secondary.stability.modifiers).toEqual([{ source: 'Eherner Wille', value: 20 }]);
	});

	it('+5 TP aus Eherner Wille erhöhen auch die Wundschwelle', () => {
		const view = computeView(
			play(
				...attributes(BASE),
				{ type: 'chooseSpecies', species: 'zwerg' },
				{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'leben' }
			),
			ruleData
		);
		// KON 13 + 5 + 5 = 23 → Wundschwelle 4
		expect(view.secondary.tp.value).toBe(23);
		expect(view.secondary.woundThreshold.value).toBe(4);
	});
});

describe('Glück', () => {
	const luckStatus = (c: Character) => computeView(c, ruleData).steps.find((s) => s.id === 'secondary')?.status;

	it('ist ein W20-Wurf und der Schritt bleibt offen, bis gewürfelt wurde', () => {
		const c = play(...attributes(BASE));
		expect(luckStatus(c)).toBe('open');
		const rolled = applyAction(c, { type: 'rollLuck', roll: { dice: [13], source: 'app' } }, ruleData);
		expect(computeView(rolled, ruleData).secondary.luck.value).toBe(13);
		expect(luckStatus(rolled)).toBe('valid');
	});

	it('der Wurf wird mit Herkunft gespeichert', () => {
		const c = play(...attributes(BASE), { type: 'rollLuck', roll: { dice: [4], source: 'manual' } });
		expect(computeView(c, ruleData).luck).toEqual({ advantage: false, dice: 1, roll: { dice: [4], source: 'manual' } });
	});
});
