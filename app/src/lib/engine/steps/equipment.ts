import type { CurrencyDef, RuleData } from '$lib/ruleData';
import type { Basis, PlayState } from '../character';
import type { Derivation } from '../derivation';
import { messages } from '../messages';

export type EquipmentAction =
	/** Ohne `found` gekauft: in der Erstellung aus dem Geldbeutel, im Spiel vom Geld. */
	| { type: 'addItem'; catalogId: string; found?: boolean }
	| { type: 'addItem'; name: string; price: number; note?: string; found?: boolean }
	| { type: 'updateItem'; key: string; quantity?: number; price?: number; note?: string; name?: string }
	| { type: 'removeItem'; key: string }
	| { type: 'toggleEquipped'; key: string }
	/** Ein Stück verkaufen (voller Preis zurück) bzw. verlieren (kein Geld). */
	| { type: 'sellItem'; key: string }
	| { type: 'loseItem'; key: string };

/** Ein Gegenstand des Charakters, aus dem Katalog oder frei eingetragen. */
export interface OwnedItem {
	key: string;
	catalogId?: string;
	name: string;
	/** Preis in der kleinsten Einheit der Währung von `setting`. */
	price: number;
	/** Setting, in dessen Währung der Preis gilt. */
	setting: string;
	quantity: number;
	note?: string;
	/** Angelegt bzw. getragen (lebender Bogen). */
	equipped?: boolean;
	/** Gefunden statt gekauft: kostet nichts. */
	found?: boolean;
	/** Im Spiel gekauft: bezahlt vom Geld im Spiel, nicht aus dem Geldbeutel der Erstellung. */
	paidInPlay?: boolean;
}

export interface OwnedItemView extends OwnedItem {
	/** Preise in der Währung des aktuellen Settings (umgerechnet, falls nötig). */
	priceMax?: number;
	/** Der Gegenstand wurde in einem anderen Setting gekauft; der Preis ist umgerechnet. */
	foreignCurrency: boolean;
	category?: string;
	group?: string;
	stats: Record<string, string>;
}

export interface EquipmentStepView {
	/** ID des Settings, dessen Währung gilt. */
	currency: string;
	stage: string;
	stageName: string;
	purse: number;
	daily: number;
	/** Besitztümer; `open` = „und mehr“ (z. B. 5.000.000+ Kronen). */
	possessions: { amount: number; open?: boolean };
	items: OwnedItemView[];
	spent: number;
	remaining: number;
}

export function applyEquipmentAction(basis: Basis, action: EquipmentAction, rd: RuleData, setting: string): void {
	const eq = basis.equipment;
	switch (action.type) {
		case 'addItem': {
			const key = `i${eq.nextKey++}`;
			if ('catalogId' in action) {
				const def = rd.equipment.find((i) => i.id === action.catalogId);
				if (!def) return;
				eq.items.push({ key, catalogId: def.id, name: def.name, price: def.price ?? 0, setting: def.setting, quantity: 1 });
			} else {
				eq.items.push({ key, name: action.name, price: Math.max(0, action.price), setting, quantity: 1, note: action.note });
			}
			if (action.found) eq.items.at(-1)!.found = true;
			break;
		}
		case 'updateItem': {
			const owned = eq.items.find((i) => i.key === action.key);
			if (!owned) return;
			if (action.quantity !== undefined) owned.quantity = Math.max(1, Math.floor(action.quantity));
			if (action.price !== undefined) {
				// Ein neu eingetragener Preis gilt in der Währung des aktuellen Settings.
				owned.price = Math.max(0, Math.round(action.price));
				owned.setting = setting;
			}
			if (action.note !== undefined) owned.note = action.note;
			if (action.name !== undefined) owned.name = action.name;
			break;
		}
		case 'removeItem':
			eq.items = eq.items.filter((i) => i.key !== action.key);
			break;
		case 'toggleEquipped': {
			const owned = eq.items.find((i) => i.key === action.key);
			if (owned) owned.equipped = !owned.equipped;
			break;
		}
	}
}

