import type { RuleData } from '$lib/ruleData';
import type { Basis } from '../character';
import type { Derivation, StepStatus } from '../derivation';
import { messages } from '../messages';
import type { SkillView } from './skills';

export type MagicAction = { type: 'toggleSpell'; spell: string };

export interface Contingent {
	/** Anzahl wählbarer Zauber (ohne Basiszauber). */
	total: number;
	/** Höchste wählbare Stufe (0 = keine). */
	maxTier: number;
	/** Höchstzahl der Zauber der Stufe II bzw. III. */
	tier2: number;
	tier3: number;
}

export interface DisciplineView {
	skill: string;
	name: string;
	value?: number;
	contingent: Contingent;
	/** Automatisch erlernte Basiszauber. */
	basics: string[];
	chosen: string[];
	/** Zauber, die sich jetzt noch hinzuwählen lassen (Kontingent, Stufe und Höchstzahlen beachtet). */
	selectable: string[];
}

export interface MagicStepView {
	disciplines: DisciplineView[];
}

export function contingentFor(rd: RuleData, value: number | undefined): Contingent {
	let result: Contingent = { total: 0, maxTier: 0, tier2: 0, tier3: 0 };
	if (value === undefined) return result;
	for (const row of rd.magic.contingent) {
		if (value >= row.from) result = { total: row.total, maxTier: row.maxTier, tier2: row.tier2 ?? 0, tier3: row.tier3 ?? 0 };
	}
	return result;
}

/** Passt ein weiterer Zauber noch ins Kontingent? */
function fits(rd: RuleData, chosen: string[], spellId: string, c: Contingent): boolean {
	const tierOf = (id: string) => rd.magic.spells.find((s) => s.id === id)?.tier ?? 0;
	const tier = tierOf(spellId);
	const after = [...chosen, spellId];
	return (
		tier >= 1 &&
		tier <= c.maxTier &&
		after.length <= c.total &&
		after.filter((id) => tierOf(id) === 2).length <= c.tier2 &&
		after.filter((id) => tierOf(id) === 3).length <= c.tier3
	);
}

export function applyMagicAction(basis: Basis, action: MagicAction, current: MagicStepView, rd: RuleData): void {
	if (basis.spells.includes(action.spell)) {
		basis.spells = basis.spells.filter((s) => s !== action.spell);
		return;
	}
	const def = rd.magic.spells.find((s) => s.id === action.spell);
	const discipline = current.disciplines.find((x) => x.skill === def?.skill);
	if (!def || !discipline || !fits(rd, discipline.chosen, def.id, discipline.contingent)) return;
	basis.spells.push(action.spell);
}

export function evaluateMagic(d: Derivation, skills: SkillView[]): MagicStepView {
	const rd = d.ruleData;
	let status: StepStatus = 'valid';
	const disciplines = rd.heroSkills
		.filter((h) => h.category === 'arcane')
		.map((h) => {
			const skill = skills.find((s) => s.key === h.id);
			// Gelernt ist eine Disziplin, wenn Punkte in sie gesteckt wurden (gesetzt oder mit Bonus).
			const learned = !!skill && (!!skill.setValue || skill.bonuses.length > 0);
			const contingent = learned ? contingentFor(rd, skill?.value) : contingentFor(rd, undefined);
			const own = rd.magic.spells.filter((s) => s.skill === h.id);
			const chosen = d.character.basis.spells.filter((id) => own.some((s) => s.id === id));
			// Gültigkeit der gesamten Auswahl prüfen, Zauber für Zauber.
			const ok: string[] = [];
			for (const id of chosen) {
				if (fits(rd, ok, id, contingent)) ok.push(id);
			}
			if (ok.length < chosen.length) {
				status = 'invalid';
				d.issues.push({ step: 'magic', severity: 'invalid', message: messages.spellsExceeded(h.name, contingent.total) });
			}
			return {
				skill: h.id,
				name: h.name,
				value: skill?.value,
				contingent,
				basics: learned ? own.filter((s) => s.tier === 0).map((s) => s.id) : [],
				chosen,
				selectable: own.filter((s) => !chosen.includes(s.id) && fits(rd, ok, s.id, contingent)).map((s) => s.id)
			};
		});
	d.steps.push({ id: 'magic', status });
	return { disciplines };
}
