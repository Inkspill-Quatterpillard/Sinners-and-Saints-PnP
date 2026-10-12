/** Version des Formats der Charakterdatei. Ältere Dateien werden beim Laden migriert. */
export const FORMAT_VERSION = 1;

export type CharacterStatus = 'inCreation' | 'finished';

/** Die aktuellen Entscheidungen der Charaktererstellung. */
export interface Basis {
	name: string;
}

/** Die im Spiel wechselnden Werte des lebenden Bogens. */
export type PlayState = Record<string, never>;

/** Ein Charakter speichert nur seinen aktuellen Stand, nicht den Weg dorthin. */
export interface Character {
	formatVersion: number;
	id: string;
	/** Version der Regeldaten bei der letzten Änderung. */
	ruleDataVersion: number;
	status: CharacterStatus;
	basis: Basis;
	play: PlayState;
}

export function createCharacter(id: string, ruleDataVersion = 0): Character {
	return {
		formatVersion: FORMAT_VERSION,
		id,
		ruleDataVersion,
		status: 'inCreation',
		basis: { name: '' },
		play: {}
	};
}
