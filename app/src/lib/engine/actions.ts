import type { RuleData } from '$lib/ruleData';
import type { Character } from './character';
import { applyAttributesAction, type AttributesAction } from './steps/attributes';
import { applyOptionsAction, type OptionsAction } from './steps/options';
import { applySpeciesAction, type SpeciesAction } from './steps/species';
import { applyChoiceAction, type ChoiceAction } from './choices';
import { applySecondaryAction, type SecondaryAction } from './steps/secondary';
import { applySkillsAction, type SkillsAction } from './steps/skills';
import { applyAgeAction, type AgeAction } from './steps/age';
import { applyProfessionAction, type ProfessionAction } from './steps/profession';
import { applyInterestsAction, type InterestsAction } from './steps/interests';
import { applyReligionAction, type ReligionAction } from './steps/religion';
import { applyCharacteristicAction, type CharacteristicAction } from './steps/characteristic';
import { allowedStunts, applyOriginAction, type OriginAction } from './steps/origin';
import { resolveOptions } from './steps/options';
import { applyCombatAction, type CombatAction } from './steps/combat';
import { applyMagicAction, type MagicAction } from './steps/magic';
import { computeView } from './view';

export type Action =
	| { type: 'setName'; name: string }
	| OptionsAction
	| AttributesAction
	| SpeciesAction
	| ChoiceAction
	| SecondaryAction
	| SkillsAction
	| AgeAction
	| ProfessionAction
	| InterestsAction
	| ReligionAction
	| CharacteristicAction
	| OriginAction
	| CombatAction
	| MagicAction;

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
		case 'toggleTechnique':
		case 'chooseStyle':
			// Was wählbar ist, hängt von den aktuellen Fertigkeitswerten ab.
			applyCombatAction(basis, action, computeView(character, ruleData).combatStep, ruleData);
			break;
		case 'toggleSpell':
			applyMagicAction(basis, action, computeView(character, ruleData).magicStep, ruleData);
			break;
		case 'chooseOriginOrStunt':
		case 'chooseOrigin':
		case 'toggleStunt':
			applyOriginAction(basis, action, allowedStunts(basis, resolveOptions(basis, ruleData).optionalRules));
			break;
		case 'setCharacteristicMode':
		case 'pickCharacteristic':
		case 'rollCharacteristic':
		case 'rerollCharacteristic':
			applyCharacteristicAction(basis, action, ruleData);
			break;
		case 'chooseReligion':
			applyReligionAction(basis, action);
			break;
		case 'chooseTraitOption':
		case 'chooseTraitAttribute':
		case 'chooseTraitSkill':
			applyChoiceAction(basis, action);
			break;
		case 'rollLuck':
			applySecondaryAction(basis, action);
			break;
		case 'setAge':
		case 'setYoungMalus':
		case 'rollMaturity':
		case 'setMaturityAttribute':
		case 'setAtrophia':
		case 'rollSenility':
			applyAgeAction(basis, action);
			break;
		case 'setProfessionName':
		case 'toggleProfessionSkill':
		case 'rollStatus':
		case 'assignHeroSkill':
			applyProfessionAction(basis, action, ruleData);
			break;
		case 'setInterestBasis':
		case 'setInterestPoints':
			applyInterestsAction(basis, action, new Set(ruleData.skills.map((s) => s.id)));
			break;
		case 'addSpecialization':
		case 'removeSpecialization':
			applySkillsAction(basis, action, [...ruleData.skills, ...ruleData.heroSkills]);
			break;
	}
	return next;
}
