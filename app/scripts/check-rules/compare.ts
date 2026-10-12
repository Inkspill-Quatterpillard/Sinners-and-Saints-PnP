// Vergleicht die aus dem Regelwerk gelesenen Einträge mit den Regeldaten der App.
import type { MarkdownTable, ParsedCharacteristic, ParsedSkill, ParsedStatus, ParsedStunt } from './parse.ts';

export interface Diff {
	area: string;
	entry: string;
	field: string;
	rulebook: string;
	data: string;
	/** Der Eintrag der Regeldaten ist als vorläufig markiert: nur eine Warnung. */
	provisional?: true;
}

interface Named {
	name: string;
	aliases?: string[];
	provisional?: unknown;
}

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();
const FRACTION = { half: '½', fifth: '⅕' } as const;

function diff(area: string, entry: string, field: string, rulebook: unknown, data: unknown, provisional?: unknown): Diff {
	const d: Diff = { area, entry, field, rulebook: String(rulebook), data: String(data) };
	if (provisional) d.provisional = true;
	return d;
}

/** Ordnet Einträge über Name oder Alias zu und meldet fehlende auf beiden Seiten. */
function match<R extends { name: string }, D extends Named>(
	area: string,
	rulebook: R[],
	data: D[],
	label: (r: R) => string,
	compare: (r: R, d: D) => Diff[]
): Diff[] {
	const out: Diff[] = [];
	const used = new Set<D>();
	for (const r of rulebook) {
		const d = data.find((x) => !used.has(x) && (x.name === r.name || x.aliases?.includes(r.name)));
		if (!d) {
			out.push(diff(area, label(r), 'fehlt in den Regeldaten', 'vorhanden', '–'));
			continue;
		}
		used.add(d);
		out.push(...compare(r, d));
	}
	for (const d of data) {
		if (!used.has(d)) out.push(diff(area, d.name, 'fehlt im Regelwerk', '–', 'vorhanden', d.provisional));
	}
	return out;
}

export interface SkillData extends Named {
	fraction: 'half' | 'fifth';
	attributes: string[];
	specialization: boolean;
}

export function compareSkills(area: string, rulebook: ParsedSkill[], data: SkillData[]): Diff[] {
	return match(
		area,
		rulebook,
		data,
		(r) => r.name,
		(r, d) => {
			const out: Diff[] = [];
			if (r.fraction !== d.fraction)
				out.push(diff(area, r.name, 'Bruchteil', FRACTION[r.fraction], FRACTION[d.fraction], d.provisional));
			if (r.attributes.join('/') !== d.attributes.join('/'))
				out.push(diff(area, r.name, 'Attribut', r.attributes.join('/'), d.attributes.join('/'), d.provisional));
			if (r.specialization !== d.specialization)
				out.push(
					diff(
						area,
						r.name,
						'Spezialisierung notwendig',
						r.specialization ? 'ja' : 'nein',
						d.specialization ? 'ja' : 'nein',
						d.provisional
					)
				);
			return out;
		}
	);
}

export interface EquipmentData extends Named {
	category: string;
	setting: string;
	priceText: string;
	stats: Record<string, string>;
}

export function compareEquipment(area: string, setting: string, tables: MarkdownTable[], data: EquipmentData[]): Diff[] {
	const rows = tables.flatMap((t) =>
		t.rows.map((row) => ({
			name: `${t.header[0]}: ${row[0]}`,
			category: t.header[0],
			item: row[0],
			price: t.header.includes('Preis') ? row[t.header.indexOf('Preis')] : '',
			stats: Object.fromEntries(
				t.header
					.map((h, i) => [h, row[i] ?? ''] as const)
					.slice(1)
					.filter(([h, v]) => h && h !== 'Preis' && v && v !== '-')
			)
		}))
	);
	const mine = data.filter((d) => d.setting === setting).map((d) => ({ ...d, name: `${d.category}: ${d.name}` }));
	return match(
		area,
		rows,
		mine,
		(r) => r.name,
		(r, d) => {
			const out: Diff[] = [];
			const price = r.price === '-' ? '' : r.price;
			if (squash(price) !== squash(d.priceText))
				out.push(diff(area, r.name, 'Preis', price || '–', d.priceText || '–', d.provisional));
			for (const key of new Set([...Object.keys(r.stats), ...Object.keys(d.stats)])) {
				const a = squash(r.stats[key] ?? '');
				const b = squash(d.stats[key] ?? '');
				if (a !== b) out.push(diff(area, r.name, key, a || '–', b || '–', d.provisional));
			}
			return out;
		}
	);
}

export interface StatusData extends Named {
	purse: number;
	daily: number;
	possessions: { factor?: number; fixed?: number };
}

export function compareStatus(rulebook: ParsedStatus[], data: StatusData[]): Diff[] {
	const area = 'Status';
	return match(
		area,
		rulebook,
		data,
		(r) => r.name,
		(r, d) => {
			const out: Diff[] = [];
			if (r.purse !== d.purse) out.push(diff(area, r.name, 'Geldbeutel (Kronen)', r.purse, d.purse));
			if (r.daily !== d.daily) out.push(diff(area, r.name, 'Tagesgeld (Kronen)', r.daily, d.daily));
			if (r.factor !== undefined && r.factor !== d.possessions.factor)
				out.push(diff(area, r.name, 'Besitztümer (Faktor)', r.factor, d.possessions.factor ?? '–'));
			return out;
		}
	);
}

export interface CharacteristicData extends Named {
	range: [number, number];
	text: string;
}

export function compareCharacteristics(rulebook: ParsedCharacteristic[], data: CharacteristicData[]): Diff[] {
	const area = 'Charakteristiken';
	return match(
		area,
		rulebook,
		data,
		(r) => r.name,
		(r, d) => {
			const out: Diff[] = [];
			if (r.range.join('-') !== d.range.join('-'))
				out.push(diff(area, r.name, 'W100-Bereich', r.range.join('–'), d.range.join('–'), d.provisional));
			if (squash(r.text) !== squash(d.text)) out.push(diff(area, r.name, 'Text', r.text, d.text, d.provisional));
			return out;
		}
	);
}

export interface StuntData extends Named {
	tier: number;
	prerequisites: { text: string }[];
	text: string;
}

export function compareStunts(rulebook: ParsedStunt[], data: StuntData[]): Diff[] {
	const area = 'Kunststücke';
	return match(
		area,
		rulebook,
		data,
		(r) => r.name,
		(r, d) => {
			const out: Diff[] = [];
			if (r.tier !== d.tier) out.push(diff(area, r.name, 'Stufe', r.tier, d.tier, d.provisional));
			const a = r.prerequisites.join(', ');
			const b = d.prerequisites.map((p) => p.text).join(', ');
			if (a !== b) out.push(diff(area, r.name, 'Voraussetzungen', a, b, d.provisional));
			if (squash(r.text) !== squash(d.text)) out.push(diff(area, r.name, 'Text', r.text, d.text, d.provisional));
			return out;
		}
	);
}
