import type { AttributeId, RuleData, SecondaryKey } from '$lib/ruleData';
import type { Character } from './character';

export type StepId = 'options' | 'attributes' | 'species' | 'age' | 'profession' | 'secondary' | 'senility';
export type StepStatus = 'open' | 'valid' | 'invalid';

/** Ein Hinweis zu einer Entscheidung: eine Warnung oder eine ungültige Entscheidung mit Begründung. */
export interface Issue {
	step: StepId;
	severity: 'warning' | 'invalid';
	message: string;
}

export interface StepResult {
	id: StepId;
	status: StepStatus;
}

/** Ein Beitrag zu einem Wert, mit seiner Herkunft (z. B. „Spezies: Zwerg“). */
export interface Modifier {
	source: string;
	value: number;
}

export interface AttributeState {
	base?: number;
	modifiers: Modifier[];
}

/**
 * Der Zwischenstand, den die Schritte der Erstellung der Reihe nach aufbauen.
 * Jeder Schritt liest, was frühere Schritte beigetragen haben, und ergänzt seinen Teil.
 */
export interface Derivation {
	character: Character;
	ruleData: RuleData;
	options: { optionalRules: Record<string, boolean>; setting: string };
	attributes: Record<AttributeId, AttributeState>;
	/** Beiträge zu Sekundärattributen aus Spezies, Charakteristik, Herkunft usw. */
	secondary: Record<SecondaryKey, Modifier[]>;
	/** Obergrenzen einzelner Sekundärattribute (z. B. Stabilität höchstens 99). */
	secondaryCaps: Partial<Record<SecondaryKey, number>>;
	characteristicAllowance: { extra: number; forbidden: boolean };
	/** Würfel für die Regeneration von MP durch Meditation. */
	meditationDie: number;
	/** Glück wird mit Vorteil gewürfelt (z. B. bei Kindern und Jugendlichen). */
	luckAdvantage: boolean;
	ageStage?: 'child' | 'youth' | 'adult' | 'aging';
	agingStages: number;
	/** Boni auf Fertigkeiten, je Fertigkeitsschlüssel (siehe `skillKey`). */
	skillBonuses: Record<string, Modifier[]>;
	/** Fest gesetzte Werte (z. B. Heldenfertigkeiten 14/12/10/8/8), die den Startwert ersetzen. */
	skillSetValues: Record<string, Modifier>;
	status: { base: number; modifiers: Modifier[] };
	steps: StepResult[];
	issues: Issue[];
}

export const SECONDARY_KEYS: SecondaryKey[] = [
	'tp',
	'stability',
	'magicPoints',
	'luck',
	'movement',
	'dodge',
	'damageBonus',
	'woundThreshold'
];

export function createDerivation(character: Character, ruleData: RuleData, options: Derivation['options']): Derivation {
	return {
		character,
		ruleData,
		options,
		attributes: Object.fromEntries(ruleData.attributes.map((a) => [a.id, { modifiers: [] }])) as unknown as Derivation['attributes'],
		secondary: Object.fromEntries(SECONDARY_KEYS.map((k) => [k, []])) as unknown as Derivation['secondary'],
		secondaryCaps: {},
		characteristicAllowance: { extra: 0, forbidden: false },
		meditationDie: 6,
		luckAdvantage: false,
		agingStages: 0,
		skillBonuses: {},
		skillSetValues: {},
		status: { base: ruleData.profession.statusStart, modifiers: [] },
		steps: [],
		issues: []
	};
}

export function effective(state: AttributeState): number | undefined {
	if (state.base === undefined) return undefined;
	return state.base + state.modifiers.reduce((sum, m) => sum + m.value, 0);
}

/** Schlüssel einer Fertigkeit: die ID, bei Spezialisierungen mit angehängter Spezialisierung. */
export function skillKey(skillId: string, specialization?: string): string {
	return specialization ? `${skillId}:${specialization}` : skillId;
}

export function addSkillBonus(d: Derivation, key: string, modifier: Modifier): void {
	(d.skillBonuses[key] ??= []).push(modifier);
}
