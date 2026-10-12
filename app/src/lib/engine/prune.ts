import type { RuleData } from '$lib/ruleData';
import type { Character } from './character';
import { computeView } from './view';

const keepBelow = <T>(record: Record<number, T>, count: number): Record<number, T> =>
	Object.fromEntries(Object.entries(record).filter(([i]) => Number(i) < count));

/**
 * Entfernt Angaben, die für den Charakter nicht (mehr) gelten: Würfe und Punkte früherer Altersstufen,
 * Würfe eines anderen Attributverfahrens, überzählige Charakteristik-Plätze und Wahlen von Eigenschaften,
 * die nicht wirken. Die Werte des Charakters ändern sich dadurch nicht.
 */
export function pruneUnused(character: Character, rd: RuleData): void {
	const v = computeView(character, rd);
	const b = character.basis;
	if (b.attributes.method !== 'roll') b.attributes.rolls = {};
	if (!v.ageStep.youngMalus.required) b.age.youngMalus = {};
	if (!v.ageStep.atrophia.required) b.age.atrophia = {};
	b.age.maturity = keepBelow(b.age.maturity, v.ageStep.maturityRolls.length);
	b.age.senility = keepBelow(b.age.senility, v.senility.rolls.length);
	const ch = b.characteristics;
	const slots = v.characteristicStep.maxSlots;
	ch.picks = keepBelow(ch.picks, slots);
	ch.rolls = keepBelow(ch.rolls, slots);
	ch.rerolledSlots = keepBelow(ch.rerolledSlots, slots);
	if (b.origin.choice !== 'origin') delete b.origin.origin;
	const active = new Set(v.activeTraits);
	b.choices = Object.fromEntries(Object.entries(b.choices).filter(([id]) => active.has(id)));
}

/** Eine aufgeräumte Kopie für den Export; Charaktere in Erstellung bleiben unverändert. */
export function forExport(character: Character, rd: RuleData): Character {
	if (character.status !== 'finished') return character;
	const copy = structuredClone(character);
	pruneUnused(copy, rd);
	return copy;
}
