import type { RuleData } from '$lib/ruleData';
import type { Character } from './character';

export type Action = { type: 'setName'; name: string };

/** Wendet eine Aktion an und liefert einen neuen Charakter; der übergebene bleibt unverändert. */
export function applyAction(character: Character, action: Action, ruleData: RuleData): Character {
	const next = structuredClone(character);
	next.ruleDataVersion = ruleData.version;
	switch (action.type) {
		case 'setName':
			next.basis.name = action.name;
			break;
	}
	return next;
}
