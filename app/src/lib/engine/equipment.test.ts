import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);
const view = (c: Character) => computeView(c, ruleData);
const item = (name: string, setting = 'standard') => ruleData.equipment.find((i) => i.name === name && i.setting === setting)!;

const ATTRS = arrayAttributes();
const status = (die: number): Action => ({ type: 'rollStatus', roll: { dice: [die], source: 'manual' } });

describe('Geld und Besitz', () => {
	it.each([
		[1, 2, 'arm', 300, 50],
		[3, 4, 'durchschnittlich', 1000, 100],
		[6, 8, 'durchschnittlich', 1000, 100]
	])('Status-W6 %i → Status %i: %s, Geldbeutel %i Pfennig, Tagesgeld %i Pfennig', (die, value, stage, purse, daily) => {
		const v = view(play(...ATTRS, status(die)));
		expect(v.socialStatus.value).toBe(value);
		expect(v.equipmentStep).toMatchObject({ stage, purse, daily });
	});

	it('Besitztümer nach der Formel Status × Faktor', () => {
		// Status 4: Durchschnittlich, 4 × 250 Kronen
		expect(view(play(...ATTRS, status(3))).equipmentStep.possessions).toEqual({ amount: 100000 });
	});

	it('Status 0 ist mittellos, ab 20 kaiserlich', () => {
		const poor = play(
			...ATTRS,
			status(1),
			{ type: 'setCharacteristicMode', mode: 'free' },
			{ type: 'pickCharacteristic', slot: 0, characteristic: 'weltenbummler' }
		);
		// 5 − 3 − 3 = −1 → mittellos
		expect(view(poor).equipmentStep).toMatchObject({ stage: 'mittellos', purse: 15 });
		const rich = play(...ATTRS, status(6), { type: 'setInterestPoints', target: 'status', points: 12 });
		expect(view(rich).equipmentStep).toMatchObject({
			stage: 'kaiserlich',
			purse: 40000,
			possessions: { amount: 500000000, open: true }
		});
	});

	it('im Fallout-Setting gilt die Währung Kronkorken', () => {
		const c = play(...ATTRS, status(3), { type: 'setSetting', setting: 'fallout' });
		expect(view(c).equipmentStep).toMatchObject({ currency: 'fallout', purse: 10, daily: 1 });
	});
});

