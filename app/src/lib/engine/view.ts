import type { AttributeId, RuleData, SecondaryKey } from '$lib/ruleData';
import type { Character, CharacterStatus } from './character';
import {
	createDerivation,
	effective,
	type CounterDef,
	type Derivation,
	type Issue,
	type Modifier,
	type ResourceDef,
	type StepResult
} from './derivation';
import { attributeStepView, evaluateAttributes, type AttributeStepView } from './steps/attributes';
import { evaluateOptions, resolveOptions } from './steps/options';
import { evaluateSpecies, type SpeciesStepView } from './steps/species';
import { evaluateSecondary, type LuckView, type SecondaryValue } from './steps/secondary';
import { evaluateSkills, type SkillView } from './steps/skills';
import { evaluateAge, evaluateSenility, type AgeStepView, type SenilityView } from './steps/age';
import { evaluateReligion, type ReligionStepView } from './steps/religion';
import { evaluateCharacteristic, type CharacteristicStepView } from './steps/characteristic';
import { applySecondaryPercent, evaluateOrigin, evaluateStunts, type OriginStepView, type StuntStepView } from './steps/origin';
import { evaluateInterests, type InterestsStepView } from './steps/interests';
import { evaluateCombat, type CombatStepView } from './steps/combat';
import { evaluateProfession, warnLoweredHeroSkills, type ProfessionStepView, type StatusView } from './steps/profession';

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
	professionStep: ProfessionStepView;
	/** Der Statuswert (sozialer Rang), nicht zu verwechseln mit `status` (Stand der Erstellung). */
	socialStatus: StatusView;
	interestsStep: InterestsStepView;
	religionStep: ReligionStepView;
	characteristicStep: CharacteristicStepView;
	originStep: OriginStepView;
	stuntStep: StuntStepView;
	combatStep: CombatStepView;
	resources: ResourceDef[];
	counters: CounterDef[];
	characteristicAllowance: Derivation['characteristicAllowance'];
}

export function computeView(character: Character, ruleData: RuleData): CharacterView {
	const d = createDerivation(character, ruleData, resolveOptions(character.basis, ruleData));

	// Die Schritte der Erstellung in ihrer festen Reihenfolge; jeder baut auf den früheren auf.
	evaluateOptions(d);
	evaluateAttributes(d);
	const speciesStep = evaluateSpecies(d);
	const ageStep = evaluateAge(d);
	const religionStep = evaluateReligion(d);
	const characteristicStep = evaluateCharacteristic(d);
	const originStep = evaluateOrigin(d);
	const professionStep = evaluateProfession(d);
	const interestsStep = evaluateInterests(d);
	const { secondary, luck } = evaluateSecondary(d);
	applySecondaryPercent(d, secondary);
	const senility = evaluateSenility(d, secondary.stability);
	const skills = evaluateSkills(d);
	warnLoweredHeroSkills(d, skills);
	const socialStatus: StatusView = {
		base: d.status.base,
		modifiers: d.status.modifiers,
		value: d.status.base + d.status.modifiers.reduce((sum, m) => sum + m.value, 0)
	};
	const stuntStep = evaluateStunts(d, skills, secondary, socialStatus.value);
	const combatStep = evaluateCombat(d, skills);

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
		professionStep,
		interestsStep,
		religionStep,
		characteristicStep,
		originStep,
		stuntStep,
		combatStep,
		resources: d.resources,
		counters: d.counters,
		socialStatus,
		characteristicAllowance: d.characteristicAllowance
	};
}
