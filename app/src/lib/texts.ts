// Alle sichtbaren Texte an einer Stelle, damit eine spätere Übersetzung möglich bleibt.
export const t = {
	appTitle: 'Sinners and Saints',
	appSubtitle: 'Charaktere',
	characters: 'Deine Charaktere',
	noCharacters: 'Noch keine Charaktere. Leg deinen ersten an!',
	newCharacter: 'Neuer Charakter',
	unnamed: 'Unbenannt',
	backToList: 'Zur Übersicht',
	name: 'Name',
	notFound: 'Dieser Charakter wurde nicht gefunden.',
	loading: 'Lädt …',
	status: {
		inCreation: 'In Erstellung',
		finished: 'Fertig'
	},
	stepStatus: {
		open: 'offen',
		valid: 'gültig',
		invalid: 'ungültig'
	},
	steps: {
		options: 'Optionen',
		attributes: 'Grundattribute'
	} as Record<string, string>,
	previousStep: '← Zurück',
	nextStep: 'Weiter →',
	summary: 'Zusammenfassung',
	options: {
		intro: 'Optionale Regeln und Setting lassen sich jederzeit ändern. Der Charakter wird dann neu bewertet.',
		optionalRules: 'Optionale Regeln',
		setting: 'Setting'
	},
	attributes: {
		intro: 'Bestimme die Werte der acht Grundattribute und verteile sie frei.',
		method: 'Verfahren',
		methodRoll: (count: number, sides: number, keep: number) =>
			`Würfeln: ${count}W${sides}, die ${keep} höchsten zählen`,
		methodArray: (values: number[]) => `Festes Array: ${values.join(', ')}`,
		slots: 'Werte',
		slot: (index: number) => `Wert ${index + 1}`,
		assign: 'Verteilung',
		notAssigned: '–',
		rollAll: 'Alle würfeln',
		chooseMethod: 'Wähle zuerst ein Verfahren.'
	},
	dice: {
		roll: (count: number, sides: number) => `${count}W${sides} würfeln`,
		enter: 'Eintragen',
		apply: 'Übernehmen',
		cancel: 'Abbrechen',
		manualPlaceholder: (count: number, sides: number) => (count === 1 ? `1–${sides}` : `${count} Würfel, z. B. 6 4 3 1`),
		manualLabel: (count: number, sides: number) => `${count}W${sides} von Hand eintragen`,
		appBadge: 'App',
		manualBadge: 'Tisch',
		rolledByApp: 'Von der App gewürfelt',
		enteredManually: 'Am Tisch gewürfelt und eingetragen'
	}
};
