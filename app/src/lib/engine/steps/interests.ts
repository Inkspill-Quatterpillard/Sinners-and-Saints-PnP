import type { AttributeId } from '$lib/ruleData';
import type { Basis } from '../character';
import { addSkillBonus, effective, type Derivation, type StepStatus } from '../derivation';
import { messages } from '../messages';

export const STATUS_TARGET = 'status';

export type InterestsAction =
	| { type: 'setInterestBasis'; attribute: AttributeId }
	| { type: 'setInterestPoints'; target: string; points: number };

export interface InterestsStepView {
	basis: AttributeId;
	/** Ob die Grundlage ausdrücklich gewählt wurde (sonst gilt das höhere Attribut). */
	chosen: boolean;
	total?: number;
	spent: number;
	remaining?: number;
	points: Record<string, number>;
}

export function applyInterestsAction(basis: Basis, action: InterestsAction, generalSkillIds: Set<string>): void {
	const interests = basis.interests;
	if (action.type === 'setInterestBasis') {
		interests.basis = action.attribute;
		return;
	}
	const id = action.target.split(':')[0];
	// Kampf- und Magiefertigkeiten sind ausgeschlossen.
	if (action.target !== STATUS_TARGET && !generalSkillIds.has(id)) return;
	if (action.points > 0) interests.points[action.target] = action.points;
	else delete interests.points[action.target];
}

export function evaluateInterests(d: Derivation): InterestsStepView {
	const { basis: chosenBasis, points } = d.character.basis.interests;
	const klu = effective(d.attributes.KLU);
	const int = effective(d.attributes.INT);
	const higher: AttributeId = (int ?? 0) > (klu ?? 0) ? 'INT' : 'KLU';
	const basis = chosenBasis ?? higher;
	const value = basis === 'KLU' ? klu : int;
	const total = value === undefined ? undefined : value * 2;

	let spent = 0;
	for (const [target, n] of Object.entries(points)) {
		spent += n;
		if (target === STATUS_TARGET) d.status.modifiers.push({ source: messages.interestsSource, value: n });
		else addSkillBonus(d, target, { source: messages.interestsSource, value: n });
	}

	let status: StepStatus = 'open';
	if (total !== undefined) {
		if (spent > total) {
			status = 'invalid';
			d.issues.push({ step: 'interests', severity: 'invalid', message: messages.tooManyInterestPoints(spent, total) });
		} else if (spent === total) {
			status = 'valid';
		}
	}
	d.steps.push({ id: 'interests', status });
	return { basis, chosen: chosenBasis !== undefined, total, spent, remaining: total === undefined ? undefined : total - spent, points };
}
