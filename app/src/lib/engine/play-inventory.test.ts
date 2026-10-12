import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const view = (c: Character) => computeView(c, ruleData);
const act = (c: Character, ...actions: Action[]) => actions.reduce((x, a) => applyAction(x, a, ruleData), c);
const item = (name: string) => ruleData.equipment.find((i) => i.name === name && i.setting === 'standard')!;

// Status 5 (ohne Statuswurf): durchschnittlich, 10 Kronen
const base = () =>
	playWith(
		ruleData,
		...arrayAttributes(),
		{ type: 'addItem', catalogId: item('Gambeson').id },
		{ type: 'addItem', catalogId: item('Schlagring').id }
	);

describe('Geld im Spiel', () => {
	it('startet mit dem Restgeld der Erstellung', () => {
		// 10 Kronen − 10 Kronen (Gambeson) − 1 Krone (Schlagring) = −1 Krone
		expect(view(base()).live.money).toBe(-100);
	});

	it('Einnahmen und Ausgaben verändern das Geld', () => {
		const c = act(base(), { type: 'changeMoney', delta: 1250 }, { type: 'changeMoney', delta: -30 });
		expect(view(c).live.money).toBe(1120);
	});

	it('neue Gegenstände im Spiel ziehen kein Geld ab, das Geld bleibt, wie es ist', () => {
		const c = act(base(), { type: 'changeMoney', delta: 500 });
		const more = act(c, { type: 'addItem', catalogId: item('Stachelring').id });
		expect(view(more).live.money).toBe(400);
	});
});

describe('Inventar', () => {
	it('Gegenstände lassen sich anlegen; angelegte Rüstung zählt zum Rüstungsschutz', () => {
		const c = base();
		const key = view(c).equipmentStep.items[0].key;
		expect(view(c).live.armor).toBe(0);
		const worn = act(c, { type: 'toggleEquipped', key });
		expect(view(worn).equipmentStep.items[0].equipped).toBe(true);
		expect(view(worn).live.armor).toBe(4);
		expect(view(act(worn, { type: 'toggleEquipped', key })).live.armor).toBe(0);
	});
});

describe('Ressourcen und Zähler', () => {
	const allvater = () => act(base(), { type: 'chooseReligion', religion: 'kultDesAllvaters' });

	it('begrenzte Fähigkeiten lassen sich abhaken und zurücksetzen', () => {
		const c = act(allvater(), { type: 'useResource', id: 'zeichenDesBerges' });
		expect(view(c).live.resources).toContainEqual(expect.objectContaining({ id: 'zeichenDesBerges', used: 1, uses: 1 }));
		// Mehr als erlaubt geht nicht
		expect(view(act(c, { type: 'useResource', id: 'zeichenDesBerges' })).live.resources[0].used).toBe(1);
		expect(view(act(c, { type: 'resetResource', id: 'zeichenDesBerges' })).live.resources[0].used).toBe(0);
	});

	it('ein neuer Tag setzt Fähigkeiten „einmal am Tag“ zurück, eine Ruhephase die „pro Ruhephase“', () => {
		const c = act(allvater(), { type: 'useResource', id: 'zeichenDesBerges' });
		expect(view(act(c, { type: 'rest', hours: 8 })).live.resources[0].used).toBe(1);
		expect(view(act(c, { type: 'newDay' })).live.resources[0].used).toBe(0);
	});

	it('Zähler starten beim Startwert und bleiben zwischen 0 und Maximum', () => {
		const c = act(
			base(),
			{ type: 'setOptionalRule', rule: 'besondereHerkunft', enabled: true },
			{ type: 'chooseOriginOrStunt', choice: 'origin' },
			{ type: 'chooseOrigin', origin: 'bundDesArtefakts' }
		);
		expect(view(c).live.counters).toEqual([expect.objectContaining({ id: 'seelen', value: 1, max: 3 })]);
		expect(view(act(c, { type: 'setCounter', id: 'seelen', value: 5 })).live.counters[0].value).toBe(3);
		expect(view(act(c, { type: 'setCounter', id: 'seelen', value: -1 })).live.counters[0].value).toBe(0);
	});
});
