/** Römische Stufenzahl für Kampftechniken und Zauber; 0 = keine Stufe. */
export function roman(tier: number): string {
	return ['', 'I', 'II', 'III', 'IV'][tier] ?? String(tier);
}

/** Liest eine Anzahl aus einem Eingabefeld: ganze Zahl ab 0, sonst `undefined`. */
export function parseCount(text: string): number | undefined {
	const n = Math.floor(Number(text.trim().replace(',', '.')));
	return text.trim() && Number.isFinite(n) && n >= 0 ? n : undefined;
}