describe('Ausrüstung', () => {
	it('Gegenstände aus dem Katalog kosten ihren Preis; das Restgeld wird angezeigt', () => {
		const c = play(
			...ATTRS,
			status(3),
			{ type: 'addItem', catalogId: item('Gambeson').id },
			{ type: 'addItem', catalogId: item('Stachelring').id }
		);
		const v = view(c).equipmentStep;
		// 10 Kronen Geldbeutel − 10 Kronen − 1,5 Kronen
		expect(v.spent).toBe(1150);
		expect(v.remaining).toBe(-150);
		expect(v.items.map((i) => i.name)).toEqual(['Gambeson', 'Stachelring']);
	});

	it('Überziehen ist erlaubt, ergibt aber eine Warnung', () => {
		const c = play(...ATTRS, status(3), { type: 'addItem', catalogId: item('Langbogen').id });
		expect(view(c).issues).toContainEqual(expect.objectContaining({ step: 'equipment', severity: 'warning' }));
		expect(view(c).steps.find((s) => s.id === 'equipment')?.status).toBe('valid');
	});

	it('freie Einträge mit eigenem Preis sind möglich', () => {
		const c = play(...ATTRS, status(3), { type: 'addItem', name: 'Familienring', price: 0, note: 'Erbstück' });
		expect(view(c).equipmentStep.items[0]).toMatchObject({ name: 'Familienring', price: 0, note: 'Erbstück' });
	});

	it('Menge und Preis lassen sich ändern, Gegenstände entfernen', () => {
		let c = play(...ATTRS, status(3), { type: 'addItem', catalogId: item('Tunika').id });
		const key = view(c).equipmentStep.items[0].key;
		// Preisspanne 80–300 Pfennig: gerechnet wird mit dem unteren Wert
		expect(view(c).equipmentStep.items[0]).toMatchObject({ price: 80, priceMax: 300 });
		c = applyAction(c, { type: 'updateItem', key, quantity: 2, price: 200 }, ruleData);
		expect(view(c).equipmentStep.spent).toBe(400);
		c = applyAction(c, { type: 'removeItem', key }, ruleData);
		expect(view(c).equipmentStep.items).toEqual([]);
	});

	describe('Kaufen, Finden, Verkaufen, Verlieren', () => {
		const gambeson = () => item('Gambeson').id;
		const keyOf = (c: Character) => view(c).equipmentStep.items[0].key;

		it('Gefundenes kostet nichts', () => {
			const c = play(...ATTRS, status(3), { type: 'addItem', catalogId: gambeson(), found: true });
			expect(view(c).equipmentStep.items[0]).toMatchObject({ name: 'Gambeson', found: true });
			expect(view(c).equipmentStep.spent).toBe(0);
		});

		it('Verkaufen bringt den vollen Preis zurück, auch für Gefundenes', () => {
			const bought = play(...ATTRS, status(3), { type: 'addItem', catalogId: gambeson() });
			const sold = applyAction(bought, { type: 'sellItem', key: keyOf(bought) }, ruleData);
			expect(view(sold).equipmentStep).toMatchObject({ items: [], spent: 0, remaining: 1000 });
			const found = play(...ATTRS, status(3), { type: 'addItem', catalogId: gambeson(), found: true });
			const soldFound = applyAction(found, { type: 'sellItem', key: keyOf(found) }, ruleData);
			expect(view(soldFound).equipmentStep).toMatchObject({ items: [], remaining: 2000 });
		});

		it('Verlieren gibt kein Geld zurück', () => {
			const bought = play(...ATTRS, status(3), { type: 'addItem', catalogId: gambeson() });
			const lost = applyAction(bought, { type: 'loseItem', key: keyOf(bought) }, ruleData);
			expect(view(lost).equipmentStep).toMatchObject({ items: [], remaining: 0 });
		});

		it('bei mehreren Stück wird eines verkauft oder verloren', () => {
			let c = play(...ATTRS, status(3), { type: 'addItem', catalogId: item('Tunika').id });
			c = applyAction(c, { type: 'updateItem', key: keyOf(c), quantity: 3 }, ruleData);
			c = applyAction(c, { type: 'sellItem', key: keyOf(c) }, ruleData);
			expect(view(c).equipmentStep.items[0].quantity).toBe(2);
			expect(view(c).equipmentStep.spent).toBe(160);
			c = applyAction(c, { type: 'loseItem', key: keyOf(c) }, ruleData);
			expect(view(c).equipmentStep.items[0].quantity).toBe(1);
			expect(view(c).equipmentStep.spent).toBe(160);
		});
	});

	it('wechselt das Setting, werden Preise anderer Währungen umgerechnet statt falsch gelesen', () => {
		// Gambeson 10 Kronen = 1000 Pfennig; im Fallout-Setting (vorläufig 1 Krone = 1 Kronkorken) also 10 Kronkorken
		const c = play(
			...ATTRS,
			status(3),
			{ type: 'addItem', catalogId: item('Gambeson').id },
			{ type: 'setSetting', setting: 'fallout' }
		);
		expect(view(c).equipmentStep).toMatchObject({ purse: 10, spent: 10, remaining: 0 });
		expect(view(c).equipmentStep.items[0]).toMatchObject({ price: 10, foreignCurrency: true });
	});

	it('Katalogwerte wie Schaden und Länge werden mitgeführt', () => {
		const c = play(...ATTRS, { type: 'addItem', catalogId: item('Stachelring').id });
		expect(view(c).equipmentStep.items[0].stats).toMatchObject({ Schaden: '1W4+2', Länge: 'Minimal' });
	});
});
