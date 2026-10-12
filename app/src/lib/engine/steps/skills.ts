import type { SkillCategory, SkillDef } from '$lib/ruleData';
import type { Basis } from '../character';
import { effective, skillKey, type Derivation, type Modifier } from '../derivation';

export type SkillsAction =
	| { type: 'addSpecialization'; skill: string; specialization: string }
	| { type: 'removeSpecialization'; skill: string; specialization: string };

export interface SkillView {
	/** Eindeutiger Schlüssel, bei Spezialisierungen „id:Spezialisierung“. */
	key: string;
	skillId: string;
	name: string;
	specialization?: string;
	/** Die Fertigkeit verlangt eine Spezialisierung (Eintrag ohne Spezialisierung = Grundwert für alle). */
	needsSpecialization: boolean;
	category: SkillCategory;
	group?: string;
	attributes: string[];
	fraction: 'half' | 'fifth';
	/** Startwert aus dem Attribut. */
	start?: number;
	/** Fest gesetzter Wert, der den Startwert ersetzt (z. B. Heldenfertigkeiten). */
	setValue?: Modifier;
	bonuses: Modifier[];
	value?: number;
	half?: number;
	fifth?: number;
}

export function applySkillsAction(basis: Basis, action: SkillsAction, skills: SkillDef[]): void {
	const def = skills.find((s) => s.id === action.skill);
	const name = action.specialization.trim();
	if (!def?.specialization || !name) return;
	const list = (basis.specializations[action.skill] ??= []);
	if (action.type === 'addSpecialization') {
		if (!list.includes(name)) list.push(name);
	} else {
		basis.specializations[action.skill] = list.filter((s) => s !== name);
	}
}

export function allSkillDefs(d: Derivation): SkillDef[] {
	return [...d.ruleData.skills, ...d.ruleData.heroSkills];
}

/** Startwert: Bruchteil des höheren zugehörigen Attributs, abgerundet. */
function startValue(d: Derivation, def: SkillDef): number | undefined {
	const values = def.attributes.map((a) => effective(d.attributes[a]));
	if (values.some((v) => v === undefined)) return undefined;
	const best = Math.max(...(values as number[]));
	return Math.floor(def.fraction === 'half' ? best / 2 : best / 5);
}

export function evaluateSkills(d: Derivation): SkillView[] {
	const views: SkillView[] = [];
	for (const def of allSkillDefs(d)) {
		const category: SkillCategory = def.category ?? 'general';
		const declared = d.character.basis.specializations[def.id] ?? [];
		// Spezialisierungen, auf die ein Effekt (z. B. eine Charakteristik) gezielt einen Bonus gibt, werden mitgeführt.
		const fromBonuses = Object.keys(d.skillBonuses)
			.filter((k) => k.startsWith(`${def.id}:`))
			.map((k) => k.slice(def.id.length + 1))
			.filter((spec) => !declared.includes(spec));
		const specs = def.specialization ? [undefined, ...declared, ...fromBonuses] : [undefined];
		for (const specialization of specs) {
			const key = skillKey(def.id, specialization);
			const start = startValue(d, def);
			const setValue = d.skillSetValues[key];
			// Boni auf die Fertigkeit ohne Spezialisierung gelten für jede ihrer Spezialisierungen.
			const bonuses = [...(specialization ? (d.skillBonuses[def.id] ?? []) : []), ...(d.skillBonuses[key] ?? [])];
			const baseValue = setValue ? setValue.value : start;
			const value = baseValue === undefined ? undefined : baseValue + bonuses.reduce((s, m) => s + m.value, 0);
			views.push({
				key,
				skillId: def.id,
				name: specialization ? `${def.name}: ${specialization}` : def.name,
				specialization,
				needsSpecialization: def.specialization,
				category,
				group: def.group,
				attributes: def.attributes,
				fraction: def.fraction,
				start,
				setValue,
				bonuses,
				value,
				half: value === undefined ? undefined : Math.floor(value / 2),
				fifth: value === undefined ? undefined : Math.floor(value / 5)
			});
		}
	}
	return views;
}
