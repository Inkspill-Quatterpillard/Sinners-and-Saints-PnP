import type { AttributeDef, RuleData } from './types';
import grundattribute from './data/grundattribute.json';
import optionen from './data/optionen.json';

export type * from './types';

/** Die Regeldaten der App. Jeder Eintrag verweist auf seine Quelle im Regelwerk. */
export const ruleData: RuleData = {
	version: 1,
	attributes: grundattribute.attributes as AttributeDef[],
	attributeGeneration: grundattribute.generation,
	optionalRules: optionen.optionalRules,
	settings: optionen.settings,
	defaultSetting: optionen.defaultSetting
};
