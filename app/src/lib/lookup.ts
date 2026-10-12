import type { RuleData, SourceRef } from '$lib/ruleData';
import { t } from '$lib/texts';

export type LookupArea =
	| 'spell'
	| 'stunt'
	| 'technique'
	| 'style'
	| 'characteristic'
	| 'origin'
	| 'trait'
	| 'religion'
	| 'skill'
	| 'equipment'
	| 'condition';

/** Ein Eintrag zum Nachschlagen: Name, Text (Markdown) und kurze Angaben wie Stufe oder Werte. */
export interface LookupEntry {
	/** „Bereich:ID“, z. B. „spell:mystik:auraAnalysieren“. */
	key: string;
	area: LookupArea;
	name: string;
	/** Kurze Zusatzangaben, z. B. „Mystik · Stufe 1“ oder „Schaden: 1W6+3“. */
	meta: string;
	text: string;
	setting?: string;
	source?: SourceRef;
}

/** Baut den Index aller nachschlagbaren Texte aus den Regeldaten. */
export function buildLookup(rd: RuleData): LookupEntry[] {
	const skillName = (id: string) => [...rd.skills, ...rd.heroSkills].find((s) => s.id === id)?.name ?? id;
	const entries: LookupEntry[] = [];
	for (const s of rd.magic.spells) {
		entries.push({
			key: `spell:${s.id}`,
			area: 'spell',
			name: s.name,
			meta: [skillName(s.skill), s.tier === 0 ? t.lookup.basicSpell : t.lookup.tier(s.tier), s.kind].filter(Boolean).join(' · '),
			text: s.text,
			source: s.source
		});
	}
	for (const s of rd.stunts) {
		entries.push({
			key: `stunt:${s.id}`,
			area: 'stunt',
			name: s.name,
			meta: `${t.lookup.stuntTier(s.tier, s.tierName)} · ${s.prerequisites.map((p) => p.text).join(', ')}`,
			text: s.text,
			source: s.source
		});
	}
	for (const x of rd.combat.techniques) {
		entries.push({
			key: `technique:${x.id}`,
			area: 'technique',
			name: x.name,
			meta: [skillName(x.skill), t.lookup.romanTier(x.tier), x.kind, x.hands].filter(Boolean).join(' · '),
			text: [x.flavor ? `_${x.flavor}_` : '', x.text].filter(Boolean).join('\n\n'),
			source: x.source
		});
	}
	for (const s of rd.combat.styles) {
		entries.push({
			key: `style:${s.id}`,
			area: 'style',
			name: s.name,
			meta: s.kind === 'melee' ? t.lookup.melee : t.lookup.ranged,
			text: s.text,
			source: s.source
		});
	}
	for (const c of rd.characteristics.entries) {
		entries.push({
			key: `characteristic:${c.id}`,
			area: 'characteristic',
			name: c.name,
			meta: `W100: ${c.range[0]}–${c.range[1]}`,
			text: [c.text, c.note ? `_${c.note}_` : ''].filter(Boolean).join('\n\n'),
			source: c.source
		});
	}
	for (const o of rd.origins) {
		const options = o.options?.map((opt) => `- **${opt.name}**${opt.text ? `: ${opt.text}` : ''}`).join('\n') ?? '';
		entries.push({
			key: `origin:${o.id}`,
			area: 'origin',
			name: o.name,
			meta: t.lookup.origin(o.number),
			text: [o.description, ...o.abilities.map((a) => `**${a.name}:** ${a.text}`), options, o.note ? `_${o.note}_` : '']
				.filter(Boolean)
				.join('\n\n'),
			source: o.source
		});
	}
	for (const sp of rd.species) {
		for (const tr of sp.traits) {
			entries.push({ key: `trait:${tr.id}`, area: 'trait', name: tr.name, meta: sp.name, text: tr.text, source: sp.source });
		}
	}
	for (const r of rd.religions) {
		const options = r.options?.map((o) => `- ${o.name}`).join('\n') ?? '';
		entries.push({
			key: `religion:${r.id}`,
			area: 'religion',
			name: r.name,
			meta: r.blessing,
			text: [r.description, `**${r.blessing}:** ${r.text}`, options].filter(Boolean).join('\n\n'),
			source: r.source
		});
	}
	for (const s of [...rd.skills, ...rd.heroSkills]) {
		entries.push({
			key: `skill:${s.id}`,
			area: 'skill',
			name: s.name,
			meta: `${s.fraction === 'half' ? '½' : '⅕'} ${s.attributes.join('/')}${s.specialization ? ` · ${t.lookup.specializationNeeded}` : ''}`,
			text: s.description,
			source: s.source
		});
	}
	for (const e of rd.equipment) {
		entries.push({
			key: `equipment:${e.id}`,
			area: 'equipment',
			name: e.name,
			meta: [e.category, e.priceText].filter(Boolean).join(' · '),
			text: Object.entries(e.stats)
				.map(([k, v]) => `- **${k}:** ${v}`)
				.join('\n'),
			setting: e.setting,
			source: e.source
		});
	}
	for (const c of rd.conditions) {
		entries.push({ key: `condition:${c.id}`, area: 'condition', name: c.name, meta: '', text: c.text, source: c.source });
	}
	return entries;
}

/** Volltextsuche: alle Wörter der Anfrage müssen in Name, Angaben oder Text vorkommen. Treffer im Namen zuerst. */
export function searchLookup(
	entries: LookupEntry[],
	query: string,
	filter: { area?: LookupArea; setting?: string } = {}
): LookupEntry[] {
	const words = query.toLowerCase().split(/\s+/).filter(Boolean);
	return entries
		.filter((e) => (!filter.area || e.area === filter.area) && (!filter.setting || !e.setting || e.setting === filter.setting))
		.filter((e) => {
			const hay = `${e.name} ${e.meta} ${e.text}`.toLowerCase();
			return words.every((w) => hay.includes(w));
		})
		.sort((a, b) => {
			const inName = (e: LookupEntry) => (words.every((w) => e.name.toLowerCase().includes(w)) ? 0 : 1);
			return inName(a) - inName(b) || a.name.localeCompare(b.name, 'de');
		});
}
