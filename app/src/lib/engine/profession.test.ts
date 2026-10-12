import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);
const view = (c: Character) => computeView(c, ruleData);
const status = (c: Character) => view(c).steps.find((s) => s.id === 'profession')?.status;
const skill = (c: Character, key: string) => view(c).skills.find((s) => s.key === key)!;

// STR 16, KON 14, GES 12, WAH 12, KLU 10, INT 10, CHA 10, WIL 8
const ATTRS = arrayAttributes();
const EIGHT = ['akrobatik', 'klettern', 'schleichen', 'navigieren', 'sondieren', 'beschwatzen', 'ersteHilfe', 'natur'];
const professionSkills = (keys = EIGHT): Action[] => keys.map((skill) => ({ type: 'toggleProfessionSkill', skill }));
const heroes: Action[] = [
	{ type: 'assignHeroSkill', slot: 0, skill: 'schwerter' },
	{ type: 'assignHeroSkill', slot: 1, skill: 'boegen' },
	{ type: 'assignHeroSkill', slot: 2, skill: 'faustkampf' },
	{ type: 'assignHeroSkill', slot: 3, skill: 'dolcheUndMesser' },
	{ type: 'assignHeroSkill', slot: 4, skill: 'mystik' }
];
const COMPLETE: Action[] = [
	...ATTRS,
	{ type: 'setProfessionName', name: 'Söldnerin' },
	...professionSkills(),
	{ type: 'rollStatus', roll: { dice: [5], source: 'app' } },
	...heroes
];

