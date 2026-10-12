import type { AttributeDef, RuleData, SpeciesDef } from './types';
import grundattribute from './data/grundattribute.json';
import optionen from './data/optionen.json';
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
	species: spezies.species as SpeciesDef[]
};
