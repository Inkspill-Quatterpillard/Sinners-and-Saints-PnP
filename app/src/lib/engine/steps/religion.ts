import type { TraitDef } from '$lib/ruleData';
import type { Basis } from '../character';
import { applyTrait, type TraitView } from '../choices';
import type { Derivation } from '../derivation';

export type ReligionAction = { type: 'chooseReligion'; religion: string };

export interface ReligionStepView {
	selected?: string;
	/** Der Segen der gewählten Religion mit seiner Wahl. */
	trait?: TraitView;
}

export function applyReligionAction(basis: Basis, action: ReligionAction): void {
	basis.religion = action.religion;
}

export function evaluateReligion(d: Derivation): ReligionStepView {
	const religion = d.ruleData.religions.find((r) => r.id === d.character.basis.religion);
	if (!religion) {
		d.steps.push({ id: 'religion', status: 'open' });
		return {};
	}
	// Der Segen wird wie eine Eigenschaft behandelt; die Wahl gehört zur Religion.
	const blessing: TraitDef = {
		id: religion.id,
		name: religion.blessing,
		text: religion.text,
		effects: religion.effects,
		options: religion.options
	};
	const { status, view } = applyTrait(d, blessing, 'religion');
	d.steps.push({ id: 'religion', status });
	return { selected: religion.id, trait: view };
}