/** Zählt ein Gegenstand gegen den Geldbeutel der Erstellung? */
const fromPurse = (i: OwnedItem) => !i.found && !i.paidInPlay;

/**
 * Geldwirksame Folgen von Kaufen, Verkaufen und Verlieren. Führt der Bogen das Geld im Spiel
 * (`play.money`), ändert sich dieses; sonst der Geldbeutel der Erstellung. `items` sind die Gegenstände
 * vor der Aktion mit Preisen in der aktuellen Währung.
 */
export function applyTradeAction(
	basis: Basis,
	play: PlayState,
	action: Extract<EquipmentAction, { type: 'addItem' | 'sellItem' | 'loseItem' }>,
	items: OwnedItemView[],
	newItemPrice: () => number
): void {
	const eq = basis.equipment;
	const inPlay = play.money !== undefined;
	if (action.type === 'addItem') {
		const added = eq.items.at(-1);
		if (!added || !inPlay || action.found) return;
		added.paidInPlay = true;
		play.money! -= newItemPrice();
		return;
	}
	const owned = eq.items.find((i) => i.key === action.key);
	const price = items.find((i) => i.key === action.key)?.price;
	if (!owned || price === undefined) return;
	if (owned.quantity > 1) owned.quantity--;
	else eq.items = eq.items.filter((i) => i !== owned);
	if (inPlay) {
		if (action.type === 'sellItem') play.money! += price;
	} else if (action.type === 'sellItem' && !fromPurse(owned)) {
		eq.purseAdjustment -= price;
	} else if (action.type === 'loseItem' && fromPurse(owned)) {
		eq.purseAdjustment += price;
	}
}

export function currencyOf(rd: RuleData, setting: string): CurrencyDef {
	return (rd.settings.find((s) => s.id === setting) ?? rd.settings[0]).currency;
}

export function evaluateEquipment(d: Derivation, socialStatus: number): EquipmentStepView {
	const rd = d.ruleData;
	const currency = currencyOf(rd, d.options.setting);
	const toUnits = (kronen: number) => Math.round(kronen * currency.kroneValue);
	const stage =
		rd.statusTable.stages.find((s) => (s.min === null || socialStatus >= s.min) && (s.max === null || socialStatus <= s.max)) ??
		rd.statusTable.stages[0];
	const possessions =
		stage.possessions.fixed !== undefined
			? { amount: toUnits(stage.possessions.fixed), open: true }
			: { amount: toUnits(Math.max(0, socialStatus) * (stage.possessions.factor ?? 0)) };

	const items: OwnedItemView[] = d.character.basis.equipment.items.map((owned) => {
		const def = owned.catalogId ? rd.equipment.find((i) => i.id === owned.catalogId) : undefined;
		const foreignCurrency = owned.setting !== d.options.setting;
		// Umrechnung über die Krone der Statustabelle (vorläufig 1 Krone = 1 Kronkorken, Regelfrage F1).
		const factor = currency.kroneValue / currencyOf(rd, owned.setting).kroneValue;
		const convert = (n: number | undefined) => (n === undefined ? undefined : Math.round(n * factor));
		return {
			...owned,
			price: convert(owned.price)!,
			priceMax: convert(def?.priceMax),
			foreignCurrency,
			category: def?.category,
			group: def?.group,
			stats: def?.stats ?? {}
		};
	});
	const spent =
		items.filter(fromPurse).reduce((sum, i) => sum + i.price * i.quantity, 0) + d.character.basis.equipment.purseAdjustment;
	const purse = toUnits(stage.purse);
	if (spent > purse) d.issues.push({ step: 'equipment', severity: 'warning', message: messages.overspent });

	d.steps.push({ id: 'equipment', status: 'valid' });
	return {
		currency: d.options.setting,
		stage: stage.id,
		stageName: stage.name,
		purse,
		daily: toUnits(stage.daily),
		possessions,
		items,
		spent,
		remaining: purse - spent
	};
}
