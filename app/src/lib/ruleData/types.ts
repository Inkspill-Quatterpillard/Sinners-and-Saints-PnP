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

export interface RuleData {
	/** Wird erhöht, sobald sich Regeldaten so ändern, dass gespeicherte Charaktere betroffen sein können. */
	version: number;
	attributes: AttributeDef[];
	attributeGeneration: { dice: DiceSpec; fixedArray: number[]; source: SourceRef };
	optionalRules: OptionalRuleDef[];
	settings: SettingDef[];
	defaultSetting: string;
}
