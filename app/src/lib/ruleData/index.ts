import type {
	AgeRules,
	AttributeDef,
	CharacteristicDef,
	CombatRules,
	MagicRules,
	OriginDef,
	ProfessionRules,
	ReligionDef,
	RuleData,
	SecondaryRules,
	SkillDef,
	SpeciesDef,
	StuntDef
} from './types';
import religionen from './data/religionen.json';
import charakteristiken from './data/charakteristiken.json';
import herkuenfte from './data/herkuenfte.json';
import kunststuecke from './data/kunststuecke.json';
import kampf from './data/kampf.json';
import zauber from './data/zauber.json';
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
	settings: optionen.settings,
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
	magic: zauber as MagicRules
};
