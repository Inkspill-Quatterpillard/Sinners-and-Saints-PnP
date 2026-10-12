import { exportCharacter, type Character } from '$lib/engine';

/** Lädt den Charakter als Datei herunter. */
export function downloadCharacter(c: Character) {
	const url = URL.createObjectURL(new Blob([exportCharacter(c)], { type: 'application/json' }));
	const a = document.createElement('a');
	a.href = url;
	a.download = `${(c.basis.name || 'charakter').replace(/[^\p{L}\p{N}_-]+/gu, '_')}.sns.json`;
	a.click();
	URL.revokeObjectURL(url);
}
