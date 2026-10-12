// Texte, die der Regelkern in Hinweisen und Warnungen ausgibt, gesammelt an einer Stelle.
export const messages = {
	speciesSource: (name: string) => `Spezies: ${name}`,
	optionNeedsCharacteristic: (trait: string) =>
		`${trait}: Diese Variante bringt eine zusätzliche Charakteristik, es wird aber ohne Charakteristik gespielt. Wähle eine andere Variante oder aktiviere die Charakteristik.`,
	notHighestAttribute: (trait: string, attribute: string, highest: string[]) =>
		`${trait}: ${attribute} ist nicht mehr das höchste Attribut (jetzt ${highest.join(' oder ')}). Wähle das Attribut neu.`
};
