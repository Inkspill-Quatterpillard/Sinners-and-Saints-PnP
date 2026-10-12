import type { RuleData } from '$lib/ruleData';
import type { Character } from './character';
import { applyAttributesAction, type AttributesAction } from './steps/attributes';
import { applyOptionsAction, type OptionsAction } from './steps/options';
import { applySpeciesAction, type SpeciesAction } from './steps/species';
import { applyChoiceAction, type ChoiceAction } from './choices';
import { applySecondaryAction, type SecondaryAction } from './steps/secondary';

export type Action =
	| { type: 'setName'; name: string }
	| OptionsAction
	| AttributesAction
	| SpeciesAction
	| ChoiceAction
	| SecondaryAction;

/** Wendet eine Aktion an und liefert einen neuen Charakter; der übergebene bleibt unverändert. */
export function applyAction(character: Character, action: Action, ruleData: RuleData): Character {
	const next = structuredClone(character);
	next.ruleDataVersion = ruleData.version;
	const basis = next.basis;
	switch (action.type) {
		case 'setName':
			basis.name = action.name;
			break;
		case 'setOptionalRule':
		case 'setSetting':
			applyOptionsAction(basis, action);
			break;
		case 'setAttributeMethod':
		case 'rollAttributeSlot':
		case 'assignAttribute':
			applyAttributesAction(basis, action);
			break;
		case 'chooseSpecies':
			applySpeciesAction(basis, action);
			break;
		case 'chooseTraitOption':
		case 'chooseTraitAttribute':
			applyChoiceAction(basis, action);
			break;
		case 'rollLuck':
			applySecondaryAction(basis, action);
			break;
	}
	return next;
}