describe('Profession', () => {
	it('eine vollständig gebaute Profession macht den Schritt gültig', () => {
		expect(status(play(...COMPLETE))).toBe('valid');
		expect(view(play(...COMPLETE)).professionStep.name).toBe('Söldnerin');
	});

	it('ohne Namen bleibt der Schritt offen', () => {
		expect(status(play(...COMPLETE, { type: 'setProfessionName', name: '  ' }))).toBe('open');
	});

	it('acht Professionsfertigkeiten erhalten je +5', () => {
		const c = play(...COMPLETE);
		// Akrobatik ½ GES 12 = 6 + 5
		expect(skill(c, 'akrobatik').value).toBe(11);
		expect(skill(c, 'akrobatik').bonuses).toEqual([{ source: 'Profession: Söldnerin', value: 5 }]);
		expect(skill(c, 'kalkulation').bonuses).toEqual([]);
	});

	it('mit weniger als acht Professionsfertigkeiten ist der Schritt offen, eine neunte lässt sich nicht wählen', () => {
		expect(status(play(...COMPLETE, { type: 'toggleProfessionSkill', skill: 'natur' }))).toBe('open');
		const nine = play(...COMPLETE, { type: 'toggleProfessionSkill', skill: 'medizin' });
		expect(view(nine).professionStep.skills).toHaveLength(8);
		expect(view(nine).professionStep.skills).not.toContain('medizin');
	});

	it('ein erneuter Klick entfernt eine Professionsfertigkeit', () => {
		const c = play(...COMPLETE, { type: 'toggleProfessionSkill', skill: 'akrobatik' });
		expect(view(c).professionStep.skills).not.toContain('akrobatik');
		expect(skill(c, 'akrobatik').value).toBe(6);
	});

	it('Heldenfertigkeiten sind keine Professionsfertigkeiten', () => {
		const c = play(...ATTRS, { type: 'toggleProfessionSkill', skill: 'schwerter' });
		expect(view(c).professionStep.skills).toEqual([]);
	});

	it('Spezialisierungen können Professionsfertigkeiten sein; fällt die Spezialisierung weg, wird die Wahl ungültig', () => {
		const c = play(
			...ATTRS,
			{ type: 'addSpecialization', skill: 'wissenschaften', specialization: 'Alchemie' },
			{ type: 'setProfessionName', name: 'Alchemist' },
			...professionSkills([...EIGHT.slice(0, 7), 'wissenschaften:Alchemie']),
			{ type: 'rollStatus', roll: { dice: [3], source: 'app' } },
			...heroes
		);
		expect(skill(c, 'wissenschaften:Alchemie').value).toBe(7);
		expect(status(c)).toBe('valid');
		const removed = applyAction(
			c,
			{ type: 'removeSpecialization', skill: 'wissenschaften', specialization: 'Alchemie' },
			ruleData
		);
		expect(status(removed)).toBe('invalid');
		expect(view(removed).issues.some((i) => i.step === 'profession' && i.severity === 'invalid')).toBe(true);
	});

	describe('Status', () => {
		it.each([
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 6],
			[5, 7],
			[6, 8]
		])('Status startet bei 5; W6 = %i ergibt %i', (die, value) => {
			const c = play(...COMPLETE, { type: 'rollStatus', roll: { dice: [die], source: 'manual' } });
			expect(view(c).socialStatus.value).toBe(value);
		});

		it('ohne Statuswurf bleibt der Schritt offen', () => {
			const c = play(...ATTRS, { type: 'setProfessionName', name: 'X' }, ...professionSkills(), ...heroes);
			expect(status(c)).toBe('open');
			expect(view(c).socialStatus.value).toBe(5);
		});
	});

	describe('Heldenfertigkeiten', () => {
		it('werden auf 14, 12, 10, 8 und 8 gesetzt, nicht addiert', () => {
			const c = play(...COMPLETE);
			expect(skill(c, 'schwerter').value).toBe(14);
			expect(skill(c, 'boegen').value).toBe(12);
			expect(skill(c, 'faustkampf').value).toBe(10);
			expect(skill(c, 'dolcheUndMesser').value).toBe(8);
			expect(skill(c, 'mystik').value).toBe(8);
			expect(skill(c, 'schwerter').setValue).toEqual({ source: 'Heldenfertigkeit', value: 14 });
		});

		it('solange nicht alle fünf vergeben sind, bleibt der Schritt offen', () => {
			expect(status(play(...COMPLETE.slice(0, -1)))).toBe('open');
		});

		it('eine Heldenfertigkeit kann nur einen Platz belegen', () => {
			const c = play(...COMPLETE, { type: 'assignHeroSkill', slot: 4, skill: 'schwerter' });
			// Schwerter wandert von Platz 0 auf Platz 4; Platz 0 wird frei.
			expect(view(c).professionStep.heroSlots.map((s) => s.skill)).toEqual([
				undefined,
				'boegen',
				'faustkampf',
				'dolcheUndMesser',
				'schwerter'
			]);
			expect(status(c)).toBe('open');
		});

		it('sinkt ein Wert durch das Setzen unter den Startwert, warnt die App', () => {
			// Faustkampf ½ STR = 8; mit STR 18 (Zwerg 17 + ...) wäre Startwert höher. Hier: STR 16 → Start 8, auf 8 gesetzt = keine Warnung.
			const strong = play(
				...arrayAttributes(['STR', 'KON', 'GES', 'WAH', 'KLU', 'INT', 'CHA', 'WIL']),
				{ type: 'chooseSpecies', species: 'zwerg' },
				{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'leben' },
				{ type: 'assignHeroSkill', slot: 3, skill: 'faustkampf' }
			);
			// STR 16 + 1 = 17 → Startwert ½ = 8, gesetzt auf 8: keine Warnung
			expect(view(strong).issues.filter((i) => i.step === 'profession' && i.severity === 'warning')).toEqual([]);
			const higher = play(
				{ type: 'setAttributeMethod', method: 'roll' },
				...[0, 1, 2, 3, 4, 5, 6, 7].map((slot): Action => ({
					type: 'rollAttributeSlot',
					slot,
					roll: { dice: slot === 0 ? [6, 6, 6, 1] : [4, 4, 4, 1], source: 'manual' }
				})),
				...(['STR', 'KON', 'GES', 'WAH', 'KLU', 'INT', 'CHA', 'WIL'] as const).map((attribute, slot): Action => ({
					type: 'assignAttribute',
					attribute,
					slot
				})),
				{ type: 'chooseSpecies', species: 'zwerg' },
				{ type: 'assignHeroSkill', slot: 3, skill: 'faustkampf' }
			);
			// STR 18 + 1 = 19 → Startwert 9, gesetzt auf 8
			const warnings = view(higher).issues.filter((i) => i.step === 'profession' && i.severity === 'warning');
			expect(warnings).toHaveLength(1);
			expect(warnings[0].message).toContain('Faustkampf');
			expect(skill(higher, 'faustkampf').value).toBe(8);
		});
	});
});
