import type { AttributeId, RuleData } from '$lib/ruleData';
import type { Character } from './character';

export type StepId = 'options' | 'attributes';
export type StepStatus = 'open' | 'valid' | 'invalid';

/** Ein Hinweis zu einer Entscheidung: eine Warnung oder eine ungültige Entscheidung mit Begründung. */
export interface Issue {
	step: StepId;
	severity: 'warning' | 'invalid';
	message: string;
}

export interface StepResult {
	id: StepId;
	status: StepStatus;
}

/** Ein Beitrag zu einem Wert, mit seiner Herkunft (z. B. „Spezies: Zwerg“). */
export interface Modifier {
	source: string;
	value: number;
}

export interface AttributeState {
	base?: number;
	modifiers: Modifier[];
}

/**
 * Der Zwischenstand, den die Schritte der Erstellung der Reihe nach aufbauen.
 * Jeder Schritt liest, was frühere Schritte beigetragen haben, und ergänzt seinen Teil.
 */
export interface Derivation {
	character: Character;
	ruleData: RuleData;
	options: { optionalRules: Record<string, boolean>; setting: string };
	attributes: Record<AttributeId, AttributeState>;
	steps: StepResult[];
	issues: Issue[];
}

export function effective(state: AttributeState): number | undefined {
	if (state.base === undefined) return undefined;
	return state.base + state.modifiers.reduce((sum, m) => sum + m.value, 0);
}
