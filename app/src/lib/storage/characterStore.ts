import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { normalizeCharacter, type Character } from '$lib/engine';

interface SnsDB extends DBSchema {
	characters: { key: string; value: Character };
}

let db: Promise<IDBPDatabase<SnsDB>> | undefined;

function open() {
	db ??= openDB<SnsDB>('sns-charaktere', 1, {
		upgrade(database) {
			database.createObjectStore('characters', { keyPath: 'id' });
		}
	});
	return db;
}

/** Gespeicherte Charaktere werden beim Lesen auf das aktuelle Format gebracht (Migration, fehlende Felder). */
function normalized(raw: unknown): Character | undefined {
	const result = normalizeCharacter(raw);
	return result.ok ? result.character : undefined;
}

export async function listCharacters(): Promise<Character[]> {
	const all = await (await open()).getAll('characters');
	return all.map(normalized).filter((c): c is Character => !!c);
}

export async function loadCharacter(id: string): Promise<Character | undefined> {
	return normalized(await (await open()).get('characters', id));
}

export async function saveCharacter(character: Character): Promise<void> {
	await (await open()).put('characters', character);
}

export async function deleteCharacter(id: string): Promise<void> {
	await (await open()).delete('characters', id);
}
