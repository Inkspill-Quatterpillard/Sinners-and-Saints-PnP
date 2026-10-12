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
		religion: 'Religion',
		characteristic: 'Charakteristik',
		origin: 'Herkunft',
		profession: 'Profession',
		interests: 'Interessen',
		secondary: 'Sekundärattribute',
		senility: 'Vergreisung',
		stunts: 'Kunststücke',
		combat: 'Kampf',
		magic: 'Zauber'
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
		methodRoll: (count: number, sides: number, keep: number) => `Würfeln: ${count}W${sides}, die ${keep} höchsten zählen`,
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
	profession: {
		intro:
			'Stell deine Profession selbst zusammen und gib ihr einen Namen. Eine Liste vorgefertigter Professionen gibt es noch nicht.',
		name: 'Name der Profession',
		namePlaceholder: 'z. B. Söldnerin, Schreiber, Kräuterkundige',
		skills: (n: number, of: number) => `Professionsfertigkeiten (${n} von ${of})`,
		skillsHint: (bonus: number) => `Jede Professionsfertigkeit erhält +${bonus}. Die Zahl zeigt den aktuellen Wert.`,
		specHint: (names: string) => `Für ${names} lege zuerst unter „Alle Fertigkeiten“ eine Spezialisierung an.`,
		status: 'Status',
		statusHint: (start: number) =>
			`Der Status startet bei ${start}. Würfle 1W6 für den Bonus oder Malus deiner Profession: 1: −3, 2: −2, 3: −1, 4: +1, 5: +2, 6: +3.`,
		statusResult: (mod: string, value: number) => `Statusmodifikator ${mod}, Status jetzt ${value}.`,
		heroSkills: 'Heldenfertigkeiten',
		heroHint: 'Setze fünf Kampf- oder Magiefertigkeiten auf 14, 12, 10, 8 und 8. Die Werte ersetzen den Startwert.',
		heroSlot: (value: number) => `Auf ${value}`,
		start: (v: number | undefined) => `Start ${v ?? '–'}`
	},
	interests: {
		intro:
			'Verteile Punkte auf persönliche Interessen: beliebige Fertigkeiten, auch Professionsfertigkeiten, und den Status. Kampf- und Magiefertigkeiten sind ausgeschlossen.',
		basis: 'Punkte aus',
		basisOption: (attr: string, value: number | undefined) => `2 × ${attr} (${value === undefined ? '–' : value * 2} Punkte)`,
		needsAttributes: 'Lege zuerst die Grundattribute fest.',
		remaining: (remaining: number, total: number) =>
			remaining >= 0
				? `Noch ${remaining} von ${total} Punkten zu verteilen`
				: `${-remaining} Punkte zu viel verteilt (${total} verfügbar)`,
		status: 'Status',
		points: (name: string) => `Punkte für ${name}`,
		more: (name: string) => `${name} +1`,
		less: (name: string) => `${name} −1`
	},
	senility: {
		intro: (loss: number) =>
			`Würfle je Vergreisungswurf 1W100 gegen die Stabilität. Liegt der Wurf höher, sinkt die Stabilität um ${loss}.`,
		lost: (target: number) => `über ${target}: Stabilität sinkt`,
		kept: (target: number) => `nicht über ${target}`,
		result: (value: number | undefined) => `Stabilität jetzt: ${value ?? '–'}`
	},
	secondary: {
		intro:
			'Die Sekundärattribute ergeben sich aus den Grundattributen und werden immer abgerundet. Nur das Glück wird gewürfelt.',
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
		tied: 'Welches Attribut?',
		skill: (value: number) => `Fertigkeit für +${value}`
	},
	characteristic: {
		intro:
			'Eine Charakteristik ist eine Eigenschaft mit Vor- und Nachteilen. Wähle eine frei, würfle bis zu zwei (einmal darf neu gewürfelt werden) oder trage am Tisch gewürfelte ein. Du kannst auch ganz verzichten.',
		disabled: 'Ihr spielt ohne Charakteristik. Du kannst die optionale Regel unter „Optionen“ aktivieren.',
		forbidden: 'Durch „Eherner Wille“ hast du auf eine Charakteristik verzichtet.',
		mode: 'Wie?',
		modes: {
			none: 'Keine Charakteristik',
			free: 'Eine frei wählen',
			roll: 'Bis zu zwei würfeln (W100)',
			override: 'Eintragen (am Tisch gewürfelt)'
		},
		slot: (i: number, extra: boolean) => (extra ? `Zusätzliche Charakteristik (Spezies)` : `Charakteristik ${i + 1}`),
		reroll: 'Neu würfeln (einmalig)',
		rerolled: 'neu gewürfelt'
	},
	origin: {
		intro:
			'Die Besondere Herkunft gestaltet die Abstammung deines Charakters zusätzlich zur Spezies. Statt einer Herkunft darfst du ein zweites Kunststück wählen.',
		disabled: 'Ihr spielt ohne Besondere Herkunft. Du kannst die optionale Regel unter „Optionen“ aktivieren.',
		choice: 'Besondere Herkunft oder zweites Kunststück?',
		takeOrigin: 'Besondere Herkunft wählen',
		takeStunt: 'Stattdessen ein zweites Kunststück',
		origin: 'Herkunft'
	},
	stunts: {
		intro: (allowed: number) =>
			`Kunststücke sind besondere Fähigkeiten mit Voraussetzungen an Fertigkeiten oder Attribute. Du wählst ${allowed === 1 ? 'eines' : `${allowed}`}.`,
		chosen: (n: number, allowed: number) => `${n} von ${allowed} gewählt`,
		onlyAvailable: 'Nur verfügbare zeigen',
		search: 'Suchen',
		none: 'Keine passenden Kunststücke. Deaktiviere „Nur verfügbare zeigen“, um alle zu sehen.',
		tier: (tier: number, name: string) => `Stufe ${tier} (${name})`,
		unmet: (list: string) => `Fehlt: ${list}`
	},
	combat: {
		intro:
			'Ab 10 Punkten in einer Kampffertigkeit darfst du Kampftechniken wählen, ab 18 Punkten einen Kampfstil. Beides ist freiwillig.',
		techniques: 'Kampftechniken',
		noTechniques: 'Noch keine Kampffertigkeit hat 10 Punkte.',
		unlocked: (chosen: number, allowed: number, tier: string) => `${chosen} von ${allowed} Techniken, bis Stufe ${tier}`,
		tier: (tier: string) => `Stufe ${tier}`,
		style: 'Kampfstil',
		styleHint: (from: number) =>
			`Ein Kampfstil verlangt ${from} Punkte in einer Nah- oder Fernkampffertigkeit und gilt dann für alle Kampffertigkeiten.`,
		noStyle: 'Noch keine Kampffertigkeit erreicht 18 Punkte.',
		noStyleChoice: 'Kein Kampfstil',
		melee: 'Nahkampf',
		ranged: 'Fernkampf'
	},
	magic: {
		intro:
			'Wer Punkte in eine arkane Fertigkeit steckt, erlernt ihre Basiszauber automatisch. Ab 6 Punkten kommen wählbare Zauber hinzu, höhere Stufen ab 12 und 18 Punkten.',
		none: 'Dein Charakter hat keine arkane Fertigkeit gelernt.',
		contingent: (chosen: number, total: number, maxTier: number, tier2: number, tier3: number) =>
			`${chosen} von ${total} Zaubern` +
			(maxTier ? `, bis Stufe ${['', 'I', 'II', 'III'][maxTier]}` : '') +
			(tier2 ? `, höchstens ${tier2} der Stufe II` : '') +
			(tier3 ? `, höchstens ${tier3} der Stufe III` : ''),
		basics: 'Basiszauber (automatisch)',
		tier: (tier: number) => `Stufe ${['', 'I', 'II', 'III'][tier]}`,
		provisional:
			'Vorläufig: Die Tabelle der Zauberkontingente folgt Charaktererstellung.md, bis der Autor die Abweichung zu Magie_erlernen.md klärt (Regelfrage W6).'
	},
	religion: {
		intro: 'Die Religion prägt Erziehung und Weltbild deines Charakters. Jeder Kult gewährt einen Segen.',
		choose: 'Religion'
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
