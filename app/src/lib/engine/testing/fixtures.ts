import { ruleData as realRuleData, type RuleData } from '$lib/ruleData';
import { applyAction, createCharacter, type Action, type Character } from '../index';

/**
 * Kleine, stabile Testdaten für Mechaniktests (Neubewertung, ungültige Entscheidungen).
 * Sie ändern sich nicht, wenn sich das Regelwerk ändert.
 */
export const testRuleData: RuleData = {
	...realRuleData,
	version: 999,
	species: [
		{
			id: 'testvolk',
			name: 'Testvolk',
			source: { file: 'test' },
			attributeModifiers: { STR: 1 },
			traits: [
				{
					id: 'testwahl',
					name: 'Testwahl',
					text: 'Entweder höchstes Attribut +1 oder eine Charakteristik mehr.',
					options: [
						{ id: 'hoch', name: 'Höchstes +1', effects: [{ type: 'highestAttribute', bonus: 1, others: 0 }] },
						{ id: 'charakteristik', name: 'Charakteristik', effects: [{ type: 'extraCharacteristic', count: 1 }] }
					]
				}
			]
		},
		{ id: 'anderes', name: 'Anderes', source: { file: 'test' }, attributeModifiers: {}, traits: [] }
	]
};

export function playWith(ruleData: RuleData, ...actions: Action[]): Character {
	return actions.reduce((c, a) => applyAction(c, a, ruleData), createCharacter('test', ruleData.version));
}

/** Weist das feste Array in der angegebenen Reihenfolge den Attributen zu (16, 14, 12, 12, 10, 10, 10, 8). */
export function arrayAttributes(order: string[] = ['STR', 'KON', 'GES', 'WAH', 'KLU', 'INT', 'CHA', 'WIL']): Action[] {
	return [
		{ type: 'setAttributeMethod', method: 'array' },
		...order.map((attribute, slot) => ({ type: 'assignAttribute', attribute, slot }) as Action)
	];
}
