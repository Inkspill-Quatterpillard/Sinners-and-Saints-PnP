import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);

// STR 16, KON 14, GES 12, WAH 12, KLU 10, INT 10, CHA 10, WIL 8 (festes Array in Standardreihenfolge)
const ATTRS = arrayAttributes();

const skill = (c: Character, key: string) => computeView(c, ruleData).skills.find((s) => s.key === key);

describe('Fertigkeiten', () => {
	it('alle Fertigkeiten und Heldenfertigkeiten des Regelwerks sind vorhanden', () => {
		const view = computeView(play(...ATTRS), ruleData);
		expect(view.skills.filter((s) => s.category === 'general').length).toBe(35);
		expect(view.skills.filter((s) => s.category === 'combat').length).toBe(9);
		expect(view.skills.filter((s) => s.category === 'arcane').length).toBe(6);
	});

	it('der Startwert ist die Hälfte des Attributs, abgerundet', () => {
		// Akrobatik (½ GES): 12 / 2 = 6
		expect(skill(play(...ATTRS), 'akrobatik')?.start).toBe(6);
		// Schleichen (½ GES) mit GES 15 (Elf +1, aber Grundwert 14):
		const c = play(...arrayAttributes(['STR', 'GES', 'KON', 'WAH', 'KLU', 'INT', 'CHA', 'WIL']), { type: 'chooseSpecies', species: 'elf' });
		// GES 14 + 1 = 15 → 7
		expect(skill(c, 'schleichen')?.start).toBe(7);
	});

	it('der Startwert ist ein Fünftel des Attributs, abgerundet', () => {
		// Fahrzeug steuern (⅕ GES): 12 / 5 = 2
		expect(skill(play(...ATTRS), 'fahrzeugSteuern')?.start).toBe(2);
		// Kalkulation (⅕ KLU): 10 / 5 = 2
		expect(skill(play(...ATTRS), 'kalkulation')?.start).toBe(2);
	});

	it('bei zwei Attributen zählt das höhere', () => {
		// Faustkampf (½ STR/GES): STR 16 → 8
		expect(skill(play(...ATTRS), 'faustkampf')?.start).toBe(8);
		// Wurfwaffen (⅕ WAH/STR): STR 16 → 3
		expect(skill(play(...ATTRS), 'wurfwaffen')?.start).toBe(3);
	});

	it('jede Fertigkeit liefert Voll-, Halb- und Fünftelwert', () => {
		const s = skill(play(...ATTRS), 'faustkampf')!;
		expect([s.value, s.half, s.fifth]).toEqual([8, 4, 1]);
	});

	it('ohne Attributwert gibt es noch keinen Startwert', () => {
		expect(skill(play(), 'akrobatik')?.start).toBeUndefined();
	});

	it('Kampf- und Magiefertigkeiten sind als solche gekennzeichnet', () => {
		const view = computeView(play(...ATTRS), ruleData);
		expect(view.skills.find((s) => s.key === 'schwerter')?.category).toBe('combat');
		expect(view.skills.find((s) => s.key === 'mystik')?.category).toBe('arcane');
		expect(view.skills.find((s) => s.key === 'medizin')?.category).toBe('general');
	});

	describe('Spezialisierungen', () => {
		it('eine Fertigkeit mit Spezialisierung lässt sich mehrfach anlegen', () => {
			const c = play(
				...ATTRS,
				{ type: 'addSpecialization', skill: 'wissenschaften', specialization: 'Alchemie' },
				{ type: 'addSpecialization', skill: 'wissenschaften', specialization: 'Astronomie' }
			);
			const view = computeView(c, ruleData);
			const instances = view.skills.filter((s) => s.skillId === 'wissenschaften');
			expect(instances.map((s) => s.specialization)).toEqual([undefined, 'Alchemie', 'Astronomie']);
			// ⅕ KLU = 2 für jede Spezialisierung
			expect(instances.every((s) => s.start === 2)).toBe(true);
			expect(instances[1].name).toBe('Wissenschaften: Alchemie');
		});

		it('doppelte Spezialisierungen werden nicht angelegt', () => {
			const c = play(
				{ type: 'addSpecialization', skill: 'fremdsprachen', specialization: 'Latin' },
				{ type: 'addSpecialization', skill: 'fremdsprachen', specialization: 'Latin' }
			);
			expect(computeView(c, ruleData).skills.filter((s) => s.skillId === 'fremdsprachen')).toHaveLength(2);
		});

		it('eine Spezialisierung lässt sich wieder entfernen', () => {
			const c = play(
				{ type: 'addSpecialization', skill: 'natur', specialization: 'Kräuter' },
				{ type: 'removeSpecialization', skill: 'natur', specialization: 'Kräuter' }
			);
			expect(computeView(c, ruleData).skills.filter((s) => s.skillId === 'natur')).toHaveLength(1);
		});

		it('nur Fertigkeiten mit „Spezialisierung notwendig“ lassen sich spezialisieren', () => {
			const c = play({ type: 'addSpecialization', skill: 'akrobatik', specialization: 'Seiltanz' });
			expect(computeView(c, ruleData).skills.filter((s) => s.skillId === 'akrobatik')).toHaveLength(1);
		});
	});
});
