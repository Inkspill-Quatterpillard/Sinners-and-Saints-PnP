import { describe, expect, it } from 'vitest';
import { compareCharacteristics, compareEquipment, compareSkills, compareStatus, compareStunts } from './compare.ts';
import { parseCharacteristics, parseMarkdownTables, parseSkillList, parseStatusTable, parseStunts } from './parse.ts';

const SKILLS_MD = `# Liste der Fertigkeiten

## Geschicklichkeit

### Akrobatik (½ GES)

Fertigkeit, artistische Manöver durchzuführen.

### Wissenschaften (⅕ KLU) [Spezialisierung notwendig]

Wissen.
`;

describe('Fertigkeiten', () => {
	it('liest Name, Bruchteil, Attribut und Spezialisierung', () => {
		expect(parseSkillList(SKILLS_MD)).toEqual([
			{ name: 'Akrobatik', fraction: 'half', attributes: ['GES'], specialization: false },
			{ name: 'Wissenschaften', fraction: 'fifth', attributes: ['KLU'], specialization: true }
		]);
	});

	it('meldet abweichende, fehlende und zusätzliche Einträge', () => {
		const data = [
			{ name: 'Akrobatik', fraction: 'fifth', attributes: ['GES'], specialization: false },
			{ name: 'Schwimmen', fraction: 'fifth', attributes: ['GES'], specialization: false }
		];
		const diffs = compareSkills('Fertigkeiten', parseSkillList(SKILLS_MD), data as never);
		expect(diffs).toEqual([
			{ area: 'Fertigkeiten', entry: 'Akrobatik', field: 'Bruchteil', rulebook: '½', data: '⅕' },
			{ area: 'Fertigkeiten', entry: 'Wissenschaften', field: 'fehlt in den Regeldaten', rulebook: 'vorhanden', data: '–' },
			{ area: 'Fertigkeiten', entry: 'Schwimmen', field: 'fehlt im Regelwerk', rulebook: '–', data: 'vorhanden' }
		]);
	});

	it('berücksichtigt andere Namen (Aliasse) der Regeldaten', () => {
		const md = '## Charisma\n\n### Überzeugung (⅕ CHA)\n\nText.\n';
		const data = [
			{ name: 'Überzeugen', aliases: ['Überzeugung'], fraction: 'fifth', attributes: ['CHA'], specialization: false }
		];
		expect(compareSkills('Fertigkeiten', parseSkillList(md), data as never)).toEqual([]);
	});
});

describe('Ausrüstung', () => {
	const MD = `# Liste

| Bögen  | Schaden | Preis | Besonderheit |
|----------|----------|----------|----------|
| Kurzbogen  | 1W6+3 | 50 Kronen   | >6 STR nötig  |
| Langbogen  | 2W6+4 | 230 Kronen   | - |
`;
	it('liest Markdown-Tabellen mit Kategorie aus der ersten Spalte', () => {
		const tables = parseMarkdownTables(MD);
		expect(tables).toHaveLength(1);
		expect(tables[0].header).toEqual(['Bögen', 'Schaden', 'Preis', 'Besonderheit']);
		expect(tables[0].rows[1]).toEqual(['Langbogen', '2W6+4', '230 Kronen', '-']);
	});

	it('meldet geänderte Preise und Werte', () => {
		const data = [
			{
				name: 'Kurzbogen',
				category: 'Bögen',
				setting: 'standard',
				priceText: '50 Kronen',
				stats: { Schaden: '1W6+3', Besonderheit: '>6 STR nötig' }
			},
			{ name: 'Langbogen', category: 'Bögen', setting: 'standard', priceText: '200 Kronen', stats: { Schaden: '2W6+4' } }
		];
		expect(compareEquipment('Ausrüstung', 'standard', parseMarkdownTables(MD), data as never)).toEqual([
			{ area: 'Ausrüstung', entry: 'Bögen: Langbogen', field: 'Preis', rulebook: '230 Kronen', data: '200 Kronen' }
		]);
	});
});

