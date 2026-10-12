import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Character } from '$lib/engine';

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

export async function listCharacters(): Promise<Character[]> {
	return (await open()).getAll('characters');
}

export async function loadCharacter(id: string): Promise<Character | undefined> {
	return (await open()).get('characters', id);
}

export async function saveCharacter(character: Character): Promise<void> {
	await (await open()).put('characters', character);
}
