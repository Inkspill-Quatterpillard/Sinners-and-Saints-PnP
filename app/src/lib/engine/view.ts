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
import { evaluateMagic, type MagicStepView } from './steps/magic';
import { evaluateEquipment, type EquipmentStepView } from './steps/equipment';
import { evaluateBackground, type BackgroundView } from './steps/background';
import { applyOverrides, computeLive, type LiveView } from './live';
import { evaluateProfession, warnLoweredHeroSkills, type ProfessionStepView, type StatusView } from './steps/profession';

export interface AttributeView {
	base?: number;
	effective?: number;
	/** Halb- und Fünftelwert (abgerundet) für Proben auf das Attribut. */
	half?: number;
	fifth?: number;
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
	/** IDs aller Einträge mit eigener Wahl, die gerade wirken. */
	activeTraits: string[];
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
	magicStep: MagicStepView;
	equipmentStep: EquipmentStepView;
	background: BackgroundView;
	/** Alle Schritte der Erstellung sind gültig. */
	canFinish: boolean;
	/** Neue Regeldaten seit der letzten Änderung haben den Charakter ungültig gemacht. */
	ruleDataChanged: boolean;
	/** Würfel für die Meditation (W6, bei Wächter der Ströme W10). */
	meditationDie: number;
	live: LiveView;
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
	applyOverrides(character.play, secondary, skills);
	warnLoweredHeroSkills(d, skills);
	const socialStatus: StatusView = {
		base: d.status.base,
		modifiers: d.status.modifiers,
		value: d.status.base + d.status.modifiers.reduce((sum, m) => sum + m.value, 0)
	};
	const stuntStep = evaluateStunts(d, skills, secondary, socialStatus.value);
	const combatStep = evaluateCombat(d, skills);
	const magicStep = evaluateMagic(d, skills);
	const equipmentStep = evaluateEquipment(d, socialStatus.value);
	const background = evaluateBackground(d);

	return {
		id: character.id,
		name: character.basis.name,
		status: character.status,
		options: d.options,
		steps: d.steps,
		issues: d.issues,
		attributes: Object.fromEntries(
			Object.entries(d.attributes).map(([id, s]) => {
				const value = effective(s);
				const half = value === undefined ? undefined : Math.floor(value / 2);
				const fifth = value === undefined ? undefined : Math.floor(value / 5);
				return [id, { base: s.base, effective: value, half, fifth, modifiers: s.modifiers }];
			})
		) as Record<AttributeId, AttributeView>,
		attributeStep: attributeStepView(d),
		speciesStep,
		activeTraits: d.appliedTraits,
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
		magicStep,
		equipmentStep,
		background,
		canFinish: d.steps.every((s) => s.status === 'valid'),
		ruleDataChanged:
			character.ruleDataVersion !== ruleData.version &&
			(d.steps.some((s) => s.status === 'invalid') ||
				(character.status === 'finished' && !d.steps.every((s) => s.status === 'valid'))),
		meditationDie: d.meditationDie,
		live: computeLive(
			character.play,
			secondary,
			{
				remainingMoney: equipmentStep.remaining,
				luckBonus: secondary.luck.modifiers.reduce((sum, m) => sum + m.value, 0),
				items: equipmentStep.items,
				resources: d.resources,
				counters: d.counters
			},
			ruleData
		),
		resources: d.resources,
		counters: d.counters,
		socialStatus,
		characteristicAllowance: d.characteristicAllowance
	};
}
