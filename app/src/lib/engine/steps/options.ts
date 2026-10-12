import type { RuleData } from '$lib/ruleData';
import type { Basis } from '../character';
import type { Derivation } from '../derivation';

export type OptionsAction =
	| { type: 'setOptionalRule'; rule: string; enabled: boolean }
	| { type: 'setSetting'; setting: string };

export function applyOptionsAction(basis: Basis, action: OptionsAction): void {
	switch (action.type) {
		case 'setOptionalRule':
			basis.options.optionalRules[action.rule] = action.enabled;
			break;
		case 'setSetting':
			basis.options.setting = action.setting;
			break;
	}
}

export function resolveOptions(basis: Basis, ruleData: RuleData): Derivation['options'] {
	const optionalRules: Record<string, boolean> = {};
	for (const rule of ruleData.optionalRules) {
		optionalRules[rule.id] = basis.options.optionalRules[rule.id] ?? rule.defaultEnabled;
	}
	return { optionalRules, setting: basis.options.setting ?? ruleData.defaultSetting };
}

export function evaluateOptions(d: Derivation): void {
	d.steps.push({ id: 'options', status: 'valid' });
}
