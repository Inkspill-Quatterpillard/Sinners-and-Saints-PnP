import { applyAction, computeView, type Action, type Character } from '$lib/engine';
import { ruleData } from '$lib/ruleData';
import { loadCharacter, saveCharacter } from '$lib/storage/characterStore';

const HISTORY_LIMIT = 100;

/**
 * Die Sitzung um einen geöffneten Charakter: Sie wendet Aktionen an, speichert nach jeder Aktion
 * den aktuellen Stand und merkt sich frühere Stände nur im Speicher, damit „Rückgängig“ und
 * „Wiederherstellen“ funktionieren.
 */
export class CharacterSession {
	// Der Regelkern liefert bei jeder Aktion einen neuen Charakter, daher genügt $state.raw.
	character = $state.raw<Character | undefined | null>(undefined);
	view = $derived(this.character ? computeView(this.character, ruleData) : undefined);
	#history = $state.raw<Character[]>([]);
	#future = $state.raw<Character[]>([]);
	canUndo = $derived(this.#history.length > 0);
	canRedo = $derived(this.#future.length > 0);

	async load(id: string) {
		this.character = (await loadCharacter(id)) ?? null;
		this.#history = [];
		this.#future = [];
	}

	dispatch = (action: Action) => {
		if (!this.character) return;
		const next = applyAction(this.character, action, ruleData);
		this.#history = [...this.#history.slice(-HISTORY_LIMIT + 1), this.character];
		this.#future = [];
		this.character = next;
		saveCharacter(next);
	};

	undo = () => {
		const previous = this.#history.at(-1);
		if (!previous) return;
		this.#history = this.#history.slice(0, -1);
		if (this.character) this.#future = [...this.#future, this.character];
		this.character = previous;
		saveCharacter(previous);
	};

	redo = () => {
		const next = this.#future.at(-1);
		if (!next) return;
		this.#future = this.#future.slice(0, -1);
		if (this.character) this.#history = [...this.#history, this.character];
		this.character = next;
		saveCharacter(next);
	};
}
