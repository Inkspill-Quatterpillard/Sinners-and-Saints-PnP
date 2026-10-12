import type { RuleData } from '$lib/ruleData';
import type { Character, CharacterStatus } from './character';

/** Alles, was die Oberfläche über einen Charakter anzeigt. */
export interface CharacterView {
	id: string;
	name: string;
	status: CharacterStatus;
}

export function computeView(character: Character, _ruleData: RuleData): CharacterView {
	return {
		id: character.id,
		name: character.basis.name,
		status: character.status
	};
}
