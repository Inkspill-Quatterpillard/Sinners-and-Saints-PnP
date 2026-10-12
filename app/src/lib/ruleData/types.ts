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

export type SecondaryKey = 'tp' | 'stability' | 'magicPoints' | 'luck' | 'movement' | 'dodge' | 'damageBonus' | 'woundThreshold';

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
	| { type: 'meditationDie'; sides: number }
	/** Bonus auf eine vom Spieler gewählte Fertigkeit. */
	| { type: 'skillChoice'; value: number; includeHeroSkills: boolean }
	/** Bonus auf eine bestimmte Fertigkeit (Schlüssel wie in den Fertigkeitslisten). */
	| { type: 'skill'; skill: string; value: number }
	/** Glück wird (zusätzlich) mit Vorteil gewürfelt. */
	| { type: 'luckAdvantage' }
	/** Bonus oder Malus auf den Status. */
	| { type: 'status'; value: number }
	/** Eine begrenzt nutzbare Fähigkeit, die im lebenden Bogen abgehakt wird. */
	| { type: 'resource'; id: string; name: string; per: ResourcePeriod; uses: number }
	/** Ein Zähler im lebenden Bogen, z. B. Seelen im Artefakt. */
	| { type: 'counter'; id: string; name: string; start: number; max: number }
	/** Prozentualer Zuschlag auf ein Sekundärattribut (z. B. Atronach: +50 % MP). */
	| { type: 'secondaryPercent'; key: SecondaryKey; percent: number };

export type ResourcePeriod = 'day' | 'rest' | 'session' | 'permanent';

export interface ChoiceOption {
	id: string;
	name: string;
	/** Beschreibung der Option, falls sie mehr als ihr Name ist. */
	text?: string;
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

export interface SpeciesAgeDef {
	/** Kind unter diesem Alter, jugendlich unter `youthUnder`, erwachsen unter `adultUnder`. */
	childUnder: number;
	youthUnder: number;
	adultUnder: number;
	/** Ab `adultUnder` beginnt die erste Alterungsstufe, danach alle `agingInterval` Jahre eine weitere. */
	agingInterval: number;
	perStage: { maturity: number; atrophia: number; senility: number };
	note?: string;
}

export interface SpeciesDef {
	id: string;
	name: string;
	source: SourceRef;
	attributeModifiers: Partial<Record<AttributeId, number>>;
	traits: TraitDef[];
	age: SpeciesAgeDef;
}

export interface AgeRules {
	source: SourceRef;
	youngMalus: { child: number; youth: number; attributes: AttributeId[] };
	childLuckBonus: number;
	/** Durch Altersmali darf kein Attribut unter diesen Wert fallen. */
	minimumAttribute: number;
	adultMaturityRolls: number;
	maturityDie: number;
	maturityAttributes: AttributeId[];
	senilityDie: number;
	senilityStabilityLoss: number;
	movementByAge: ThresholdTable;
	provisional?: Provisional[];
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

export type SkillCategory = 'general' | 'combat' | 'arcane';

export interface SkillDef {
	id: string;
	name: string;
	/** Bei mehreren Attributen zählt das höhere. */
	attributes: AttributeId[];
	fraction: 'half' | 'fifth';
	/** „Spezialisierung notwendig“: die Fertigkeit wird je Spezialisierung getrennt geführt. */
	specialization: boolean;
	group?: string;
	/** Nur bei Heldenfertigkeiten: Kampf oder Magie. */
	category?: 'combat' | 'arcane';
	description: string;
	/** Andere Namen, unter denen das Regelwerk die Fertigkeit an anderer Stelle nennt. */
	aliases?: string[];
	note?: string;
	source: SourceRef;
}

export interface ProfessionRules {
	source: SourceRef;
	professionSkillCount: number;
	professionSkillBonus: number;
	statusStart: number;
	statusDie: number;
	/** Statusmodifikator je Würfelergebnis. */
	statusTable: Record<string, number>;
	/** Werte, auf die die Heldenfertigkeiten gesetzt werden (in beliebiger Reihenfolge). */
	heroSkillValues: number[];
	provisional?: Provisional[];
}

export interface ReligionDef {
	id: string;
	name: string;
	description: string;
	/** Name des Segens, z. B. „Göttliches Zeichen“. */
	blessing: string;
	/** Text des Segens. */
	text: string;
	effects?: Effect[];
	options?: ChoiceOption[];
	source: SourceRef;
}

export interface CharacteristicDef {
	id: string;
	name: string;
	/** Bereich auf dem W100, z. B. [21, 22]. */
	range: [number, number];
	text: string;
	effects?: Effect[];
	note?: string;
	source: SourceRef;
}

export interface CharacteristicRules {
	die: number;
	/** Höchstzahl gewürfelter Charakteristiken (ohne Zusatz durch Spezies-Eigenschaften). */
	maxRolled: number;
	/** Wie oft insgesamt neu gewürfelt werden darf. */
	rerolls: number;
	entries: CharacteristicDef[];
}

export interface OriginDef {
	id: string;
	/** Nummer im Regelwerk (3–18). */
	number: number;
	name: string;
	description: string;
	abilities: { name: string; text: string }[];
	effects?: Effect[];
	options?: ChoiceOption[];
	note?: string;
	source: SourceRef;
}

export interface StuntPrerequisite {
	/** Originaltext, z. B. „Medizin 12“. */
	text: string;
	value?: number;
	/** Fertigkeitsschlüssel; eine davon genügt (z. B. „Steuern“ = Fahrzeug steuern oder Steuern (Boot)). */
	skills?: string[];
	attribute?: AttributeId;
	secondary?: SecondaryKey;
	status?: boolean;
}

export interface StuntDef {
	id: string;
	name: string;
	tier: number;
	tierName: string;
	prerequisites: StuntPrerequisite[];
	text: string;
	source: SourceRef;
}

export interface TechniqueDef {
	/** „Fertigkeit:Name“, z. B. „schwerter:finte“. */
	id: string;
	name: string;
	/** Die Kampffertigkeit, zu der die Technik gehört. */
	skill: string;
	tier: number;
	/** Aktiv, Passiv oder beides. */
	kind: string;
	/** Hinweis zur Waffenführung, z. B. „Ein- und zweihändig“. */
	hands: string;
	flavor: string;
	text: string;
	source: SourceRef;
}

export interface StyleDef {
	id: string;
	name: string;
	kind: 'melee' | 'ranged';
	text: string;
	source: SourceRef;
}

export interface CombatRules {
	techniqueUnlocks: { firstAt: number; everyPoints: number; tiers: { tier: number; from: number }[] };
	styleUnlock: { from: number; count: number; note?: string };
	meleeSkills: string[];
	rangedSkills: string[];
	techniques: TechniqueDef[];
	styles: StyleDef[];
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
	skills: SkillDef[];
	heroSkills: SkillDef[];
	age: AgeRules;
	profession: ProfessionRules;
	religions: ReligionDef[];
	characteristics: CharacteristicRules;
	origins: OriginDef[];
	stunts: StuntDef[];
	combat: CombatRules;
}
