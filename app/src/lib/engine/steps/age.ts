import type { AttributeId, SpeciesDef, ThresholdTable } from '$lib/ruleData';
import type { Basis, Roll } from '../character';
import { effective, type Derivation, type StepStatus } from '../derivation';
import { messages } from '../messages';
import type { SecondaryValue } from './secondary';

export type AgeStage = 'child' | 'youth' | 'adult' | 'aging';

export type AgeAction =
	| { type: 'setAge'; years: number | undefined }
	| { type: 'setYoungMalus'; attribute: AttributeId; points: number }
	| { type: 'rollMaturity'; index: number; attribute: AttributeId; roll: Roll }
	| { type: 'setMaturityAttribute'; index: number; attribute: AttributeId }
	| { type: 'setAtrophia'; index: number; attribute: AttributeId }
	| { type: 'rollSenility'; index: number; roll: Roll };

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
	atrophia: { required: number; assigned: AttributeId[]; slots: (AttributeId | undefined)[] };
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

export function applyAgeAction(basis: Basis, action: AgeAction): void {
	const age = basis.age;
	switch (action.type) {
		case 'setAge':
			age.years = action.years;
			break;
		case 'setYoungMalus':
			if (action.points > 0) age.youngMalus[action.attribute] = action.points;
			else delete age.youngMalus[action.attribute];
			break;
		case 'rollMaturity':
			age.maturity[action.index] = { attribute: action.attribute, roll: action.roll };
			break;
		case 'setMaturityAttribute': {
			const entry = age.maturity[action.index];
			if (entry) entry.attribute = action.attribute;
			break;
		}
		case 'setAtrophia':
			age.atrophia[action.index] = action.attribute;
			break;
		case 'rollSenility':
			age.senility[action.index] = action.roll;
			break;
	}
}

export function ageStageOf(species: SpeciesDef, years: number): { stage: AgeStage; agingStages: number } {
	const a = species.age;
	if (years < a.childUnder) return { stage: 'child', agingStages: 0 };
	if (years < a.youthUnder) return { stage: 'youth', agingStages: 0 };
	if (years < a.adultUnder) return { stage: 'adult', agingStages: 0 };
	return { stage: 'aging', agingStages: Math.floor((years - a.adultUnder) / a.agingInterval) + 1 };
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
		atrophia: { required: 0, assigned: [], slots: [] }
	};
	if (basis.years === undefined || !species) {
		d.steps.push({ id: 'age', status: 'open' });
		return view;
	}

	const { stage, agingStages } = ageStageOf(species, basis.years);
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

	// Reifewürfe: nacheinander gegen den jeweils aktuellen Wert; Erfolg gibt +1.
	if (stage === 'adult' || stage === 'aging') {
		const count = rules.adultMaturityRolls + agingStages * species.age.perStage.maturity;
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

	// Atrophia: je Punkt ein frei wählbares körperliches Attribut −1.
	const atrophiaCount = agingStages * species.age.perStage.atrophia;
	view.atrophia.required = atrophiaCount;
	for (let index = 0; index < atrophiaCount; index++) {
		const attr = basis.atrophia[index];
		view.atrophia.slots.push(attr);
		if (!attr) {
			status = worst(status, 'open');
			continue;
		}
		view.atrophia.assigned.push(attr);
		const def = d.ruleData.attributes.find((a) => a.id === attr);
		if (!def?.physical) {
			status = 'invalid';
			d.issues.push({ step: 'age', severity: 'invalid', message: messages.atrophiaNotPhysical(attr) });
			continue;
		}
		d.attributes[attr].modifiers.push({ source: messages.atrophiaSource, value: -1 });
	}

	// Durch Altersmali darf kein Attribut unter das Minimum fallen.
	for (const attr of d.ruleData.attributes) {
		const state = d.attributes[attr.id];
		const value = effective(state);
		const fromAge = state.modifiers.some((m) => m.value < 0 && (m.source === messages.atrophiaSource || m.source.startsWith(messages.ageSourcePrefix)));
		if (value !== undefined && fromAge && value < rules.minimumAttribute) {
			status = 'invalid';
			d.issues.push({ step: 'age', severity: 'invalid', message: messages.belowMinimum(attr.id, value, rules.minimumAttribute) });
		}
	}

	// Bewegung sinkt ab den 50ern.
	const movement = lookupAgeTable(rules.movementByAge, basis.years);
	if (movement) d.secondary.movement.push({ source: messages.ageMovementSource, value: movement });

	d.steps.push({ id: 'age', status });
	return view;
}

/** Vergreisungswürfe: W100 gegen die Stabilität; liegt der Wurf höher, sinkt sie um 5. */
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
	d.steps.push({ id: 'senility', status });
	return view;
}
