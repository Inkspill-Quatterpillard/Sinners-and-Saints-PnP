import type { Roll } from '$lib/engine';

/** Würfelt `count` Würfel mit `sides` Seiten. Der Zufall lebt bewusst außerhalb des Regelkerns. */
export function rollDice(count: number, sides: number): Roll {
	const dice = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
	return { dice, source: 'app' };
}

/** Liest von Hand eingetragene Würfel wie „6 4 3 1“ oder „6,4,3,1“. */
export function parseManualDice(text: string, count: number, sides: number): Roll | undefined {
	const dice = text
		.split(/[\s,;]+/)
		.filter(Boolean)
		.map(Number);
	if (dice.length !== count || dice.some((d) => !Number.isInteger(d) || d < 1 || d > sides)) {
		return undefined;
	}
	return { dice, source: 'manual' };
}
