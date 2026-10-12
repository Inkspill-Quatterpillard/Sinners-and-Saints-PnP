import type { AttributeId, RuleData, SecondaryKey } from '$lib/ruleData';
import type { Character, CharacterStatus } from './character';
import { createDerivation, effective, type Derivation, type Issue, type Modifier, type StepResult } from './derivation';
import { attributeStepView, evaluateAttributes, type AttributeStepView } from './steps/attributes';
import { evaluateOptions, resolveOptions } from './steps/options';
import { evaluateSpecies, type SpeciesStepView } from './steps/species';
import { evaluateSecondary, type LuckView, type SecondaryValue } from './steps/secondary';
import { evaluateSkills, type SkillView } from './steps/skills';
import { evaluateAge, evaluateSenility, type AgeStepView, type SenilityView } from './steps/age';

export interface AttributeView {
	base?: number;
	effective?: number;
	modifiers: Modifier[];
}

/** Alles, was die Oberfläche über einen Charakter anzeigt. */
export interface CharacterView {
	id: string;
	name: string;
	status: CharacterStatus;
	options: Derivation['options'];
	steps: StepResult[];
	issues: Issue[];
	attributes: Record<AttributeId, AttributeView>;
	attributeStep: AttributeStepView;
	speciesStep: SpeciesStepView;
	secondaryModifiers: Record<SecondaryKey, Modifier[]>;
	secondary: Record<SecondaryKey, SecondaryValue>;
	luck: LuckView;
	skills: SkillView[];
	ageStep: AgeStepView;
	senility: SenilityView;
	characteristicAllowance: Derivation['characteristicAllowance'];
}

export function computeView(character: Character, ruleData: RuleData): CharacterView {
	const d = createDerivation(character, ruleData, resolveOptions(character.basis, ruleData));

	// Die Schritte der Erstellung in ihrer festen Reihenfolge; jeder baut auf den früheren auf.
	evaluateOptions(d);
	evaluateAttributes(d);
	const speciesStep = evaluateSpecies(d);
	const ageStep = evaluateAge(d);
	const { secondary, luck } = evaluateSecondary(d);
	const senility = evaluateSenility(d, secondary.stability);
	const skills = evaluateSkills(d);

	return {
		id: character.id,
		name: character.basis.name,
		status: character.status,
		options: d.options,
		steps: d.steps,
		issues: d.issues,
		attributes: Object.fromEntries(
			Object.entries(d.attributes).map(([id, s]) => [id, { base: s.base, effective: effective(s), modifiers: s.modifiers }])
		) as Record<AttributeId, AttributeView>,
		attributeStep: attributeStepView(d),
		speciesStep,
		secondaryModifiers: d.secondary,
		secondary,
		luck,
		skills,
		ageStep,
		senility,
		characteristicAllowance: d.characteristicAllowance
	};
}
