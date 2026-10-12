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
	/** Mit Vorteil: mehrere W20, der höchste zählt. */
	advantage: boolean;
	/** Anzahl der W20 (1 + Anzahl der Vorteile). */
	dice: number;
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

/** Glückswurf: bei Vorteil zählt der höchste der Würfel; fehlen Würfel, ist der Wurf unvollständig. */
function luckFromRoll(roll: Roll | undefined, dice: number): number | undefined {
	if (!roll || roll.dice.length < dice) return undefined;
	return Math.max(...roll.dice.slice(0, dice));
}

export function evaluateSecondary(d: Derivation): { secondary: Record<SecondaryKey, SecondaryValue>; luck: LuckView } {
	const r = d.ruleData.secondary;
	const a = (id: AttributeId) => effective(d.attributes[id]);
	const floor = Math.floor;
	const STR = a('STR'),
		KON = a('KON'),
		GES = a('GES'),
		WAH = a('WAH'),
		WIL = a('WIL');
	const mental = [a('CHA'), a('INT'), a('KLU')];
	const all = (...values: (number | undefined)[]) => values.every((v) => v !== undefined);

	const base: Partial<Record<SecondaryKey, number>> = {};
	if (all(KON)) base.tp = KON! + r.tpBonus;
	if (all(WIL, KON)) base.stability = floor((WIL! + KON!) * r.stabilityFactor);
	if (all(WIL, ...mental)) {
		base.magicPoints =
			floor(WIL! / r.magicPointsWilDivisor) + floor(Math.max(...(mental as number[])) / r.magicPointsMentalDivisor);
	}
	if (all(GES, KON)) base.movement = lookup(r.movementTable, GES! + KON!);
	if (all(GES, WAH)) base.dodge = floor((GES! + WAH!) / r.dodgeDivisor);
	if (all(STR)) base.damageBonus = lookup(r.damageBonusTable, STR!);
	const luck: LuckView = { advantage: d.luckAdvantages > 0, dice: 1 + d.luckAdvantages, roll: d.character.basis.luck };
	base.luck = luckFromRoll(luck.roll, luck.dice);

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
