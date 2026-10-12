import type { AttributeId, RuleData, SpeciesDef, ThresholdTable } from '$lib/ruleData';
import type { Basis, Roll } from '../character';
import { effective, type Derivation, type StepStatus } from '../derivation';
import { messages } from '../messages';
import type { SecondaryValue } from './secondary';

export type AgeStage = 'child' | 'youth' | 'adult' | 'aging';

export type AgeAction =
	/** Alter in Jahren (optional); legt auch die Altersstufe fest. */
	| { type: 'setAge'; years: number | undefined }
	/** Altersstufe wählen; bei „gealtert“ mit Anzahl der Alterungsstufen. Passt das eingetragene Alter nicht, wird es entfernt. */
	| { type: 'setAgeStage'; stage: AgeStage; agingStages?: number }
	| { type: 'setYoungMalus'; attribute: AttributeId; points: number }
	/** Ohne `roll` wird der Wurf zurückgesetzt. */
	| { type: 'rollMaturity'; index: number; attribute: AttributeId; roll: Roll | undefined }
	| { type: 'setMaturityAttribute'; index: number; attribute: AttributeId }
	| { type: 'setAtrophiaPoints'; attribute: AttributeId; points: number }
	| { type: 'rollSenility'; index: number; roll: Roll | undefined };

export interface MaturityRollView {
	index: number;
	attribute?: AttributeId;
	roll?: Roll;
	/** Wert, gegen den gewürfelt wurde (zum Zeitpunkt dieses Wurfs). */
	target?: number;
	success?: boolean;
}

export interface AgeStepView {
	years?: number;
	stage?: AgeStage;
	agingStages: number;
	youngMalus: { required: number; distributed: number; attributes: AttributeId[]; points: Partial<Record<AttributeId, number>> };
	maturityRolls: MaturityRollView[];
	atrophia: {
		required: number;
		distributed: number;
		points: Partial<Record<AttributeId, number>>;
		/** Wie viele Punkte je körperlichem Attribut noch höchstens möglich sind, ohne unter das Minimum zu fallen. */
		maxPerAttribute: Partial<Record<AttributeId, number>>;
	};
}

export interface SenilityRollView {
	index: number;
	roll?: Roll;
	target?: number;
	success?: boolean;
}

export interface SenilityView {
	rolls: SenilityRollView[];
}

export function ageStageOf(species: SpeciesDef, years: number): { stage: AgeStage; agingStages: number } {
	const a = species.age;
	if (years < a.childUnder) return { stage: 'child', agingStages: 0 };
	if (years < a.youthUnder) return { stage: 'youth', agingStages: 0 };
	if (years < a.adultUnder) return { stage: 'adult', agingStages: 0 };
	return { stage: 'aging', agingStages: Math.floor((years - a.adultUnder) / a.agingInterval) + 1 };
}

/** Untergrenze der Jahre einer Altersstufe; dient als Alter, wenn keine Jahreszahl eingetragen ist. */
export function stageStartYears(species: SpeciesDef, stage: AgeStage, agingStages: number): number {
	const a = species.age;
	if (stage === 'child') return 0;
	if (stage === 'youth') return a.childUnder;
	if (stage === 'adult') return a.youthUnder;
	return a.adultUnder + (Math.max(1, agingStages) - 1) * a.agingInterval;
}

export function applyAgeAction(basis: Basis, action: AgeAction, rd: RuleData): void {
	const age = basis.age;
	const species = rd.species.find((s) => s.id === basis.species);
	switch (action.type) {
		case 'setAge':
			age.years = action.years;
			if (action.years !== undefined && species) {
				const derived = ageStageOf(species, action.years);
				age.stage = derived.stage;
				age.agingStages = derived.agingStages;
			}
			break;
		case 'setAgeStage': {
			age.stage = action.stage;
			age.agingStages = action.stage === 'aging' ? Math.max(1, action.agingStages ?? age.agingStages ?? 1) : 0;
			if (age.years !== undefined && species) {
				const derived = ageStageOf(species, age.years);
				if (derived.stage !== age.stage || derived.agingStages !== age.agingStages) delete age.years;
			}
			break;
		}
		case 'setYoungMalus':
			if (action.points > 0) age.youngMalus[action.attribute] = action.points;
			else delete age.youngMalus[action.attribute];
			break;
		case 'rollMaturity':
			if (action.roll) age.maturity[action.index] = { attribute: action.attribute, roll: action.roll };
			else delete age.maturity[action.index];
			break;
		case 'setMaturityAttribute': {
			const entry = age.maturity[action.index];
			if (entry) entry.attribute = action.attribute;
			break;
		}
		case 'setAtrophiaPoints':
			if (action.points > 0) age.atrophia[action.attribute] = Math.floor(action.points);
			else delete age.atrophia[action.attribute];
			break;
		case 'rollSenility':
			if (action.roll) age.senility[action.index] = action.roll;
			else delete age.senility[action.index];
			break;
	}
}

