import type {
	AgeRules,
	AttributeDef,
	BackgroundTables,
	CharacteristicDef,
	CombatRules,
	ConditionDef,
	EquipmentDef,
	MagicRules,
	OriginDef,
	PlayRules,
	ProfessionRules,
	ReligionDef,
	RuleData,
	SecondaryRules,
	SkillDef,
	SettingDef,
	SpeciesDef,
	StatusTable,
	StuntDef
} from './types';
import religionen from './data/religionen.json';
import charakteristiken from './data/charakteristiken.json';
import herkuenfte from './data/herkuenfte.json';
import kunststuecke from './data/kunststuecke.json';
import kampf from './data/kampf.json';
import zauber from './data/zauber.json';
import status from './data/status.json';
import ausruestung from './data/ausruestung.json';
import vorgeschichte from './data/vorgeschichte.json';
import zustaende from './data/zustaende.json';
import spielregeln from './data/spielregeln.json';
import profession from './data/profession.json';
import alter from './data/alter.json';
import fertigkeiten from './data/fertigkeiten.json';
import heldenfertigkeiten from './data/heldenfertigkeiten.json';
import grundattribute from './data/grundattribute.json';
import optionen from './data/optionen.json';
import sekundaerattribute from './data/sekundaerattribute.json';
import spezies from './data/spezies.json';

export type * from './types';

/** Die Regeldaten der App. Jeder Eintrag verweist auf seine Quelle im Regelwerk. */
export const ruleData: RuleData = {
	version: 1,
	attributes: grundattribute.attributes as AttributeDef[],
	attributeGeneration: grundattribute.generation,
	optionalRules: optionen.optionalRules,
	settings: optionen.settings as SettingDef[],
	defaultSetting: optionen.defaultSetting,
	species: spezies.species as SpeciesDef[],
	secondary: sekundaerattribute as SecondaryRules,
	skills: fertigkeiten.skills as SkillDef[],
	heroSkills: heldenfertigkeiten.heroSkills as SkillDef[],
	age: alter as AgeRules,
	profession: profession as ProfessionRules,
	religions: religionen.religions as ReligionDef[],
	characteristics: {
		die: charakteristiken.die,
		maxRolled: charakteristiken.maxRolled,
		rerolls: charakteristiken.rerolls,
		entries: charakteristiken.characteristics as CharacteristicDef[]
	},
	origins: herkuenfte.origins as OriginDef[],
	stunts: kunststuecke.stunts as StuntDef[],
	combat: kampf as CombatRules,
	magic: zauber as MagicRules,
	statusTable: status as StatusTable,
	equipment: ausruestung.items as EquipmentDef[],
	background: vorgeschichte as BackgroundTables,
	conditions: zustaende.conditions as ConditionDef[],
	play: spielregeln as PlayRules
};
