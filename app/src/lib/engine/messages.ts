// Texte, die der Regelkern in Hinweisen und Warnungen ausgibt, gesammelt an einer Stelle.
export const messages = {
	speciesSource: (name: string) => `Spezies: ${name}`,
	optionNeedsCharacteristic: (trait: string) =>
		`${trait}: Diese Variante bringt eine zusätzliche Charakteristik, es wird aber ohne Charakteristik gespielt. Wähle eine andere Variante oder aktiviere die Charakteristik.`,
	notHighestAttribute: (trait: string, attribute: string, highest: string[]) =>
		`${trait}: ${attribute} ist nicht mehr das höchste Attribut (jetzt ${highest.join(' oder ')}). Wähle das Attribut neu.`,
	ageSourcePrefix: 'Alter: ',
	ageSource: (stage: 'child' | 'youth') => (stage === 'child' ? 'Alter: Kind' : 'Alter: Jugend'),
	maturitySource: 'Reifewurf',
	atrophiaSource: 'Atrophia',
	senilitySource: 'Vergreisung',
	ageMovementSource: 'Alter',
	malusWrongAttribute: (attr: string) => `Der Altersmalus darf nur auf STR, KON oder INT verteilt werden, nicht auf ${attr}.`,
	tooMuchMalus: (distributed: number, required: number) =>
		`Es sind ${distributed} Malus-Punkte verteilt, vorgesehen sind ${required}.`,
	atrophiaNotPhysical: (attr: string) => `Atrophia trifft nur körperliche Attribute (STR, KON, GES, WAH), nicht ${attr}.`,
	belowMinimum: (attr: string, value: number, min: number) =>
		`${attr} fiele durch Altersmali auf ${value}. Kein Attribut darf dadurch unter ${min} sinken.`
,
	professionSource: (name: string) => `Profession: ${name || 'ohne Namen'}`,
	heroSkillSource: 'Heldenfertigkeit',
	professionSkillMissing: (key: string) =>
		`Die Professionsfertigkeit ${key.replace(':', ': ')} gibt es nicht mehr (z. B. weil die Spezialisierung entfernt wurde). Wähle eine andere.`,
	heroSkillLowered: (name: string, start: number, value: number) =>
		`${name}: Der Startwert ${start} sinkt durch das Setzen auf ${value}. Das ist erlaubt, aber vermutlich nicht gewollt.`
,
	interestsSource: 'Persönliche Interessen',
	tooManyInterestPoints: (spent: number, total: number) =>
		`Es sind ${spent} Punkte für Persönliche Interessen verteilt, zur Verfügung stehen ${total}. Nimm ${spent - total} Punkte zurück.`
};
