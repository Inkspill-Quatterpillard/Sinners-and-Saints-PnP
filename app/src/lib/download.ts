import { exportCharacter, forExport, type Character } from '$lib/engine';
import { ruleData } from '$lib/ruleData';

/** Lädt den Charakter als Datei herunter; abgeschlossene ohne Reste früherer Entscheidungen. */
export function downloadCharacter(c: Character) {
	const url = URL.createObjectURL(new Blob([exportCharacter(forExport(c, ruleData))], { type: 'application/json' }));
	const a = document.createElement('a');
	a.href = url;
	a.download = `${(c.basis.name || 'charakter').replace(/[^\p{L}\p{N}_-]+/gu, '_')}.sns.json`;
	a.click();
	URL.revokeObjectURL(url);
}