function lookupAgeTable(table: ThresholdTable, value: number): number {
	let result = 0;
	for (const row of table) if (value >= row.min) result = row.value;
	return result;
}

const worst = (a: StepStatus, b: StepStatus): StepStatus =>
	a === 'invalid' || b === 'invalid' ? 'invalid' : a === 'open' || b === 'open' ? 'open' : 'valid';

/** Alter: Mali junger Charaktere, Reifewürfe und Atrophia. Die Vergreisung folgt nach den Sekundärattributen. */
export function evaluateAge(d: Derivation): AgeStepView {
	const rules = d.ruleData.age;
	const basis = d.character.basis.age;
	const species = d.ruleData.species.find((s) => s.id === d.character.basis.species);
	const view: AgeStepView = {
		years: basis.years,
		agingStages: 0,
		youngMalus: { required: 0, distributed: 0, attributes: rules.youngMalus.attributes, points: basis.youngMalus },
		maturityRolls: [],
		atrophia: { required: 0, distributed: 0, points: basis.atrophia, maxPerAttribute: {} }
	};
	// Altersstufe: Eingetragene Jahre gehen vor (so passt sie sich auch beim Spezieswechsel an), sonst die gewählte Stufe.
	const resolved = !species
		? undefined
		: basis.years !== undefined
			? ageStageOf(species, basis.years)
			: basis.stage
				? { stage: basis.stage, agingStages: basis.stage === 'aging' ? Math.max(1, basis.agingStages ?? 1) : 0 }
				: undefined;
	if (!species || !resolved) {
		d.steps.push({ id: 'age', status: 'open' });
		return view;
	}

	const { stage, agingStages } = resolved;
	view.stage = stage;
	view.agingStages = agingStages;
	d.ageStage = stage;
	d.agingStages = agingStages;
	let status: StepStatus = 'valid';

	// Kinder und Jugendliche: Malus frei verteilt, Glück mit Vorteil, Kinder +2 Glück.
	if (stage === 'child' || stage === 'youth') {
		const required = stage === 'child' ? rules.youngMalus.child : rules.youngMalus.youth;
		const source = messages.ageSource(stage);
		let distributed = 0;
		for (const [attr, points] of Object.entries(basis.youngMalus) as [AttributeId, number][]) {
			if (!rules.youngMalus.attributes.includes(attr)) {
				status = 'invalid';
				d.issues.push({ step: 'age', severity: 'invalid', message: messages.malusWrongAttribute(attr) });
				continue;
			}
			distributed += points;
			d.attributes[attr].modifiers.push({ source, value: -points });
		}
		view.youngMalus.required = required;
		view.youngMalus.distributed = distributed;
		if (distributed > required) {
			status = 'invalid';
			d.issues.push({ step: 'age', severity: 'invalid', message: messages.tooMuchMalus(distributed, required) });
		} else if (distributed < required) {
			status = worst(status, 'open');
		}
		d.luckAdvantages += 1;
		if (stage === 'child') d.secondary.luck.push({ source, value: rules.childLuckBonus });
	}

	// Reifewürfe: nacheinander gegen den jeweils aktuellen Wert; Erfolg gibt +1. Manche Spezies haben eine Höchstzahl.
	if (stage === 'adult' || stage === 'aging') {
		const count = Math.min(
			rules.adultMaturityRolls + agingStages * species.age.perStage.maturity,
			species.age.maxMaturityRolls ?? Infinity
		);
		for (let index = 0; index < count; index++) {
			const entry = basis.maturity[index];
			const rollView: MaturityRollView = { index, attribute: entry?.attribute, roll: entry?.roll };
			if (entry?.roll && entry.attribute) {
				const target = effective(d.attributes[entry.attribute]);
				if (target !== undefined) {
					rollView.target = target;
					rollView.success = entry.roll.dice[0] > target;
					if (rollView.success) d.attributes[entry.attribute].modifiers.push({ source: messages.maturitySource, value: 1 });
				}
			} else {
				status = worst(status, 'open');
			}
			view.maturityRolls.push(rollView);
		}
	}

	// Atrophia: Punkte frei auf körperliche Attribute verteilt, je Punkt −1.
	const required = agingStages * species.age.perStage.atrophia;
	view.atrophia.required = required;
	let distributed = 0;
	for (const [attr, points] of Object.entries(basis.atrophia) as [AttributeId, number][]) {
		if (!d.ruleData.attributes.find((a) => a.id === attr)?.physical) {
			status = 'invalid';
			d.issues.push({ step: 'age', severity: 'invalid', message: messages.atrophiaNotPhysical(attr) });
			continue;
		}
		distributed += points;
		d.attributes[attr].modifiers.push({ source: messages.atrophiaSource, value: -points });
	}
	view.atrophia.distributed = distributed;
	if (distributed > required) {
		status = 'invalid';
		d.issues.push({ step: 'age', severity: 'invalid', message: messages.tooMuchAtrophia(distributed, required) });
	} else if (distributed < required) {
		status = worst(status, 'open');
	}

	// Durch Altersmali darf kein Attribut unter das Minimum fallen.
	for (const attr of d.ruleData.attributes) {
		const state = d.attributes[attr.id];
		const value = effective(state);
		if (attr.physical && value !== undefined) {
			view.atrophia.maxPerAttribute[attr.id] = Math.max(0, (basis.atrophia[attr.id] ?? 0) + value - rules.minimumAttribute);
		}
		const fromAge = state.modifiers.some(
			(m) => m.value < 0 && (m.source === messages.atrophiaSource || m.source.startsWith(messages.ageSourcePrefix))
		);
		if (value !== undefined && fromAge && value < rules.minimumAttribute) {
			status = 'invalid';
			d.issues.push({ step: 'age', severity: 'invalid', message: messages.belowMinimum(attr.id, value, rules.minimumAttribute) });
		}
	}

	// Bewegung sinkt ab den 50ern (ohne Jahreszahl gilt der Beginn der Altersstufe).
	const years = basis.years ?? stageStartYears(species, stage, agingStages);
	const movement = lookupAgeTable(rules.movementByAge, years);
	if (movement) d.secondary.movement.push({ source: messages.ageMovementSource, value: movement });

	d.steps.push({ id: 'age', status });
	return view;
}

