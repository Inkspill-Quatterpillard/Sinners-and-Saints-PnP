import type { RuleData } from '$lib/ruleData';
import type { Basis, Roll } from '../character';
import { addSkillBonus, skillKey, skillKeyExists, type Derivation, type Modifier, type StepStatus } from '../derivation';
import { messages } from '../messages';
import type { SkillView } from './skills';

export type ProfessionAction =
	| { type: 'setProfessionName'; name: string }
	| { type: 'toggleProfessionSkill'; skill: string }
	| { type: 'rollStatus'; roll: Roll | undefined }
	| { type: 'assignHeroSkill'; slot: number; skill: string | undefined };

export interface HeroSlotView {
	index: number;
	value: number;
	skill?: string;
}

export interface ProfessionStepView {
	name: string;
	/** Schlüssel der gewählten Professionsfertigkeiten. */
	skills: string[];
	required: number;
	statusRoll?: Roll;
	statusModifier?: number;
	heroSlots: HeroSlotView[];
}

export interface StatusView {
	base: number;
	modifiers: Modifier[];
	value: number;
}

const generalSkillIds = (rd: RuleData) => new Set(rd.skills.map((s) => s.id));

export function applyProfessionAction(basis: Basis, action: ProfessionAction, ruleData: RuleData): void {
	const p = basis.profession;
	switch (action.type) {
		case 'setProfessionName':
			p.name = action.name;
			break;
		case 'toggleProfessionSkill': {
			const id = action.skill.split(':')[0];
			if (!generalSkillIds(ruleData).has(id)) break;
			if (p.skills.includes(action.skill)) p.skills = p.skills.filter((s) => s !== action.skill);
			else if (p.skills.length < ruleData.profession.professionSkillCount) p.skills.push(action.skill);
			break;
		}
		case 'rollStatus':
			if (action.roll) p.statusRoll = action.roll;
			else delete p.statusRoll;
			break;
		case 'assignHeroSkill': {
			// Eine Heldenfertigkeit belegt höchstens einen Platz.
			for (const [slot, skill] of Object.entries(p.heroSlots)) {
				if (skill === action.skill) delete p.heroSlots[Number(slot)];
			}
			if (action.skill) p.heroSlots[action.slot] = action.skill;
			else delete p.heroSlots[action.slot];
			break;
		}
	}
}

const worst = (a: StepStatus, b: StepStatus): StepStatus =>
	a === 'invalid' || b === 'invalid' ? 'invalid' : a === 'open' || b === 'open' ? 'open' : 'valid';

export function evaluateProfession(d: Derivation): ProfessionStepView {
	const rules = d.ruleData.profession;
	const p = d.character.basis.profession;
	let status: StepStatus = p.name.trim() ? 'valid' : 'open';
	const source = messages.professionSource(p.name.trim());

	for (const key of p.skills) {
		if (!skillKeyExists(d, key, false)) {
			status = 'invalid';
			d.issues.push({ step: 'profession', severity: 'invalid', message: messages.professionSkillMissing(key) });
			continue;
		}
		addSkillBonus(d, key, { source, value: rules.professionSkillBonus });
	}
	if (p.skills.length < rules.professionSkillCount) status = worst(status, 'open');
	if (p.skills.length > rules.professionSkillCount) {
		status = 'invalid';
		d.issues.push({
			step: 'profession',
			severity: 'invalid',
			message: messages.tooManyProfessionSkills(p.skills.length, rules.professionSkillCount)
		});
	}

	const statusModifier = p.statusRoll ? rules.statusTable[String(p.statusRoll.dice[0])] : undefined;
	d.status.base = rules.statusStart;
	if (statusModifier !== undefined) d.status.modifiers.push({ source, value: statusModifier });
	else status = worst(status, 'open');

	const heroSlots = rules.heroSkillValues.map((value, index) => ({ index, value, skill: p.heroSlots[index] }));
	for (const slot of heroSlots) {
		if (!slot.skill) {
			status = worst(status, 'open');
			continue;
		}
		if (!d.ruleData.heroSkills.some((h) => h.id === slot.skill)) {
			status = 'invalid';
			continue;
		}
		d.skillSetValues[skillKey(slot.skill)] = { source: messages.heroSkillSource, value: slot.value };
	}

	d.steps.push({ id: 'profession', status });
	return {
		name: p.name,
		skills: p.skills,
		required: rules.professionSkillCount,
		statusRoll: p.statusRoll,
		statusModifier,
		heroSlots
	};
}

/** Warnt, wenn das Setzen einer Heldenfertigkeit ihren Wert unter den Startwert senkt (erlaubt, aber ungewöhnlich). */
export function warnLoweredHeroSkills(d: Derivation, skills: SkillView[]): void {
	for (const s of skills) {
		if (s.setValue && s.start !== undefined && s.setValue.value < s.start) {
			d.issues.push({
				step: 'profession',
				severity: 'warning',
				message: messages.heroSkillLowered(s.name, s.start, s.setValue.value)
			});
		}
	}
}
