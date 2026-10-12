import type { RuleData } from '$lib/ruleData';
import type { Basis } from '../character';
import type { Derivation, StepStatus } from '../derivation';
import { messages } from '../messages';
import type { SkillView } from './skills';

export type CombatAction = { type: 'toggleTechnique'; technique: string } | { type: 'chooseStyle'; style: string | undefined };

export interface CombatSkillView {
	skill: string;
	name: string;
	value?: number;
	/** Wie viele Techniken diese Kampffertigkeit erlaubt. */
	allowed: number;
	/** Höchste freigeschaltete Stufe (0 = keine). */
	maxTier: number;
	chosen: string[];
}

export interface CombatStepView {
	skills: CombatSkillView[];
	styleAllowed: { melee: boolean; ranged: boolean };
	style?: string;
}

/** Anzahl der Techniken und höchste Stufe für einen Fertigkeitswert. */
export function techniqueUnlocks(rd: RuleData, value: number | undefined): { allowed: number; maxTier: number } {
	const u = rd.combat.techniqueUnlocks;
	if (value === undefined || value < u.firstAt) return { allowed: 0, maxTier: 0 };
	const maxTier = Math.max(0, ...u.tiers.filter((t) => value >= t.from).map((t) => t.tier));
	return { allowed: 1 + Math.floor((value - u.firstAt) / u.everyPoints), maxTier };
}

export function applyCombatAction(basis: Basis, action: CombatAction, current: CombatStepView, rd: RuleData): void {
	if (action.type === 'chooseStyle') {
		basis.style = action.style;
		return;
	}
	if (basis.techniques.includes(action.technique)) {
		basis.techniques = basis.techniques.filter((t) => t !== action.technique);
		return;
	}
	// Nur wählbar, was die Kampffertigkeit gerade freischaltet.
	const def = rd.combat.techniques.find((t) => t.id === action.technique);
	const skill = current.skills.find((s) => s.skill === def?.skill);
	if (!def || !skill || def.tier > skill.maxTier || skill.chosen.length >= skill.allowed) return;
	basis.techniques.push(action.technique);
}

export function evaluateCombat(d: Derivation, skills: SkillView[]): CombatStepView {
	const rd = d.ruleData;
	const chosen = d.character.basis.techniques;
	let status: StepStatus = 'valid';

	const combatSkills = [...rd.combat.meleeSkills, ...rd.combat.rangedSkills].map((id) => {
		const skill = skills.find((s) => s.key === id);
		const { allowed, maxTier } = techniqueUnlocks(rd, skill?.value);
		const mine = chosen.filter((t) => rd.combat.techniques.find((x) => x.id === t)?.skill === id);
		const tooHigh = mine.filter((t) => (rd.combat.techniques.find((x) => x.id === t)?.tier ?? 0) > maxTier);
		if (mine.length > allowed || tooHigh.length) {
			status = 'invalid';
			d.issues.push({
				step: 'combat',
				severity: 'invalid',
				message: messages.techniquesExceeded(skill?.name ?? id, mine.length, allowed, maxTier)
			});
		}
		return { skill: id, name: skill?.name ?? id, value: skill?.value, allowed, maxTier, chosen: mine };
	});

	const reaches = (ids: string[]) =>
		ids.some((id) => (skills.find((s) => s.key === id)?.value ?? 0) >= rd.combat.styleUnlock.from);
	const styleAllowed = { melee: reaches(rd.combat.meleeSkills), ranged: reaches(rd.combat.rangedSkills) };
	const style = rd.combat.styles.find((s) => s.id === d.character.basis.style);
	if (style && !styleAllowed[style.kind]) {
		status = 'invalid';
		d.issues.push({
			step: 'combat',
			severity: 'invalid',
			message: messages.styleNotUnlocked(style.name, rd.combat.styleUnlock.from)
		});
	}

	d.steps.push({ id: 'combat', status });
	return { skills: combatSkills, styleAllowed, style: style?.id };
}