/**
 * Vergreisungswürfe: W100 gegen die Stabilität; liegt der Wurf höher, sinkt sie um 5.
 * Sie gehören zum Schritt „Alter“, werden aber erst ausgewertet, wenn die Stabilität feststeht.
 */
export function evaluateSenility(d: Derivation, stability: SecondaryValue): SenilityView {
	const species = d.ruleData.species.find((s) => s.id === d.character.basis.species);
	const count = species && d.agingStages ? d.agingStages * species.age.perStage.senility : 0;
	const view: SenilityView = { rolls: [] };
	if (count === 0) return view;

	const loss = d.ruleData.age.senilityStabilityLoss;
	let status: StepStatus = 'valid';
	for (let index = 0; index < count; index++) {
		const roll = d.character.basis.age.senility[index];
		const rollView: SenilityRollView = { index, roll };
		if (roll && stability.value !== undefined) {
			rollView.target = stability.value;
			rollView.success = roll.dice[0] > stability.value;
			if (rollView.success) {
				stability.modifiers = [...stability.modifiers, { source: messages.senilitySource, value: -loss }];
				stability.value -= loss;
			}
		} else {
			status = 'open';
		}
		view.rolls.push(rollView);
	}
	const ageStep = d.steps.find((s) => s.id === 'age');
	if (ageStep) ageStep.status = worst(ageStep.status, status);
	return view;
}
