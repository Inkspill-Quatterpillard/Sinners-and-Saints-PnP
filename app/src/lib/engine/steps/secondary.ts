import type { AttributeId, SecondaryKey, ThresholdTable } from '$lib/ruleData';
import type { Basis, Roll } from '../character';
import { effective, SECONDARY_KEYS, type Derivation, type Modifier } from '../derivation';

export type SecondaryAction = { type: 'rollLuck'; roll: Roll };

export interface SecondaryValue {
	/** Wert aus der Formel, vor direkten Boni. */
	base?: number;
	/** Endwert nach Boni und Obergrenzen. */
	value?: number;
	modifiers: Modifier[];
	cap?: number;
}

export interface LuckView {
	/** Mit Vorteil: zwei W20, der höhere zählt. */
	advantage: boolean;
	roll?: Roll;
}

export function applySecondaryAction(basis: Basis, action: SecondaryAction): void {
	basis.luck = action.roll;
}

function lookup(table: ThresholdTable, value: number): number {
	let result = table[0].value;
	for (const row of table) if (value >= row.min) result = row.value;
	return result;
}

/** Glückswurf: bei Vorteil zählt der höhere von zwei Würfeln; fehlt der zweite, ist der Wurf unvollständig. */
function luckFromRoll(roll: Roll | undefined, advantage: boolean): number | undefined {
	if (!roll || roll.dice.length === 0) return undefined;
	if (!advantage) return roll.dice[0];
	if (roll.dice.length < 2) return undefined;
	return Math.max(roll.dice[0], roll.dice[1]);
}

export function evaluateSecondary(d: Derivation): { secondary: Record<SecondaryKey, SecondaryValue>; luck: LuckView } {
	const r = d.ruleData.secondary;
	const a = (id: AttributeId) => effective(d.attributes[id]);
	const floor = Math.floor;
	const STR = a('STR'), KON = a('KON'), GES = a('GES'), WAH = a('WAH'), WIL = a('WIL');
	const mental = [a('CHA'), a('INT'), a('KLU')];
	const all = (...values: (number | undefined)[]) => values.every((v) => v !== undefined);

	const base: Partial<Record<SecondaryKey, number>> = {};
	if (all(KON)) base.tp = KON! + r.tpBonus;
	if (all(WIL, KON)) base.stability = floor((WIL! + KON!) * r.stabilityFactor);
	if (all(WIL, ...mental)) {
		base.magicPoints = floor(WIL! / r.magicPointsWilDivisor) + floor(Math.max(...(mental as number[])) / r.magicPointsMentalDivisor);
	}
	if (all(GES, KON)) base.movement = lookup(r.movementTable, GES! + KON!);
	if (all(GES, WAH)) base.dodge = floor((GES! + WAH!) / 2);
	if (all(STR)) base.damageBonus = lookup(r.damageBonusTable, STR!);
	const luck: LuckView = { advantage: d.luckAdvantage, roll: d.character.basis.luck };
	base.luck = luckFromRoll(luck.roll, luck.advantage);

	const result = {} as Record<SecondaryKey, SecondaryValue>;
	const finish = (key: SecondaryKey, baseValue: number | undefined) => {
		const modifiers = d.secondary[key];
		const cap = d.secondaryCaps[key];
		let value = baseValue === undefined ? undefined : baseValue + modifiers.reduce((s, m) => s + m.value, 0);
		if (value !== undefined && cap !== undefined) value = Math.min(value, cap);
		result[key] = { base: baseValue, value, modifiers, cap };
	};
	for (const key of SECONDARY_KEYS) if (key !== 'woundThreshold') finish(key, base[key]);
	// Die Wundschwelle hängt von den endgültigen TP ab.
	const tp = result.tp.value;
	finish('woundThreshold', tp === undefined ? undefined : floor(tp / r.woundThresholdDivisor));

	const attributesComplete = d.ruleData.attributes.every((attr) => d.attributes[attr.id].base !== undefined);
	d.steps.push({ id: 'secondary', status: attributesComplete && base.luck !== undefined ? 'valid' : 'open' });
	return { secondary: result, luck };
}
