import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);
const view = (c: Character) => computeView(c, ruleData);
const status = (c: Character) => view(c).steps.find((s) => s.id === 'characteristic')?.status;
const skill = (c: Character, key: string) => view(c).skills.find((s) => s.key === key);
const w100 = (n: number, source: 'app' | 'manual' = 'app') => ({ dice: [n], source });

// STR 16, KON 14, GES 12, WAH 12, KLU 10, INT 10, CHA 10, WIL 8
const ATTRS = arrayAttributes();

describe('Charakteristik', () => {
	it('die Tabelle hat 50 Einträge und deckt 1–100 ab', () => {
		expect(ruleData.characteristics.entries).toHaveLength(50);
	});

	it('ohne Entscheidung ist der Schritt offen; „keine Charakteristik“ ist eine gültige Entscheidung', () => {
		expect(status(play(...ATTRS))).toBe('open');
		expect(status(play(...ATTRS, { type: 'setCharacteristicMode', mode: 'none' }))).toBe('valid');
	});

	it('ist die optionale Regel aus, entfällt der Schritt und gewählte Charakteristiken wirken nicht, gehen aber nicht verloren', () => {
		const c = play(
			...ATTRS,
			{ type: 'setCharacteristicMode', mode: 'free' },
			{ type: 'pickCharacteristic', slot: 0, characteristic: 'riesenblut' }
		);
		expect(view(c).attributes.STR.effective).toBe(18);
		const off = applyAction(c, { type: 'setOptionalRule', rule: 'charakteristik', enabled: false }, ruleData);
		expect(view(off).steps.some((s) => s.id === 'characteristic')).toBe(false);
		expect(view(off).attributes.STR.effective).toBe(16);
		const on = applyAction(off, { type: 'setOptionalRule', rule: 'charakteristik', enabled: true }, ruleData);
		expect(view(on).attributes.STR.effective).toBe(18);
	});

	describe('frei wählen', () => {
		it('eine Charakteristik frei wählen; ihre Effekte wirken automatisch', () => {
			const c = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'free' },
				{ type: 'pickCharacteristic', slot: 0, characteristic: 'weltenbummler' }
			);
			const v = view(c);
			expect(v.characteristicStep.slots[0]).toMatchObject({ id: 'weltenbummler', name: 'Weltenbummler' });
			expect(v.socialStatus.value).toBe(2);
			expect(status(c)).toBe('valid');
		});

		it('Fertigkeitsboni ohne Spezialisierung gelten für jede Spezialisierung', () => {
			const c = play(
				...ATTRS,
				{ type: 'addSpecialization', skill: 'fremdsprachen', specialization: 'Latin' },
				{ type: 'setCharacteristicMode', mode: 'free' },
				{ type: 'pickCharacteristic', slot: 0, characteristic: 'weltenbummler' }
			);
			// ⅕ INT 10 = 2 + 2
			expect(skill(c, 'fremdsprachen')?.value).toBe(4);
			expect(skill(c, 'fremdsprachen:Latin')?.value).toBe(4);
		});

		it('Boni auf eine bestimmte Spezialisierung legen diese an', () => {
			const c = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'free' },
				{ type: 'pickCharacteristic', slot: 0, characteristic: 'gourmet' }
			);
			expect(skill(c, 'handwerkUndKuenste:Kochen')?.value).toBe(3);
			expect(skill(c, 'natur:Wald')?.value).toBe(3);
		});

		it('Bewegung und Ausweichen ändern sich über die Sekundärattribute', () => {
			const c = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'free' },
				{ type: 'pickCharacteristic', slot: 0, characteristic: 'sprinter' }
			);
			// KON 14 − 1 = 13, GES 12: 25 → 8, +3 = 11
			expect(view(c).secondary.movement.value).toBe(11);
		});
	});

	describe('würfeln', () => {
		it('bis zu zwei Charakteristiken per W100', () => {
			const c = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'roll' },
				{ type: 'rollCharacteristic', slot: 0, roll: w100(21) },
				{ type: 'rollCharacteristic', slot: 1, roll: w100(100) }
			);
			const v = view(c);
			expect(v.characteristicStep.slots.map((s) => s.id)).toEqual(['riesenblut', 'albino']);
			expect(v.attributes.STR.effective).toBe(18);
			expect(status(c)).toBe('valid');
		});

		it('ein einzelner Wurf genügt ebenfalls', () => {
			const c = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'roll' },
				{ type: 'rollCharacteristic', slot: 0, roll: w100(5) }
			);
			expect(status(c)).toBe('valid');
		});

		it('ein doppeltes Ergebnis muss neu gewürfelt werden', () => {
			const c = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'roll' },
				{ type: 'rollCharacteristic', slot: 0, roll: w100(21) },
				{ type: 'rollCharacteristic', slot: 1, roll: w100(22) }
			);
			expect(status(c)).toBe('open');
			expect(view(c).characteristicStep.slots[1].duplicate).toBe(true);
			// Der Doppelte wirkt nur einmal
			expect(view(c).attributes.STR.effective).toBe(18);
			const fixed = applyAction(c, { type: 'rollCharacteristic', slot: 1, roll: w100(60) }, ruleData);
			expect(status(fixed)).toBe('valid');
		});

		it('eine der beiden darf einmal neu gewürfelt werden', () => {
			const c = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'roll' },
				{ type: 'rollCharacteristic', slot: 0, roll: w100(1) },
				{ type: 'rollCharacteristic', slot: 1, roll: w100(50) },
				{ type: 'rerollCharacteristic', slot: 0, roll: w100(95) }
			);
			const v = view(c);
			expect(v.characteristicStep.slots[0]).toMatchObject({ id: 'paranoia', rerolled: true });
			expect(v.characteristicStep.rerollAvailable).toBe(false);
			// Ein zweites Neuwürfeln wird ignoriert
			const again = applyAction(c, { type: 'rerollCharacteristic', slot: 1, roll: w100(70) }, ruleData);
			expect(view(again).characteristicStep.slots[1].id).toBe('sprinter');
		});
	});

	describe('Eintragen im Würfelmodus', () => {
		it('ein am Tisch gewürfeltes Ergebnis lässt sich je Platz direkt auswählen', () => {
			const c = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'roll' },
				{ type: 'pickCharacteristic', slot: 0, characteristic: 'haarig' },
				{ type: 'rollCharacteristic', slot: 1, roll: w100(50) }
			);
			const v = view(c);
			expect(v.characteristicStep.slots[0]).toMatchObject({ kind: 'roll', id: 'haarig', picked: true });
			expect(v.characteristicStep.slots[1]).toMatchObject({ id: 'sprinter' });
			expect(status(c)).toBe('valid');
			// Haarig +1 KON, Sprinter −1 KON: beide wirken.
			expect(v.attributes.KON.effective).toBe(14);
			expect(skill(c, 'charme')?.value).toBe(skill(play(...ATTRS), 'charme')!.value! - 2);
		});

		it('Würfeln ersetzt eine Auswahl, Auswählen ersetzt einen Wurf', () => {
			const picked = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'roll' },
				{ type: 'pickCharacteristic', slot: 0, characteristic: 'haarig' },
				{ type: 'rollCharacteristic', slot: 0, roll: w100(50) }
			);
			expect(view(picked).characteristicStep.slots[0]).toMatchObject({ id: 'sprinter', picked: false });
			const rolled = applyAction(picked, { type: 'pickCharacteristic', slot: 0, characteristic: 'paranoia' }, ruleData);
			expect(view(rolled).characteristicStep.slots[0]).toMatchObject({ id: 'paranoia', picked: true });
			expect(view(rolled).characteristicStep.slots[0].roll).toBeUndefined();
		});

		it('dieselbe Charakteristik zweimal ausgewählt ist ungültig', () => {
			const c = play(
				...ATTRS,
				{ type: 'setCharacteristicMode', mode: 'roll' },
				{ type: 'pickCharacteristic', slot: 0, characteristic: 'haarig' },
				{ type: 'pickCharacteristic', slot: 1, characteristic: 'haarig' }
			);
			expect(status(c)).toBe('invalid');
		});
	});

	describe('Spezies-Eigenschaften', () => {
		it('Eherner Wille: ein zusätzlicher Wurf', () => {
			const c = play(
				...ATTRS,
				{ type: 'chooseSpecies', species: 'zwerg' },
				{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'leben' },
				{ type: 'setCharacteristicMode', mode: 'roll' }
			);
			expect(view(c).characteristicStep.maxSlots).toBe(3);
			expect(view(c).characteristicStep.slots[2]).toMatchObject({ extra: true });
		});

		it('frei gewählt plus zusätzliche gewürfelte Charakteristik', () => {
			const c = play(
				...ATTRS,
				{ type: 'chooseSpecies', species: 'elf' },
				{ type: 'chooseTraitOption', trait: 'blutDerAltenWelt', option: 'charakteristik' },
				{ type: 'setCharacteristicMode', mode: 'free' }
			);
			expect(view(c).characteristicStep.maxSlots).toBe(2);
			expect(view(c).characteristicStep.slots[1]).toMatchObject({ extra: true, kind: 'roll' });
		});

		it('Eherner Wille ohne zusätzliche Charakteristik: die normalen Charakteristiken bleiben erlaubt', () => {
			const dwarf = (mode: 'free' | 'roll') =>
				play(
					...ATTRS,
					{ type: 'chooseSpecies', species: 'zwerg' },
					{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'keineCharakteristik' },
					{ type: 'setCharacteristicMode', mode }
				);
			const c = applyAction(dwarf('free'), { type: 'pickCharacteristic', slot: 0, characteristic: 'haarig' }, ruleData);
			expect(status(c)).toBe('valid');
			// Zwerg +2 KON, Haarig +1 KON
			expect(view(c).attributes.KON.effective).toBe(17);
			expect(view(dwarf('roll')).characteristicStep.maxSlots).toBe(2);
		});
	});

	it('Schutzgeist ist eine Ressource für den lebenden Bogen', () => {
		const c = play(
			...ATTRS,
			{ type: 'setCharacteristicMode', mode: 'free' },
			{ type: 'pickCharacteristic', slot: 0, characteristic: 'schutzgeist' }
		);
		expect(view(c).resources.map((r) => r.id)).toContain('schutzgeist');
	});
});
