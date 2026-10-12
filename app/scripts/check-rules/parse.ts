// Liest die gut strukturierten Teile des Regelwerks (Tabellen und feste Listenformate) per Textverarbeitung aus.

export interface ParsedSkill {
	name: string;
	fraction: 'half' | 'fifth';
	attributes: string[];
	specialization: boolean;
}

export interface MarkdownTable {
	header: string[];
	rows: string[][];
}

export interface ParsedStatus {
	name: string;
	/** Beträge in Kronen. */
	purse: number;
	daily: number;
	factor?: number;
}

export interface ParsedCharacteristic {
	range: [number, number];
	name: string;
	text: string;
}

export interface ParsedStunt {
	name: string;
	tier: number;
	prerequisites: string[];
	text: string;
}

const lines = (md: string) => md.replace(/\r/g, '').split('\n');
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

/** `### Name (½ GES) [Spezialisierung notwendig]` aus den Fertigkeitslisten. */
export function parseSkillList(md: string): ParsedSkill[] {
	const out: ParsedSkill[] = [];
	for (const line of lines(md)) {
		const m = line.match(/^### (.+?) \(([½⅕]) ([A-Z/]+)\):?\s*(\[Spezialisierung notwendig\])?\s*$/);
		if (!m) continue;
		out.push({
			name: m[1].trim(),
			fraction: m[2] === '½' ? 'half' : 'fifth',
			attributes: m[3].split('/'),
			specialization: !!m[4]
		});
	}
	return out;
}

/** Alle Markdown-Tabellen: Kopfzeile und Zeilen, Zellen getrimmt. */
export function parseMarkdownTables(md: string): MarkdownTable[] {
	const all = lines(md);
	const tables: MarkdownTable[] = [];
	const cells = (line: string) =>
		line
			.trim()
			.replace(/^\||\|$/g, '')
			.split('|')
			.map((c) => c.trim());
	for (let i = 0; i < all.length; i++) {
		if (!all[i].trim().startsWith('|') || !/^\s*\|[\s|:-]+\|\s*$/.test(all[i + 1] ?? '')) continue;
		const header = cells(all[i]);
		const rows: string[][] = [];
		i += 2;
		while (i < all.length && all[i].trim().startsWith('|')) {
			const row = cells(all[i]);
			if (row[0] && row[0] !== '-') rows.push(row);
			i++;
		}
		tables.push({ header, rows });
	}
	return tables;
}

/** Betrag wie „15 Pfennig“ oder „3 Kronen“ in Kronen; `undefined`, wenn kein Betrag erkennbar ist. */
export function toKronen(text: string): number | undefined {
	const m = text
		.replace(/\./g, '')
		.replace(',', '.')
		.match(/([\d.]+)\s*(Gulden|Kronen|Krone|Pfennig)/i);
	if (!m) return undefined;
	const factor = { gulden: 100, kronen: 1, krone: 1, pfennig: 0.01 }[m[2].toLowerCase() as 'gulden'];
	return Math.round(Number(m[1]) * factor * 100) / 100;
}

/** Die Statustabelle aus `Ausstattung.md`. */
export function parseStatusTable(md: string): ParsedStatus[] {
	const table = parseMarkdownTables(md).find((t) => t.header[0] === 'Status');
	if (!table) return [];
	return table.rows.map((row) => {
		const factor = row[2].match(/x\s*([\d.]+)/);
		return {
			name: row[0].replace(/\s*\(.*$/, '').trim(),
			purse: toKronen(row[1]) ?? 0,
			daily: toKronen(row[3]) ?? 0,
			factor: factor ? Number(factor[1].replace(/\./g, '')) : undefined
		};
	});
}

/** `**01-02:** _Name_ - Text` aus `Charakteristik.md`. */
export function parseCharacteristics(md: string): ParsedCharacteristic[] {
	const out: ParsedCharacteristic[] = [];
	for (const line of lines(md)) {
		const m = line.match(/^\*\*(\d+)-(\d+):?\*\*:?\s*_(.+?)_\s*-\s*(.+)$/);
		if (m) out.push({ range: [Number(m[1]), Number(m[2])], name: m[3].trim(), text: squash(m[4]) });
	}
	return out;
}

/** `**Name** (Voraussetzung 12, …): Text` je `## Stufe n` aus `Kunststücke.md`. */
export function parseStunts(md: string): ParsedStunt[] {
	const out: ParsedStunt[] = [];
	let tier = 0;
	for (const line of lines(md)) {
		const t = line.match(/^## Stufe (\d)/);
		if (t) tier = Number(t[1]);
		const m = line.match(/^\*\*(.+?)\*\*\s*\(/);
		if (!m || !tier) continue;
		// Voraussetzungen stehen in Klammern und können selbst Klammern enthalten.
		const start = m[0].length - 1;
		let depth = 0;
		let end = start;
		for (; end < line.length; end++) {
			if (line[end] === '(') depth++;
			if (line[end] === ')') depth--;
			if (depth === 0) break;
		}
		out.push({
			name: m[1].trim(),
			tier,
			prerequisites: line
				.slice(start + 1, end)
				.split(/,\s*(?![^()]*\))/)
				.map((p) => p.trim()),
			text: squash(line.slice(end + 1).replace(/^:/, ''))
		});
	}
	return out;
}
