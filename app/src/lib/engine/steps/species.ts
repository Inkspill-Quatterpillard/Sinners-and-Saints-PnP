import type { AttributeId } from '$lib/ruleData';
import type { Basis } from '../character';
import { applyTrait, type TraitView } from '../choices';
import type { Derivation, StepStatus } from '../derivation';
import { messages } from '../messages';

export type SpeciesAction = { type: 'chooseSpecies'; species: string };

export interface SpeciesStepView {
	selected?: string;
	traits: TraitView[];
}

export function applySpeciesAction(basis: Basis, action: SpeciesAction): void {
	basis.species = action.species;
}

export function evaluateSpecies(d: Derivation): SpeciesStepView {
	const species = d.ruleData.species.find((s) => s.id === d.character.basis.species);
	if (!species) {
		d.steps.push({ id: 'species', status: 'open' });
		return { traits: [] };
	}

	for (const [attr, value] of Object.entries(species.attributeModifiers) as [AttributeId, number][]) {
		d.attributes[attr].modifiers.push({ source: messages.speciesSource(species.name), value });
	}

	const statuses: StepStatus[] = [];
	const traits = species.traits.map((trait) => {
		const result = applyTrait(d, trait, 'species');
		statuses.push(result.status);
		return result.view;
	});
	const status: StepStatus = statuses.includes('invalid') ? 'invalid' : statuses.includes('open') ? 'open' : 'valid';
	d.steps.push({ id: 'species', status });
	return { selected: species.id, traits };
}
