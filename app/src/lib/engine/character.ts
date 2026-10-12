import type { AttributeId } from '$lib/ruleData';
import type { ChoiceState } from './choices';
import type { CharacteristicMode } from './steps/characteristic';

/** Version des Formats der Charakterdatei. Ältere Dateien werden beim Laden migriert. */
export const FORMAT_VERSION = 1;

export type CharacterStatus = 'inCreation' | 'finished';

/** Ein Würfelergebnis: die einzelnen Würfel und ob die App gewürfelt oder der Spieler eingetragen hat. */
export interface Roll {
	dice: number[];
	source: 'app' | 'manual';
}

export type AttributeMethod = 'roll' | 'array';

/** Die aktuellen Entscheidungen der Charaktererstellung. */
export interface Basis {
	name: string;
	options: {
		/** Nur ausdrücklich gesetzte Werte; sonst gilt die Voreinstellung der Regeldaten. */
		optionalRules: Record<string, boolean>;
		setting?: string;
	};
	attributes: {
		method?: AttributeMethod;
		/** Würfe je Platz (Schlüssel = Platznummer), nur beim Verfahren „würfeln“. */
		rolls: Record<number, Roll>;
		/** Welcher Platz welchem Grundattribut zugeordnet ist. */
		assignment: Partial<Record<AttributeId, number>>;
	};
	species?: string;
	religion?: string;
	origin: {
		/** Besondere Herkunft oder stattdessen ein zweites Kunststück (nur mit der optionalen Regel). */
		choice?: 'origin' | 'stunt';
		origin?: string;
	};
	/** Gewählte Kunststücke. */
	stunts: string[];
	/** Gewählte Kampftechniken (IDs „Fertigkeit:Name“). */
	techniques: string[];
	/** Gewählter Kampfstil. */
	style?: string;
	characteristics: {
		mode?: CharacteristicMode;
		/** Frei gewählte bzw. eingetragene Charakteristik je Platz. */
		picks: Record<number, string>;
		/** W100-Würfe je Platz. */
		rolls: Record<number, Roll>;
		/** Plätze, die bereits neu gewürfelt wurden. */
		rerolledSlots: Record<number, true>;
	};
	age: {
		years?: number;
		/** Verteilte Malus-Punkte junger Charaktere je Attribut. */
		youngMalus: Partial<Record<AttributeId, number>>;
		/** Reifewürfe je Nummer, mit dem gewählten Zielattribut. */
		maturity: Record<number, { attribute: AttributeId; roll: Roll }>;
		/** Atrophia-Punkte je Nummer: das betroffene körperliche Attribut. */
		atrophia: Record<number, AttributeId>;
		/** Vergreisungswürfe je Nummer. */
		senility: Record<number, Roll>;
	};
	profession: {
		name: string;
		/** Schlüssel der Professionsfertigkeiten (bei Spezialisierungen „id:Spezialisierung“). */
		skills: string[];
		statusRoll?: Roll;
		/** Heldenfertigkeit je Platz; die Plätze entsprechen den Werten 14/12/10/8/8. */
		heroSlots: Record<number, string>;
	};
	interests: {
		/** Ausdrücklich gewählte Grundlage; sonst gilt das höhere von KLU und INT. */
		basis?: AttributeId;
		/** Punkte je Fertigkeitsschlüssel oder „status“. */
		points: Record<string, number>;
	};
	/** Angelegte Spezialisierungen je Fertigkeit, z. B. Wissenschaften: Alchemie. */
	specializations: Record<string, string[]>;
	/** Glückswurf (bei Vorteil zwei Würfel). */
	luck?: Roll;
	/** Wahlen bei Eigenschaften usw., je Eintrag (siehe `ChoiceState`). */
	choices: Record<string, ChoiceState>;
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
		basis: {
			name: '',
			options: { optionalRules: {} },
			attributes: { rolls: {}, assignment: {} },
			origin: {},
			stunts: [],
			techniques: [],
			characteristics: { picks: {}, rolls: {}, rerolledSlots: {} },
			age: { youngMalus: {}, maturity: {}, atrophia: {}, senility: {} },
			profession: { name: '', skills: [], heroSlots: {} },
			interests: { points: {} },
			specializations: {},
			choices: {}
		},
		play: {}
	};
}
