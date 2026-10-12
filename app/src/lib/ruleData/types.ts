export type AttributeId = 'STR' | 'KON' | 'GES' | 'WAH' | 'KLU' | 'INT' | 'CHA' | 'WIL';

/** Verweis auf die Stelle im Regelwerk, aus der ein Eintrag stammt (Pfad relativ zu `Regelwerk/`). */
export interface SourceRef {
	file: string;
	section?: string;
}

/** Markiert eine vorläufige Annahme, bis der Autor die zugehörige Regelfrage beantwortet hat. */
export interface Provisional {
	question: string;
	note?: string;
}

export interface AttributeDef {
	id: AttributeId;
	name: string;
	/** Körperliche Attribute sind von Altersmali und Atrophia betroffen. */
	physical: boolean;
	description: string;
	source: SourceRef;
}

export interface DiceSpec {
	count: number;
	sides: number;
	/** Wie viele der höchsten Würfel zählen. */
	keep: number;
}

export interface OptionalRuleDef {
	id: string;
	name: string;
	defaultEnabled: boolean;
	source: SourceRef;
}

export interface SettingDef {
	id: string;
	name: string;
}

export type SecondaryKey =
	| 'tp'
	| 'stability'
	| 'magicPoints'
	| 'luck'
	| 'movement'
	| 'dodge'
	| 'damageBonus'
	| 'woundThreshold';

/**
 * Ein mechanischer Effekt als Daten. Effekte, die sich so nicht beschreiben lassen,
 * stehen nur im Text des Eintrags und werden nicht automatisch angewendet.
 */
export type Effect =
	| { type: 'attribute'; attribute: AttributeId; value: number }
	| { type: 'secondary'; key: SecondaryKey; value: number; max?: number }
	| { type: 'extraCharacteristic'; count: number }
	| { type: 'noCharacteristic' }
	/** Bonus auf das höchste Grundattribut, Malus auf alle anderen (bei Gleichstand wählt der Spieler). */
	| { type: 'highestAttribute'; bonus: number; others: number }
	/** Würfel für die Regeneration durch Meditation (Standard W6). */
	| { type: 'meditationDie'; sides: number };

export interface ChoiceOption {
	id: string;
	name: string;
	effects: Effect[];
}

export interface TraitDef {
	id: string;
	name: string;
	text: string;
	/** Effekte, die immer gelten. */
	effects?: Effect[];
	/** Hat die Eigenschaft eine Wahl, muss der Spieler genau eine Option wählen. */
	options?: ChoiceOption[];
}

export interface SpeciesDef {
	id: string;
	name: string;
	source: SourceRef;
	attributeModifiers: Partial<Record<AttributeId, number>>;
	traits: TraitDef[];
}

export interface SecondaryDef {
	key: SecondaryKey;
	name: string;
	short: string;
	formula: string;
	source: SourceRef;
	note?: string;
}

/** Stufentabelle: der Wert der höchsten Zeile, deren `min` erreicht ist. */
export type ThresholdTable = { min: number; value: number }[];

export interface SecondaryRules {
	rounding: 'floor';
	secondaryAttributes: SecondaryDef[];
	tpBonus: number;
	stabilityFactor: number;
	magicPointsWilDivisor: number;
	magicPointsMentalDivisor: number;
	woundThresholdDivisor: number;
	luckDie: number;
	movementTable: ThresholdTable;
	damageBonusTable: ThresholdTable;
}

export interface RuleData {
	/** Wird erhöht, sobald sich Regeldaten so ändern, dass gespeicherte Charaktere betroffen sein können. */
	version: number;
	attributes: AttributeDef[];
	attributeGeneration: { dice: DiceSpec; fixedArray: number[]; source: SourceRef };
	optionalRules: OptionalRuleDef[];
	settings: SettingDef[];
	defaultSetting: string;
	species: SpeciesDef[];
	secondary: SecondaryRules;
}
