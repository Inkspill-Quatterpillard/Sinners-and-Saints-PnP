import { describe, expect, it } from 'vitest';
import { ruleData } from '$lib/ruleData';
import { buildLookup, searchLookup } from './lookup';

const entries = buildLookup(ruleData);

describe('Nachschlagen', () => {
	it('enthält Zauber, Kunststücke, Techniken, Stile, Charakteristiken, Herkünfte, Eigenschaften, Religionen und Ausrüstung', () => {
		const areas = new Set(entries.map((e) => e.area));
		for (const a of [
			'spell',
			'stunt',
			'technique',
			'style',
			'characteristic',
			'origin',
			'trait',
			'religion',
			'equipment',
			'condition'
		]) {
			expect(areas.has(a as never)).toBe(true);
		}
		expect(new Set(entries.map((e) => e.key)).size).toBe(entries.length);
	});

	it('findet Einträge über Wörter im Text, Treffer im Namen zuerst', () => {
		const result = searchLookup(entries, 'aura');
		expect(result.length).toBeGreaterThan(2);
		expect(result[0].name.toLowerCase()).toContain('aura');
	});

	it('filtert nach Bereich und Setting', () => {
		const fallout = searchLookup(entries, 'Langbogen', { area: 'equipment', setting: 'fallout' });
		expect(fallout.map((e) => e.setting)).toEqual(['fallout']);
		expect(searchLookup(entries, 'Langbogen', { area: 'equipment', setting: 'standard' }).map((e) => e.setting)).toEqual([
			'standard'
		]);
	});

	it('mehrere Wörter müssen alle vorkommen', () => {
		expect(searchLookup(entries, 'Panik Kampf').every((e) => `${e.name} ${e.text}`.toLowerCase().includes('panik'))).toBe(true);
	});
});
