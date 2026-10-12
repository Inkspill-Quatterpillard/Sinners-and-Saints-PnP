/** Römische Stufenzahl für Kampftechniken und Zauber; 0 = keine Stufe. */
export function roman(tier: number): string {
	return ['', 'I', 'II', 'III', 'IV'][tier] ?? String(tier);
}

/** Liest eine Anzahl aus einem Eingabefeld: ganze Zahl ab 0, sonst `undefined`. */
export function parseCount(text: string): number | undefined {
	const n = Math.floor(Number(text.trim().replace(',', '.')));
	return text.trim() && Number.isFinite(n) && n >= 0 ? n : undefined;
}

interface SkillLike {
	fraction: 'half' | 'fifth';
	attributes: string[];
	start?: number;
	setValue?: { source: string; value: number };
	bonuses: { source: string; value: number }[];
}

const signed = (v: number) => (v >= 0 ? `+${v}` : `${v}`);

/** Woher ein Fertigkeitswert kommt, z. B. „½ GES 6 · Profession +5“. */
export function skillOrigin(s: SkillLike, excludeSource?: string): string {
	const base = s.setValue
		? `${s.setValue.source} ${s.setValue.value}`
		: `${s.fraction === 'half' ? '½' : '⅕'} ${s.attributes.join('/')}${s.start === undefined ? '' : ` ${s.start}`}`;
	const bonuses = s.bonuses.filter((b) => b.source !== excludeSource).map((b) => `${b.source} ${signed(b.value)}`);
	return [base, ...bonuses].join(' · ');
}