describe('Status-Tabelle', () => {
	const MD = `| Status | Geldbeutel | Besitztümer | Tagesgeld |
|----------|----------|----------|----------|
| Mittellos (Status 0) | 15 Pfennig | Keine |  5 Pfennig |
| Arm (Status 1-2) | 3 Kronen | Status x50 (10 - 90 Kronen) | 50 Pfennig |
`;
	it('liest Stufen und Beträge in Kronen', () => {
		expect(parseStatusTable(MD)).toEqual([
			{ name: 'Mittellos', purse: 0.15, daily: 0.05, factor: undefined },
			{ name: 'Arm', purse: 3, daily: 0.5, factor: 50 }
		]);
	});

	it('meldet abweichende Beträge', () => {
		const data = [
			{ name: 'Mittellos', purse: 0.15, daily: 0.05, possessions: { factor: 0 } },
			{ name: 'Arm', purse: 2, daily: 0.5, possessions: { factor: 50 } }
		];
		expect(compareStatus(parseStatusTable(MD), data as never)).toEqual([
			{ area: 'Status', entry: 'Arm', field: 'Geldbeutel (Kronen)', rulebook: '3', data: '2' }
		]);
	});
});

describe('Charakteristiken', () => {
	const MD = `**01-02:** _Kurzsichtigkeit_ - Der Charakter erhält eine Sehhilfe.

**03-04:** _Blutrausch_ -  Wenn der Charakter eine Wunde erleidet.
`;
	it('liest Bereich, Name und Text', () => {
		expect(parseCharacteristics(MD)).toEqual([
			{ range: [1, 2], name: 'Kurzsichtigkeit', text: 'Der Charakter erhält eine Sehhilfe.' },
			{ range: [3, 4], name: 'Blutrausch', text: 'Wenn der Charakter eine Wunde erleidet.' }
		]);
	});

	it('meldet geänderte Texte', () => {
		const data = [
			{ name: 'Kurzsichtigkeit', range: [1, 2], text: 'Der Charakter erhält eine Sehhilfe.' },
			{ name: 'Blutrausch', range: [3, 4], text: 'Alter Text.' }
		];
		expect(compareCharacteristics(parseCharacteristics(MD), data as never)).toEqual([
			{
				area: 'Charakteristiken',
				entry: 'Blutrausch',
				field: 'Text',
				rulebook: 'Wenn der Charakter eine Wunde erleidet.',
				data: 'Alter Text.'
			}
		]);
	});
});

describe('Kunststücke', () => {
	const MD = `## Stufe 1 (Exzeptionell)

**Abrollen** (Akrobatik 12, Klettern 8): Halber Fallschaden.

**Wasseratmung** (Schwimmen 22, Natur (Wasser) 14) Atmen unter Wasser.
`;
	it('liest Name, Stufe, Voraussetzungen und Text, auch mit Klammern in den Voraussetzungen', () => {
		expect(parseStunts(MD)).toEqual([
			{ name: 'Abrollen', tier: 1, prerequisites: ['Akrobatik 12', 'Klettern 8'], text: 'Halber Fallschaden.' },
			{ name: 'Wasseratmung', tier: 1, prerequisites: ['Schwimmen 22', 'Natur (Wasser) 14'], text: 'Atmen unter Wasser.' }
		]);
	});

	it('meldet geänderte Voraussetzungen; vorläufige Einträge nur als Warnung', () => {
		const data = [
			{
				name: 'Abrollen',
				tier: 1,
				prerequisites: [{ text: 'Akrobatik 10' }, { text: 'Klettern 8' }],
				text: 'Halber Fallschaden.'
			},
			{
				name: 'Wasseratmung',
				tier: 2,
				prerequisites: [{ text: 'Schwimmen 22' }, { text: 'Natur (Wasser) 14' }],
				text: 'Atmen unter Wasser.',
				provisional: { question: 'X' }
			}
		];
		expect(compareStunts(parseStunts(MD), data as never)).toEqual([
			{
				area: 'Kunststücke',
				entry: 'Abrollen',
				field: 'Voraussetzungen',
				rulebook: 'Akrobatik 12, Klettern 8',
				data: 'Akrobatik 10, Klettern 8'
			},
			{ area: 'Kunststücke', entry: 'Wasseratmung', field: 'Stufe', rulebook: '1', data: '2', provisional: true }
		]);
	});
});
