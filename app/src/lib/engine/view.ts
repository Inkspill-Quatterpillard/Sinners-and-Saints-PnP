import type { AttributeId, RuleData } from '$lib/ruleData';
import type { Character, CharacterStatus } from './character';
import { effective, type Derivation, type Issue, type Modifier, type StepResult } from './derivation';
import { attributeStepView, evaluateAttributes, type AttributeStepView } from './steps/attributes';
import { evaluateOptions, resolveOptions } from './steps/options';

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
}

/** Die Schritte der Erstellung in ihrer festen Reihenfolge. */
const STEPS: ((d: Derivation) => void)[] = [evaluateOptions, evaluateAttributes];

export function computeView(character: Character, ruleData: RuleData): CharacterView {
	const d: Derivation = {
		character,
		ruleData,
		options: resolveOptions(character.basis, ruleData),
		attributes: Object.fromEntries(
			ruleData.attributes.map((a) => [a.id, { modifiers: [] }])
		) as unknown as Derivation['attributes'],
		steps: [],
		issues: []
	};
	for (const step of STEPS) step(d);

	return {
		id: character.id,
		name: character.basis.name,
		status: character.status,
		options: d.options,
		steps: d.steps,
		issues: d.issues,
		attributes: Object.fromEntries(
			Object.entries(d.attributes).map(([id, s]) => [
				id,
				{ base: s.base, effective: effective(s), modifiers: s.modifiers }
			])
		) as Record<AttributeId, AttributeView>,
		attributeStep: attributeStepView(d)
	};
}
