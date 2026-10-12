import { applyAction, computeView, type Action, type Character } from '$lib/engine';
import { ruleData } from '$lib/ruleData';
import { loadCharacter, saveCharacter } from '$lib/storage/characterStore';

const HISTORY_LIMIT = 100;

/**
 * Die Sitzung um einen geöffneten Charakter: Sie wendet Aktionen an, speichert nach jeder Aktion
 * den aktuellen Stand und merkt sich frühere Stände nur im Speicher, damit „Rückgängig“ funktioniert.
 */
export class CharacterSession {
	// Der Regelkern liefert bei jeder Aktion einen neuen Charakter, daher genügt $state.raw.
	character = $state.raw<Character | undefined | null>(undefined);
	view = $derived(this.character ? computeView(this.character, ruleData) : undefined);
	#history = $state.raw<Character[]>([]);
	canUndo = $derived(this.#history.length > 0);

	async load(id: string) {
		this.character = (await loadCharacter(id)) ?? null;
		this.#history = [];
	}

	dispatch = (action: Action) => {
		if (!this.character) return;
		const next = applyAction(this.character, action, ruleData);
		this.#history = [...this.#history.slice(-HISTORY_LIMIT + 1), this.character];
		this.character = next;
		saveCharacter(next);
	};

	undo = () => {
		const previous = this.#history.at(-1);
		if (!previous) return;
		this.#history = this.#history.slice(0, -1);
		this.character = previous;
		saveCharacter(previous);
	};
}
