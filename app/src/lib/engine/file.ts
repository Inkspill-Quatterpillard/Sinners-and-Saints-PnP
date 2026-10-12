import { createCharacter, FORMAT_VERSION, type Character } from './character';
import { messages } from './messages';

export type ParseResult = { ok: true; character: Character } | { ok: false; error: string };

type Raw = Record<string, unknown>;

/**
 * Migrationen je Formatversion: Jede bringt eine Datei von Version n auf n + 1.
 * Version 0 sind Vorabversionen ohne `formatVersion`.
 */
const MIGRATIONS: Record<number, (raw: Raw) => Raw> = {
	0: (raw) => ({ ...raw, formatVersion: 1 }),
	// Version 2: Atrophia als Punkte je Attribut statt als Liste einzelner Punkte.
	1: (raw) => {
		const basis = isObject(raw.basis) ? raw.basis : {};
		const age = isObject(basis.age) ? basis.age : {};
		const points: Record<string, number> = {};
		if (isObject(age.atrophia)) {
			for (const attr of Object.values(age.atrophia)) if (typeof attr === 'string') points[attr] = (points[attr] ?? 0) + 1;
		}
		return { ...raw, formatVersion: 2, basis: { ...basis, age: { ...age, atrophia: points } } };
	},
	// Version 3: Der Modus „Eintragen“ entfällt; eingetragene Charakteristiken sind Auswahlen im Würfelmodus.
	2: (raw) => {
		const basis = isObject(raw.basis) ? raw.basis : {};
		const ch = isObject(basis.characteristics) ? basis.characteristics : {};
		const characteristics = ch.mode === 'override' ? { ...ch, mode: 'roll' } : ch;
		return { ...raw, formatVersion: 3, basis: { ...basis, characteristics } };
	}
};

const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Ergänzt fehlende Felder aus den Standardwerten; vorhandene Werte (auch Listen) bleiben unverändert. */
function withDefaults<T>(value: unknown, defaults: T): T {
	if (!isObject(defaults) || !isObject(value)) return (value === undefined ? defaults : value) as T;
	const result: Raw = { ...value };
	for (const [key, def] of Object.entries(defaults)) {
		result[key] = withDefaults(value[key], def);
	}
	return result as T;
}

export function exportCharacter(character: Character): string {
	return JSON.stringify(character, null, 2);
}

/**
 * Liest eine Charakterdatei. Geprüft wird nur, ob sie sich laden lässt; Regelkonformität wird nicht erzwungen
 * (von Hand bearbeitete Dateien sind erlaubt). Ältere Formatversionen werden schrittweise migriert.
 */
export function parseCharacterFile(text: string): ParseResult {
	let raw: unknown;
	try {
		raw = JSON.parse(text);
	} catch {
		return { ok: false, error: messages.fileNotJson };
	}
	return normalizeCharacter(raw);
}

/** Bringt ein geladenes Objekt (Datei oder Speicher) auf die aktuelle Formatversion und ergänzt fehlende Felder. */
export function normalizeCharacter(raw: unknown): ParseResult {
	if (!isObject(raw) || typeof raw.id !== 'string' || !isObject(raw.basis)) {
		return { ok: false, error: messages.fileNotCharacter };
	}
	let data: Raw = raw;
	let version = typeof data.formatVersion === 'number' ? data.formatVersion : 0;
	if (version > FORMAT_VERSION) return { ok: false, error: messages.fileTooNew(version, FORMAT_VERSION) };
	while (version < FORMAT_VERSION) {
		const migrate = MIGRATIONS[version];
		if (!migrate) return { ok: false, error: messages.fileNotCharacter };
		data = migrate(data);
		version += 1;
	}
	const character = withDefaults(data, createCharacter(raw.id, 0));
	return { ok: true, character };
}

/** Eine unabhängige Kopie mit neuer ID. */
export function duplicateCharacter(character: Character, id: string): Character {
	const copy = structuredClone(character);
	copy.id = id;
	copy.basis.name = messages.copyName(character.basis.name);
	return copy;
}
