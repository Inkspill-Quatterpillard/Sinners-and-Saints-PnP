import type { AttributeId, Effect, TraitDef } from '$lib/ruleData';
import type { Basis } from './character';
import { addSkillBonus, effective, skillKeyExists, type Derivation, type StepId, type StepStatus } from './derivation';
import { messages } from './messages';

/**
 * Wahlen bei Eigenschaften, Religionen, Herkünften usw.: zu jedem Eintrag mit Wahl
 * die gewählte Option und, falls nötig, ein gewähltes Attribut.
 * Die Wahlen bleiben gespeichert, auch wenn der Eintrag gerade nicht gilt (z. B. nach einem Spezieswechsel).
 */
export interface ChoiceState {
	option?: string;
	attribute?: AttributeId;
	/** Gewählte Fertigkeit (Schlüssel) bei Effekten wie „+2 auf eine beliebige Fertigkeit“. */
	skill?: string;
}

export type ChoiceAction =
	| { type: 'chooseTraitOption'; trait: string; option: string }
	| { type: 'chooseTraitAttribute'; trait: string; attribute: AttributeId }
	| { type: 'chooseTraitSkill'; trait: string; skill: string };

export function applyChoiceAction(basis: Basis, action: ChoiceAction): void {
	const state = (basis.choices[action.trait] ??= {});
	if (action.type === 'chooseTraitOption') state.option = action.option;
	else if (action.type === 'chooseTraitAttribute') state.attribute = action.attribute;
	else state.skill = action.skill;
}

export interface TraitView {
	id: string;
	name: string;
	text: string;
	options?: { id: string; name: string; text?: string }[];
	chosenOption?: string;
	/** Bei Gleichstand (oder ungültiger Wahl) für „höchstes Attribut“: die Attribute, zwischen denen der Spieler wählt. */
	tiedAttributes?: AttributeId[];
	chosenAttribute?: AttributeId;
	/** Bei „Bonus auf eine beliebige Fertigkeit“: ob Heldenfertigkeiten erlaubt sind und welche gewählt ist. */
	skillChoice?: { includeHeroSkills: boolean; value: number; chosen?: string };
	/** Gesetzt, wenn die getroffene Wahl ungültig ist. */
	invalid?: string;
}

function requiresCharacteristic(effects: Effect[]): boolean {
	return effects.some((e) => e.type === 'extraCharacteristic');
}

function highestAttributes(d: Derivation): AttributeId[] | undefined {
	const values = d.ruleData.attributes.map((a) => [a.id, effective(d.attributes[a.id])] as const);
	if (values.some(([, v]) => v === undefined)) return undefined;
	const max = Math.max(...values.map(([, v]) => v!));
	return values.filter(([, v]) => v === max).map(([id]) => id);
}

/**
 * Wendet einen Eintrag mit seinen Effekten an und liefert den Zustand seiner Wahl.
 * `open`, solange eine nötige Wahl fehlt; `invalid`, wenn die getroffene Wahl nicht (mehr) zulässig ist.
 */
export function applyTrait(d: Derivation, trait: TraitDef, step: StepId): { status: StepStatus; view: TraitView } {
	const view: TraitView = { id: trait.id, name: trait.name, text: trait.text };
	let status: StepStatus = 'valid';
	const effects: Effect[] = [...(trait.effects ?? [])];
	const choice = d.character.basis.choices[trait.id] ?? {};
	d.appliedTraits.push(trait.id);

	if (trait.options) {
		view.options = trait.options.map((o) => ({ id: o.id, name: o.name, text: o.text }));
		const option = trait.options.find((o) => o.id === choice.option);
		view.chosenOption = option?.id;
		if (!option) {
			status = 'open';
		} else if (requiresCharacteristic(option.effects) && !d.options.optionalRules.charakteristik) {
			view.invalid = messages.optionNeedsCharacteristic(trait.name);
			status = 'invalid';
		} else {
			effects.push(...option.effects);
		}
	}

	for (const effect of effects) {
		const result = applyEffect(d, effect, trait, choice, view);
		if (result === 'invalid') status = 'invalid';
		else if (result === 'open' && status === 'valid') status = 'open';
	}
	if (view.invalid) d.issues.push({ step, severity: 'invalid', message: view.invalid });
	return { status, view };
}

function applyEffect(d: Derivation, effect: Effect, trait: TraitDef, choice: ChoiceState, view: TraitView): StepStatus {
	switch (effect.type) {
		case 'attribute':
			d.attributes[effect.attribute].modifiers.push({ source: trait.name, value: effect.value });
			return 'valid';
		case 'secondary':
			d.secondary[effect.key].push({ source: trait.name, value: effect.value });
			if (effect.max !== undefined) {
				d.secondaryCaps[effect.key] = Math.min(d.secondaryCaps[effect.key] ?? Infinity, effect.max);
			}
			return 'valid';
		case 'extraCharacteristic':
			d.characteristicAllowance.extra += effect.count;
			return 'valid';
		case 'meditationDie':
			d.meditationDie = effect.sides;
			return 'valid';
		case 'luckAdvantage':
			d.luckAdvantages += 1;
			return 'valid';
		case 'status':
			d.status.modifiers.push({ source: trait.name, value: effect.value });
			return 'valid';
		case 'skill':
			addSkillBonus(d, effect.skill, { source: trait.name, value: effect.value });
			return 'valid';
		case 'resource':
			d.resources.push({ id: effect.id, name: effect.name, per: effect.per, uses: effect.uses, source: trait.name });
			return 'valid';
		case 'counter':
			d.counters.push({ id: effect.id, name: effect.name, start: effect.start, max: effect.max, source: trait.name });
			return 'valid';
		case 'secondaryPercent':
			d.secondaryPercent[effect.key] = (d.secondaryPercent[effect.key] ?? 0) + effect.percent;
			return 'valid';
		case 'skillChoice': {
			view.skillChoice = { includeHeroSkills: effect.includeHeroSkills, value: effect.value, chosen: choice.skill };
			if (!choice.skill) return 'open';
			if (!skillKeyExists(d, choice.skill, effect.includeHeroSkills)) {
				view.invalid = messages.skillChoiceInvalid(trait.name, choice.skill, effect.includeHeroSkills);
				return 'invalid';
			}
			addSkillBonus(d, choice.skill, { source: trait.name, value: effect.value });
			return 'valid';
		}
		case 'highestAttribute': {
			const highest = highestAttributes(d);
			if (!highest) return 'open';
			let target: AttributeId | undefined;
			if (highest.length > 1) view.tiedAttributes = highest;
			if (choice.attribute) {
				view.chosenAttribute = choice.attribute;
				if (!highest.includes(choice.attribute)) {
					// Die zulässigen Attribute anbieten, damit der Spieler neu wählen kann.
					view.tiedAttributes = highest;
					view.invalid = messages.notHighestAttribute(trait.name, choice.attribute, highest);
					return 'invalid';
				}
				target = choice.attribute;
			} else if (highest.length === 1) {
				target = highest[0];
			} else {
				return 'open';
			}
			for (const attr of d.ruleData.attributes) {
				d.attributes[attr.id].modifiers.push({
					source: trait.name,
					value: attr.id === target ? effect.bonus : effect.others
				});
			}
			return 'valid';
		}
	}
}
