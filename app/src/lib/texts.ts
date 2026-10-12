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
		attributes: 'Grundattribute',
		species: 'Spezies',
		age: 'Alter',
		secondary: 'Sekundärattribute',
		senility: 'Vergreisung'
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
	species: {
		intro: 'Die Spezies verändert die Grundattribute und bringt zwei Eigenschaften mit sich.',
		traits: 'Eigenschaften'
	},
	age: {
		intro: 'Das Alter entscheidet über Mali junger Charaktere, Reifewürfe und den Verfall im Alter.',
		chooseSpeciesFirst: 'Die Altersstufen hängen von der Spezies ab. Wähle zuerst eine Spezies.',
		ranges: (species: string, child: number, youth: number, adult: number, interval: number) =>
			`${species}: Kind unter ${child}, jugendlich unter ${youth}, erwachsen unter ${adult} Jahren; danach alle ${interval} Jahre eine Alterungsstufe.`,
		years: 'Alter in Jahren',
		stages: { child: 'Kind', youth: 'Jugendlich', adult: 'Erwachsen', aging: 'Gealtert' },
		agingStages: (n: number) => `${n} Alterungsstufe${n === 1 ? '' : 'n'}`,
		malus: 'Malus',
		malusHint: (required: number, distributed: number) =>
			`Verteile insgesamt ${required} Malus-Punkte frei auf STR, KON und INT (verteilt: ${distributed}). Kein Attribut darf dadurch unter 5 fallen.`,
		maturity: 'Reifewürfe',
		maturityHint: 'Wähle INT oder KLU und würfle 1W20. Liegt das Ergebnis über dem aktuellen Wert, steigt er um 1.',
		maturityTarget: (i: number) => `Zielattribut für Reifewurf ${i + 1}`,
		maturitySuccess: (target: number) => `über ${target}: +1`,
		maturityFail: (target: number) => `nicht über ${target}`,
		atrophia: 'Atrophia',
		atrophiaHint: 'Jeder Punkt Atrophia senkt ein körperliches Attribut deiner Wahl um 1. Punkte dürfen gebündelt werden.',
		atrophiaPoint: (i: number) => `Atrophia-Punkt ${i + 1}`
	},
	senility: {
		intro: (loss: number) => `Würfle je Vergreisungswurf 1W100 gegen die Stabilität. Liegt der Wurf höher, sinkt die Stabilität um ${loss}.`,
		lost: (target: number) => `über ${target}: Stabilität sinkt`,
		kept: (target: number) => `nicht über ${target}`,
		result: (value: number | undefined) => `Stabilität jetzt: ${value ?? '–'}`
	},
	secondary: {
		intro: 'Die Sekundärattribute ergeben sich aus den Grundattributen und werden immer abgerundet. Nur das Glück wird gewürfelt.',
		luck: 'Glück',
		luckPlain: 'Würfle 1W20.',
		luckAdvantage: 'Würfle mit Vorteil: zwei W20, der höhere zählt.',
		luckNeedsSecondDie: 'Mit Vorteil braucht es zwei Würfel. Würfle oder trage den zweiten nach.',
		value: 'Wert',
		formula: 'Berechnung',
		result: 'Ergebnis',
		cap: (max: number) => `höchstens ${max}`
	},
	skills: {
		all: 'Alle Fertigkeiten',
		categories: { general: 'Fertigkeiten', combat: 'Kampffertigkeiten', arcane: 'Arkane Fertigkeiten' },
		skill: 'Fertigkeit',
		value: 'Wert',
		valueHint: 'Voller Wert (Erfolgsstufe I); ½ und ⅕ für die Erfolgsstufen II und III',
		anySpecialization: 'Grundwert für jede Spezialisierung',
		specializationPlaceholder: 'Spezialisierung hinzufügen',
		addSpecialization: (name: string) => `Spezialisierung für ${name} hinzufügen`,
		removeSpecialization: (name: string) => `${name} entfernen`
	},
	traits: {
		choose: 'Wähle eine Variante',
		tied: 'Welches Attribut?'
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
