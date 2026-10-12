import { describe, expect, it } from 'vitest';
import { applyAction, computeView, createCharacter, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';

function play(...actions: Action[]): Character {
	return actions.reduce((c, a) => applyAction(c, a, ruleData), createCharacter('c1', ruleData.version));
}

// STR 16, KON 14, GES 12, WAH 12, KLU 10, INT 10, CHA 10, WIL 8
const ATTRIBUTES: Action[] = [
	{ type: 'setAttributeMethod', method: 'array' },
	...(['STR', 'KON', 'GES', 'WAH', 'KLU', 'INT', 'CHA', 'WIL'] as const).map((attribute, slot): Action => ({
		type: 'assignAttribute',
		attribute,
		slot
	}))
];

const stepStatus = (c: Character) => computeView(c, ruleData).steps.find((s) => s.id === 'species')?.status;

describe('Spezies', () => {
	it('ohne gewählte Spezies ist der Schritt offen', () => {
		expect(stepStatus(play(...ATTRIBUTES))).toBe('open');
	});

	it('ein Mensch erhält +1 CHA, −1 WAH und −1 WIL', () => {
		const view = computeView(play(...ATTRIBUTES, { type: 'chooseSpecies', species: 'mensch' }), ruleData);
		expect(view.attributes.CHA.effective).toBe(11);
		expect(view.attributes.WAH.effective).toBe(11);
		expect(view.attributes.WIL.effective).toBe(7);
		expect(view.attributes.STR.effective).toBe(16);
		expect(view.attributes.CHA.modifiers).toEqual([{ source: 'Spezies: Mensch', value: 1 }]);
		expect(view.steps.find((s) => s.id === 'species')?.status).toBe('valid');
	});

	it('ein Zwerg erhält +2 KON, +1 STR, −1 GES und −2 WAH', () => {
		const view = computeView(
			play(
				...ATTRIBUTES,
				{ type: 'chooseSpecies', species: 'zwerg' },
				{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'leben' }
			),
			ruleData
		);
		expect([
			view.attributes.KON.effective,
			view.attributes.STR.effective,
			view.attributes.GES.effective,
			view.attributes.WAH.effective
		]).toEqual([16, 17, 11, 10]);
	});

	it('ein Elf erhält +2 WAH, +1 GES, −1 STR und −2 KON', () => {
		const view = computeView(
			play(
				...ATTRIBUTES,
				{ type: 'chooseSpecies', species: 'elf' },
				{ type: 'chooseTraitOption', trait: 'blutDerAltenWelt', option: 'charakteristik' }
			),
			ruleData
		);
		expect([
			view.attributes.WAH.effective,
			view.attributes.GES.effective,
			view.attributes.STR.effective,
			view.attributes.KON.effective
		]).toEqual([14, 13, 15, 12]);
	});

	it('die Eigenschaften der Spezies werden mit Text angezeigt', () => {
		const view = computeView(play({ type: 'chooseSpecies', species: 'mensch' }), ruleData);
		expect(view.speciesStep.traits.map((t) => t.name)).toEqual(['Stupor Mundi', 'Dominium terrae']);
		expect(view.speciesStep.traits[0].text).toContain('Reflexionsphase');
	});

	it('eine Eigenschaft mit Wahl muss entschieden werden, bevor der Schritt gültig ist', () => {
		expect(stepStatus(play(...ATTRIBUTES, { type: 'chooseSpecies', species: 'zwerg' }))).toBe('open');
	});

	describe('Eherner Wille', () => {
		it('mit zusätzlicher Charakteristik und +5 TP', () => {
			const view = computeView(
				play(
					...ATTRIBUTES,
					{ type: 'chooseSpecies', species: 'zwerg' },
					{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'leben' }
				),
				ruleData
			);
			expect(view.characteristicAllowance).toEqual({ extra: 1 });
			expect(view.secondaryModifiers.tp).toEqual([{ source: 'Eherner Wille', value: 5 }]);
		});

		it('mit zusätzlicher Charakteristik und +20 Stabilität', () => {
			const view = computeView(
				play(
					...ATTRIBUTES,
					{ type: 'chooseSpecies', species: 'zwerg' },
					{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'stabilitaet' }
				),
				ruleData
			);
			expect(view.characteristicAllowance).toEqual({ extra: 1 });
			expect(view.secondaryModifiers.stability).toEqual([{ source: 'Eherner Wille', value: 20 }]);
		});

		it('ohne zusätzliche Charakteristik und dafür +10 Stabilität', () => {
			const view = computeView(
				play(
					...ATTRIBUTES,
					{ type: 'chooseSpecies', species: 'zwerg' },
					{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'keineCharakteristik' }
				),
				ruleData
			);
			expect(view.characteristicAllowance).toEqual({ extra: 0 });
			expect(view.secondaryModifiers.stability).toEqual([{ source: 'Eherner Wille', value: 10 }]);
		});

		it('Varianten mit Charakteristik sind ungültig, wenn ohne Charakteristik gespielt wird', () => {
			const c = play(
				...ATTRIBUTES,
				{ type: 'chooseSpecies', species: 'zwerg' },
				{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'leben' },
				{ type: 'setOptionalRule', rule: 'charakteristik', enabled: false }
			);
			const view = computeView(c, ruleData);
			expect(view.steps.find((s) => s.id === 'species')?.status).toBe('invalid');
			expect(view.issues).toContainEqual(expect.objectContaining({ step: 'species', severity: 'invalid' }));
			expect(view.secondaryModifiers.tp).toEqual([]);
		});
	});

	describe('Blut der Alten Welt', () => {
		it('+2 auf das höchste Attribut (auch über 20) und −1 auf alle anderen', () => {
			const c = play(
				...ATTRIBUTES,
				{ type: 'chooseSpecies', species: 'elf' },
				{ type: 'chooseTraitOption', trait: 'blutDerAltenWelt', option: 'attribute' }
			);
			const view = computeView(c, ruleData);
			// STR ist mit 16 − 1 (Elf) = 15 nicht mehr das höchste; KON 14 − 2 = 12; WAH 12 + 2 = 14, GES 12 + 1 = 13.
			// Höchstes nach den Modifikatoren der Spezies: STR 15.
			expect(view.attributes.STR.effective).toBe(17);
			expect(view.attributes.WAH.effective).toBe(13);
			expect(view.attributes.WIL.effective).toBe(7);
			expect(view.characteristicAllowance.extra).toBe(0);
		});

		it('das höchste Attribut darf über 20 steigen', () => {
			const c = play(
				{ type: 'setAttributeMethod', method: 'roll' },
				{ type: 'rollAttributeSlot', slot: 0, roll: { dice: [6, 6, 6, 6], source: 'manual' } },
				...[1, 2, 3, 4, 5, 6, 7].map((slot): Action => ({
					type: 'rollAttributeSlot',
					slot,
					roll: { dice: [3, 3, 3, 3], source: 'manual' }
				})),
				...(['WAH', 'STR', 'KON', 'GES', 'KLU', 'INT', 'CHA', 'WIL'] as const).map((attribute, slot): Action => ({
					type: 'assignAttribute',
					attribute,
					slot
				})),
				{ type: 'chooseSpecies', species: 'elf' },
				{ type: 'chooseTraitOption', trait: 'blutDerAltenWelt', option: 'attribute' }
			);
			expect(computeView(c, ruleData).attributes.WAH.effective).toBe(22);
		});

		it('bei Gleichstand wählt der Spieler das Attribut', () => {
			// Mensch-unabhängig: Elf mit STR 15 und WAH 15 nach Spezies.
			const c = play(
				{ type: 'setAttributeMethod', method: 'array' },
				...(['STR', 'GES', 'WAH', 'KON', 'KLU', 'INT', 'CHA', 'WIL'] as const).map((attribute, slot): Action => ({
					type: 'assignAttribute',
					attribute,
					slot
				})),
				// STR 16 → 15, GES 14 → 15, WAH 12 → 14
				{ type: 'chooseSpecies', species: 'elf' },
				{ type: 'chooseTraitOption', trait: 'blutDerAltenWelt', option: 'attribute' }
			);
			const open = computeView(c, ruleData);
			expect(open.steps.find((s) => s.id === 'species')?.status).toBe('open');
			expect(open.speciesStep.traits.find((t) => t.id === 'blutDerAltenWelt')?.tiedAttributes).toEqual(['STR', 'GES']);

			const chosen = applyAction(c, { type: 'chooseTraitAttribute', trait: 'blutDerAltenWelt', attribute: 'GES' }, ruleData);
			const view = computeView(chosen, ruleData);
			expect(view.attributes.GES.effective).toBe(17);
			expect(view.attributes.STR.effective).toBe(14);
			expect(view.steps.find((s) => s.id === 'species')?.status).toBe('valid');
		});

		it('ist das gewählte Attribut nach einer Änderung nicht mehr das höchste, wird die Wahl ungültig', () => {
			const c = play(
				{ type: 'setAttributeMethod', method: 'array' },
				...(['STR', 'GES', 'WAH', 'KON', 'KLU', 'INT', 'CHA', 'WIL'] as const).map((attribute, slot): Action => ({
					type: 'assignAttribute',
					attribute,
					slot
				})),
				{ type: 'chooseSpecies', species: 'elf' },
				{ type: 'chooseTraitOption', trait: 'blutDerAltenWelt', option: 'attribute' },
				{ type: 'chooseTraitAttribute', trait: 'blutDerAltenWelt', attribute: 'GES' },
				// GES bekommt jetzt die 8, STR bleibt das höchste
				{ type: 'assignAttribute', attribute: 'GES', slot: 7 }
			);
			const view = computeView(c, ruleData);
			expect(view.steps.find((s) => s.id === 'species')?.status).toBe('invalid');
			expect(view.issues.some((i) => i.step === 'species' && i.severity === 'invalid')).toBe(true);
		});
	});

	it('beim Wechsel der Spezies bleiben die Wahlen der früheren Spezies erhalten', () => {
		const c = play(
			...ATTRIBUTES,
			{ type: 'chooseSpecies', species: 'zwerg' },
			{ type: 'chooseTraitOption', trait: 'ehernerWille', option: 'stabilitaet' },
			{ type: 'chooseSpecies', species: 'mensch' },
			{ type: 'chooseSpecies', species: 'zwerg' }
		);
		expect(stepStatus(c)).toBe('valid');
		expect(computeView(c, ruleData).secondaryModifiers.stability).toEqual([{ source: 'Eherner Wille', value: 20 }]);
	});
});
