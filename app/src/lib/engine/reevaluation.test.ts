import { describe, expect, it } from 'vitest';
import { applyAction, computeView } from './index';
import { arrayAttributes, playWith, testRuleData as rd } from './testing/fixtures';

const speciesStatus = (c: Parameters<typeof computeView>[0]) => computeView(c, rd).steps.find((s) => s.id === 'species')?.status;

describe('Neubewertung nach Änderungen', () => {
	it('eine ungültig gewordene Wahl wird markiert, aber nicht gelöscht, und gilt wieder, sobald sie zulässig ist', () => {
		const chosen = playWith(
			rd,
			...arrayAttributes(),
			{ type: 'chooseSpecies', species: 'testvolk' },
			{ type: 'chooseTraitOption', trait: 'testwahl', option: 'charakteristik' }
		);
		expect(speciesStatus(chosen)).toBe('valid');

		const off = applyAction(chosen, { type: 'setOptionalRule', rule: 'charakteristik', enabled: false }, rd);
		expect(speciesStatus(off)).toBe('invalid');
		expect(computeView(off, rd).speciesStep.traits[0].chosenOption).toBe('charakteristik');
		expect(computeView(off, rd).characteristicAllowance.extra).toBe(0);

		const on = applyAction(off, { type: 'setOptionalRule', rule: 'charakteristik', enabled: true }, rd);
		expect(speciesStatus(on)).toBe('valid');
		expect(computeView(on, rd).characteristicAllowance.extra).toBe(1);
	});

	it('Wahlen einer Spezies überdauern den Wechsel zu einer anderen und zurück', () => {
		const c = playWith(
			rd,
			...arrayAttributes(),
			{ type: 'chooseSpecies', species: 'testvolk' },
			{ type: 'chooseTraitOption', trait: 'testwahl', option: 'hoch' },
			{ type: 'chooseSpecies', species: 'anderes' }
		);
		expect(computeView(c, rd).attributes.STR.effective).toBe(16);
		const back = applyAction(c, { type: 'chooseSpecies', species: 'testvolk' }, rd);
		// 16 + 1 (Testvolk) + 1 (höchstes Attribut)
		expect(computeView(back, rd).attributes.STR.effective).toBe(18);
	});

	it('eine Änderung früherer Schritte bewertet eine attributabhängige Wahl neu', () => {
		const c = playWith(
			rd,
			...arrayAttributes(['KON', 'STR', 'GES', 'WAH', 'KLU', 'INT', 'CHA', 'WIL']),
			{ type: 'chooseSpecies', species: 'testvolk' },
			{ type: 'chooseTraitOption', trait: 'testwahl', option: 'hoch' }
		);
		// KON 16, STR 14 + 1 = 15: Gleichstand gibt es nicht, KON ist das höchste.
		expect(computeView(c, rd).attributes.KON.effective).toBe(17);

		const swapped = applyAction(c, { type: 'assignAttribute', attribute: 'STR', slot: 0 }, rd);
		// STR 16 + 1 = 17 ist jetzt das höchste, KON 14 bleibt.
		const view = computeView(swapped, rd);
		expect(view.attributes.STR.effective).toBe(18);
		expect(view.attributes.KON.effective).toBe(14);
	});
});
