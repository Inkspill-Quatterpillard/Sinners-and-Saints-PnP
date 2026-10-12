import { describe, expect, it } from 'vitest';
import {
	applyAction,
	computeView,
	createCharacter,
	duplicateCharacter,
	exportCharacter,
	FORMAT_VERSION,
	parseCharacterFile,
	type Character
} from './index';
import { ruleData, type RuleData } from '$lib/ruleData';
import { arrayAttributes } from './testing/fixtures';

const EIGHT = ['akrobatik', 'klettern', 'schleichen', 'navigieren', 'sondieren', 'beschwatzen', 'ersteHilfe', 'reiten'];
const sample = (): Character =>
	[
		...arrayAttributes(),
		{ type: 'setName', name: 'Agnes' } as const,
		...EIGHT.map((skill) => ({ type: 'toggleProfessionSkill', skill }) as const)
	].reduce((c, a) => applyAction(c, a, ruleData), createCharacter('c1', ruleData.version));

describe('Charakterdatei', () => {
	it('Export und Import ergeben denselben Charakter', () => {
		const c = sample();
		const result = parseCharacterFile(exportCharacter(c));
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.character).toEqual(c);
	});

	it('der Export ist lesbares JSON mit Formatversion', () => {
		const json = JSON.parse(exportCharacter(sample()));
		expect(json.formatVersion).toBe(FORMAT_VERSION);
		expect(json.basis.name).toBe('Agnes');
	});

	it('kein JSON oder kein Charakter: verständlicher Fehler', () => {
		expect(parseCharacterFile('kein json')).toMatchObject({ ok: false });
		expect(parseCharacterFile('{"foo": 1}')).toMatchObject({ ok: false });
		expect(parseCharacterFile('[]')).toMatchObject({ ok: false });
	});

	it('eine neuere Formatversion wird abgelehnt', () => {
		const json = JSON.parse(exportCharacter(sample()));
		json.formatVersion = FORMAT_VERSION + 1;
		const result = parseCharacterFile(JSON.stringify(json));
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toContain('neuer');
	});

	it('von Hand bearbeitete Dateien werden ohne Regelprüfung geladen', () => {
		const json = JSON.parse(exportCharacter(sample()));
		json.basis.interests.points = { medizin: 999 };
		const result = parseCharacterFile(JSON.stringify(json));
		expect(result.ok).toBe(true);
		if (result.ok)
			expect(computeView(result.character, ruleData).steps.find((s) => s.id === 'interests')?.status).toBe('invalid');
	});

	it('fehlende Felder werden mit Standardwerten ergänzt', () => {
		const json = JSON.parse(exportCharacter(sample()));
		delete json.basis.background;
		delete json.basis.equipment;
		delete json.play.conditions;
		const result = parseCharacterFile(JSON.stringify(json));
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.character.basis.background).toEqual({ fields: {}, people: [], languages: [] });
			expect(result.character.basis.equipment.items).toEqual([]);
			expect(result.character.play.conditions).toEqual([]);
			expect(() => computeView(result.character, ruleData)).not.toThrow();
		}
	});

	describe('Migration', () => {
		it('Dateien ohne Formatversion (Vorabversion 0) werden auf die aktuelle Version gebracht', () => {
			const old = { id: 'alt', ruleDataVersion: 0, status: 'inCreation', basis: { name: 'Alt' }, play: {} };
			const result = parseCharacterFile(JSON.stringify(old));
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.character.formatVersion).toBe(FORMAT_VERSION);
				expect(result.character.basis.name).toBe('Alt');
				expect(() => computeView(result.character, ruleData)).not.toThrow();
			}
		});
	});
});

describe('Verwaltung', () => {
	it('Duplizieren erzeugt einen unabhängigen Charakter mit neuer ID', () => {
		const c = sample();
		const copy = duplicateCharacter(c, 'c2');
		expect(copy.id).toBe('c2');
		expect(copy.basis.name).toBe('Agnes (Kopie)');
		copy.basis.attributes.assignment.STR = 7;
		expect(c.basis.attributes.assignment.STR).toBe(0);
	});
});

describe('Neue Regeldaten', () => {
	it('macht eine neue Regeldaten-Version einen Charakter ungültig, gibt es einen Hinweis', () => {
		const c = sample();
		// Neue Regeldaten erlauben nur noch sieben Professionsfertigkeiten; gewählt sind acht.
		const stricter: RuleData = {
			...ruleData,
			version: ruleData.version + 1,
			profession: { ...ruleData.profession, professionSkillCount: 7 }
		};
		expect(computeView(c, ruleData).ruleDataChanged).toBe(false);
		expect(computeView(c, stricter).ruleDataChanged).toBe(true);
	});

	it('ohne Auswirkung auf die Gültigkeit gibt es keinen Hinweis', () => {
		const c = sample();
		const newer: RuleData = { ...ruleData, version: ruleData.version + 1 };
		expect(computeView(c, newer).ruleDataChanged).toBe(false);
	});
});
