import type { CurrencyDef } from '$lib/ruleData';

/** Formatiert einen Betrag in der kleinsten Einheit, z. B. 1250 Pfennig → „12 K 50 Pf“. */
export function formatMoney(amount: number, currency: CurrencyDef): string {
	const sign = amount < 0 ? '−' : '';
	let rest = Math.abs(Math.round(amount));
	if (rest === 0) return `0 ${currency.units.at(-1)!.short}`;
	const parts: string[] = [];
	for (const unit of currency.units) {
		const n = Math.floor(rest / unit.value);
		if (n > 0) {
			parts.push(`${n.toLocaleString('de-DE')} ${unit.short}`);
			rest -= n * unit.value;
		}
	}
	return sign + parts.join(' ');
}

/** Liest Eingaben wie „12,5 K“, „3 K 20 Pf“, „150 Pf“ oder „40“ (in der größten gebräuchlichen Einheit: Kronen bzw. Kronkorken). */
export function parseMoney(text: string, currency: CurrencyDef): number | undefined {
	const cleaned = text.trim().replace(/\./g, '').replace(',', '.');
	if (!cleaned) return undefined;
	const defaultUnit = currency.units.find((u) => u.value === currency.kroneValue) ?? currency.units[0];
	let total = 0;
	let matched = false;
	for (const m of cleaned.matchAll(/(\d+(?:\.\d+)?)\s*([a-zA-ZäöüÄÖÜ]*)/g)) {
		const value = Number(m[1]);
		const unitText = m[2].toLowerCase();
		const unit = unitText
			? currency.units.find((u) => u.short.toLowerCase() === unitText || u.name.toLowerCase().startsWith(unitText))
			: defaultUnit;
		if (!unit) return undefined;
		total += value * unit.value;
		matched = true;
	}
	return matched ? Math.round(total) : undefined;
}
