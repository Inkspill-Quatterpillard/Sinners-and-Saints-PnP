// Alle sichtbaren Texte an einer Stelle, damit eine spätere Übersetzung möglich bleibt.
import { roman } from '$lib/format';
export const t = {
	appTitle: 'Sinners and Saints',
	appSubtitle: 'Charaktere',
	characters: 'Deine Charaktere',
	noCharacters: 'Noch keine Charaktere. Leg deinen ersten an!',
	newCharacter: 'Neuer Charakter',
	unnamed: 'Unbenannt',
	backToList: 'Zur Übersicht',
	back: 'Zurück',
	breakdown: (label: string) => `Zusammensetzung ${label}`,
	statusLabel: 'Status',
	statusStart: 'Startwert',
	valueBase: 'Grundwert',
	fromFormula: 'Aus der Formel',
	formula: (f: string) => `Formel: ${f}`,
	name: 'Name',
	notFound: 'Dieser Charakter wurde nicht gefunden.',
	loading: 'Lädt …',
	close: 'Schließen',
	points: {
		more: (label: string) => `${label} +1`,
		less: (label: string) => `${label} −1`
	},
	undo: '↶ Rückgängig',
	redo: '↷ Wiederherstellen',
	save: 'Speichern',
	saved: 'Gespeichert',
	export: 'Exportieren',
	jumpTo: (step: string) => `Zurück zu ${step} →`,
	jumpToOpen: (step: string) => `Zum nächsten offenen Schritt: ${step} →`,
	status: {
		inCreation: 'In Erstellung',
		finished: 'Fertig'
	},
	stepStatus: {
		open: 'offen',
		valid: 'gültig',
		invalid: 'ungültig'
	},
	stepsLabel: 'Schritte der Erstellung',
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
		stunts: 'Kunststücke',
		combat: 'Kampf',
		magic: 'Zauber',
		equipment: 'Ausstattung',
		background: 'Vorgeschichte'
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
		confirmRerollAll: 'Alle Werte neu würfeln? Die bisherigen Würfe gehen verloren.',
		chooseMethod: 'Wähle zuerst ein Verfahren.',
		methodHint:
			'Ein Wechsel des Verfahrens setzt die Verteilung zurück, weil die Werte andere sind. Gewürfelte Werte bleiben erhalten.',
		luckValue: (v: number) => `Glück: ${v}`
	},
	species: {
		intro: 'Die Spezies verändert die Grundattribute und bringt zwei Eigenschaften mit sich.',
		traits: 'Eigenschaften'
	},
	age: {
		intro: 'Das Alter entscheidet über Mali junger Charaktere, Reifewürfe und den Verfall im Alter.',
		chooseSpeciesFirst: 'Die Altersstufen hängen von der Spezies ab. Wähle zuerst eine Spezies.',
		yearsOptional: 'Alter in Jahren (optional)',
		agingStagesLabel: 'Alterungsstufen',
		under: (n: number) => `unter ${n} Jahren`,
		between: (a: number, b: number) => `${a}–${b} Jahre`,
		from: (n: number, step: number) => `ab ${n} Jahren, alle ${step} Jahre eine Stufe`,
		maturityCap: (n: number) => `Höchstens ${n} Reifewürfe.`,
		senility: 'Vergreisungswürfe',
		stages: { child: 'Kind', youth: 'Jugendlich', adult: 'Erwachsen', aging: 'Gealtert' },
		malus: 'Malus',
		malusHint: (required: number, distributed: number) =>
			`Verteile insgesamt ${required} Malus-Punkte frei auf STR, KON und INT (verteilt: ${distributed}). Kein Attribut darf dadurch unter 5 fallen.`,
		maturity: 'Reifewürfe',
		maturityHint: 'Wähle INT oder KLU und würfle 1W20. Liegt das Ergebnis über dem aktuellen Wert, steigt er um 1.',
		maturityTarget: (i: number) => `Zielattribut für Reifewurf ${i + 1}`,
		maturitySuccess: (target: number) => `über ${target}: +1`,
		maturityFail: (target: number) => `nicht über ${target}`,
		atrophia: 'Atrophia',
		atrophiaHint: (required: number, distributed: number) =>
			`Verteile ${required} Punkte Atrophia auf körperliche Attribute (verteilt: ${distributed}). Kein Attribut darf dadurch unter 5 fallen.`
	},
	profession: {
		intro:
			'Stell deine Profession selbst zusammen und gib ihr einen Namen. Eine Liste vorgefertigter Professionen gibt es noch nicht.',
		name: 'Name der Profession',
		namePlaceholder: 'z. B. Söldnerin, Schreiber, Kräuterkundige',
		skills: (n: number, of: number) => `Professionsfertigkeiten (${n} von ${of})`,
		skillsHint: (bonus: number) => `Jede Professionsfertigkeit erhält +${bonus}. Die Zahl zeigt den aktuellen Wert.`,
		specTitle: 'Spezialisierungen',
		specHint:
			'Manche Fertigkeiten gibt es nur mit Spezialisierung, z. B. Handwerk (Schmied). Lege sie hier an, dann kannst du sie oben wählen.',
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
		basisPoints: (value: number | undefined) => (value === undefined ? '–' : `${value * 2} Punkte`),
		needsAttributes: 'Lege zuerst die Grundattribute fest.',
		remaining: (remaining: number, total: number) =>
			remaining >= 0
				? `Noch ${remaining} von ${total} Punkten zu verteilen`
				: `${-remaining} Punkte zu viel verteilt (${total} verfügbar)`,
		status: 'Status'
	},
	senility: {
		intro: (loss: number) =>
			`Würfle je Vergreisungswurf 1W100 gegen die Stabilität. Liegt der Wurf höher, sinkt die Stabilität um ${loss}.`,
		lost: (target: number) => `über ${target}: Stabilität sinkt`,
		kept: (target: number) => `nicht über ${target}`,
		result: (value: number | undefined) => `Stabilität jetzt: ${value ?? '–'}`
	},
	secondary: {
		luck: 'Glück',
		luckPlain: 'Würfle 1W20.',
		luckAdvantage: 'Würfle mit Vorteil: zwei W20, der höhere zählt.',
		luckNeedsSecondDie: 'Mit Vorteil braucht es zwei Würfel. Würfle oder trage den zweiten nach.'
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
			'Eine Charakteristik ist eine Eigenschaft mit Vor- und Nachteilen. Wähle eine frei, oder würfle bis zu zwei (einmal darf neu gewürfelt werden). Am Tisch gewürfelte Ergebnisse wählst du im Feld daneben aus. Du kannst auch ganz verzichten.',
		disabled: 'Ihr spielt ohne Charakteristik. Du kannst die optionale Regel unter „Optionen“ aktivieren.',
		mode: 'Wie?',
		modes: {
			none: 'Keine Charakteristik',
			free: 'Eine frei wählen',
			roll: 'Bis zu zwei würfeln (W100)'
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
			(maxTier ? `, bis Stufe ${roman(maxTier)}` : '') +
			(tier2 ? `, höchstens ${tier2} der Stufe II` : '') +
			(tier3 ? `, höchstens ${tier3} der Stufe III` : ''),
		basics: 'Basiszauber (automatisch)',
		tier: (tier: number) => `Stufe ${roman(tier)}`,
		provisional:
			'Vorläufig: Die Tabelle der Zauberkontingente folgt Charaktererstellung.md, bis der Autor die Abweichung zu Magie_erlernen.md klärt (Regelfrage W6).'
	},
	equipment: {
		intro:
			'Dein Status bestimmt Geldbeutel, Tagesgeld und Besitztümer. Kaufe oder finde Gegenstände aus dem Katalog oder trage eigene ein. Überziehen ist möglich, die App zeigt dir, was übrig bleibt.',
		stage: 'Stufe',
		statusOrigin: 'Wie setzt sich der Status zusammen?',
		status: (v: number) => `Status ${v}`,
		purse: 'Geldbeutel',
		daily: 'Tagesgeld',
		possessions: 'Besitztümer',
		remaining: 'Übrig',
		owned: 'Deine Ausrüstung',
		nothing: 'Noch nichts eingetragen.',
		range: (low: string, high: string) => `Preisspanne ${low} – ${high}`,
		converted: 'Preis aus einem anderen Setting umgerechnet',
		quantity: 'Menge',
		quantityOf: (name: string) => `Menge ${name}`,
		priceOf: (name: string) => `Preis ${name}`,
		sell: 'Verkaufen',
		lose: 'Verlieren',
		buy: 'Kaufen',
		find: 'Finden',
		found: 'gefunden',
		sellOf: (name: string) => `${name} verkaufen (voller Preis zurück)`,
		loseOf: (name: string) => `${name} verlieren (kein Geld zurück)`,
		buyOf: (name: string) => `${name} kaufen`,
		findOf: (name: string) => `${name} finden (kostenlos)`,
		tradeHint: 'Kaufen kostet den Preis, Finden nichts. Verkaufen bringt den vollen Preis zurück, Verlieren nichts.',
		swipeHint: 'Wische nach links oder rechts, um die Kategorie zu wechseln.',
		freeName: 'Eigener Gegenstand',
		freePrice: 'Preis, z. B. 3 K 20 Pf',
		catalog: 'Katalog',
		groups: { melee: 'Nahkampf', ranged: 'Fernkampf', armor: 'Rüstungen', shield: 'Schilde', gear: 'Ausrüstung' },
		search: 'Im Katalog suchen'
	},
	background: {
		intro:
			'Die Vorgeschichte ist freiwillig und erzählerisch. Sie hilft dir, deinen Charakter zu entdecken, und ist später der Bezugspunkt in Reflexionsphasen. Würfle aus den Tabellen oder schreib frei.',
		identity: 'Person',
		culture: 'Namenskultur',
		nameGender: 'Namen für',
		female: 'weiblich',
		male: 'männlich',
		suggest: 'Namen vorschlagen',
		gender: 'Geschlecht',
		appearance: 'Aussehen (ein oder zwei Adjektive)',
		rollAdjectives: 'Würfeln',
		description: 'Persönliche Beschreibung',
		beliefs: 'Glaube und Weltanschauung',
		belief: 'Glaube',
		worldview: 'Weltanschauung',
		choose: 'Aus der Tabelle …',
		fromTable: (label: string) => `${label} aus der Tabelle`,
		rollW10: (sides: number) => `W${sides}`,
		people: 'Wichtige Personen',
		personName: (i: number) => `Name der Person ${i + 1}`,
		relation: 'Wer ist das für dich?',
		reason: 'Warum ist sie wichtig?',
		addPerson: 'Person hinzufügen',
		removePerson: 'Entfernen',
		more: 'Orte, Besitz, Wesen',
		places: 'Bedeutungsvoller Ort',
		possession: 'Wertvoller Besitz',
		traits: 'Wesenszüge',
		birthplace: 'Herkunftsort',
		residence: 'Wohnort',
		languages: 'Sprachen',
		writing: (script: string) => `kann lesen und schreiben (${script})`
	},
	live: {
		finish: 'Erstellung abschließen',
		finishHint: 'Alle Schritte sind gültig. Danach öffnet sich der lebende Bogen.',
		notYet: (steps: string) => `Zum Abschließen fehlen noch: ${steps}.`,
		open: 'Zum lebenden Bogen',
		editingFinished: 'Der Charakter ist abgeschlossen. Änderungen an der Erstellung wirken sofort.',
		editCreation: 'Erstellung ansehen und ändern',
		toCreation: 'Zur Erstellung',
		notFinished: 'Dieser Charakter ist noch nicht abgeschlossen.',
		ruleDataChanged:
			'Die Regeldaten der App wurden aktualisiert und dieser Charakter ist dadurch nicht mehr gültig. Prüfe die markierten Schritte.',
		years: (n: number) => `${n} Jahre`,
		tp: 'Trefferpunkte',
		stability: 'Stabilität',
		mp: 'Magiepunkte',
		luck: 'Glück',
		setValue: (label: string) => `${label} setzen`,
		tapToSet: 'Antippen, um den Wert direkt zu setzen',
		minus: (label: string) => `${label} −1`,
		plus: (label: string) => `${label} +1`,
		damage: 'Schaden',
		applyDamage: 'Schaden nehmen',
		threshold: (n: number) => `Wundschwelle ${n}: mehr Schaden auf einen Schlag gibt eine Wunde, die Hälfte der TP zwei.`,
		hintWound: (n: number) =>
			n === 1
				? 'Eine Wunde! Probe auf KON, sonst fällt der Charakter zu Boden.'
				: `${n} Wunden! Probe auf KON, sonst fällt der Charakter zu Boden.`,
		hintDown: 'Keine TP mehr: kampfunfähig.',
		hintDead: 'Mehr Schaden als die maximalen TP auf einen Schlag: Der Charakter stirbt auf der Stelle.',
		pending: (n: number) =>
			`Kampfende: Würfle für ${n === 1 ? 'die Wunde' : `die ${n} Wunden`} je 1W6 Wundenmalus auf die maximalen TP.`,
		woundMalus: (n: number) => `Wundenmalus insgesamt: −${n} auf die maximalen TP.`,
		conditions: 'Zustände',
		values: 'Werte',
		maxTpShort: 'TP max',
		maxStaShort: 'STA max',
		maxMpShort: 'MP max',
		override: (label: string) => `${label} von Hand setzen`,
		tapToOverride: 'Antippen, um den Wert von Hand zu setzen',
		resetOverride: 'Auf den berechneten Wert zurücksetzen',
		resetOverrideOf: (label: string) => `${label} zurücksetzen`,
		overrideHint:
			'Von Hand gesetzte Werte (golden) gehen dem berechneten Wert vor, etwa nach einer Entscheidung des Spielleiters.',
		skills: 'Wichtige Fertigkeiten',
		luckSection: 'Glück',
		luckReroll: 'Glück neu würfeln',
		heal: 'Wunden heilen',
		healPoints: 'Wundenpunkte',
		healApply: 'Heilen',
		firstAid: 'Erste Hilfe (−1, +1 TP)',
		healHint:
			'Erste Hilfe senkt den Wundenmalus um 1 und gibt 1 TP. Medizin: 1W4 (½: 2W4, ⅕: 3W4). Ruhephase: 1W4 bei bestandener KON-Probe, sonst 1.',
		currency: (units: string) => `Währung: ${units}`,
		unitAmount: (unit: string) => `Betrag in ${unit}`,
		preview: (amount: string) => `= ${amount}`,
		mindAndMagic: 'Stabilität, Magie und Ruhe',
		staLoss: 'Stabilitätsverlust',
		inCombat: 'im Kampf',
		apply: 'Abziehen',
		newConditions: (list: string) => `Neuer Zustand: ${list}.`,
		staStart: (start: number) => `Start-Stabilität ${start}: Unter der Hälfte (${start / 2}) droht schleichender Wahnsinn.`,
		mpCost: 'MP ausgeben',
		spend: 'Ausgeben',
		overdrawn: (lost: number, first: boolean) =>
			`MP überzogen: ${lost} TP Schaden${first ? '. Probe auf WIL, sonst Ohnmacht und der Zauber bricht ab' : ''}. Nach dem Kampf sinkt KON vorübergehend um jeden überzogenen Punkt.`,
		rest: 'Ruhe',
		pause: '1 Stunde Pause',
		restPhase: 'Ruhephase (4 Std.)',
		sleep: '8 Stunden Schlaf',
		rested: (kind: 'pause' | 'rest' | 'sleep') =>
			kind === 'sleep'
				? 'TP und MP aufgefüllt.'
				: kind === 'rest'
					? 'TP aufgefüllt, halbe MP regeneriert. Glück neu würfeln!'
					: 'TP aufgefüllt; der Wundenmalus bleibt.',
		meditation: 'Meditation',
		hours: 'Stunden',
		bonus: 'Bonus',
		meditated: 'MP durch Meditation regeneriert. Am Ende ist eine Stabilitätsprobe fällig.',
		fumble: 'Patzer (+1 Glück)',
		moneyAndGear: 'Geld, Inventar, Fähigkeiten',
		income: '+ Einnehmen',
		expense: '− Ausgeben',
		inventory: 'Inventar',
		armor: (rs: number) => `Rüstungsschutz angelegt: ${rs}`,
		equippedHint: 'Häkchen = angelegt bzw. getragen.',
		addItem: 'Gegenstand suchen oder eintragen',
		addFree: 'Eintragen',
		abilities: 'Begrenzte Fähigkeiten',
		periods: { day: 'einmal am Tag', rest: 'je Ruhephase', session: 'je Spielsitzung', permanent: 'bis zum Zurücksetzen' },
		used: (used: number, uses: number) => `${used} von ${uses} genutzt`,
		use: 'Nutzen',
		newDay: 'Neuer Tag'
	},
	lookup: {
		basicSpell: 'Basiszauber',
		tier: (tier: number) => `Stufe ${tier}`,
		romanTier: (tier: number) => `Stufe ${roman(tier)}`,
		stuntTier: (tier: number, name: string) => `Stufe ${tier} (${name})`,
		origin: (n: number) => `Besondere Herkunft ${n}`,
		melee: 'Nahkampf',
		ranged: 'Fernkampf',
		specializationNeeded: 'Spezialisierung notwendig',
		title: 'Nachschlagen',
		nav: 'Nachschlagen',
		search: 'Suchen, z. B. „Aura“ oder „Langbogen“',
		area: 'Bereich',
		all: 'Alles',
		areas: {
			spell: 'Zauber',
			stunt: 'Kunststücke',
			technique: 'Kampftechniken',
			style: 'Kampfstile',
			characteristic: 'Charakteristiken',
			origin: 'Herkünfte',
			trait: 'Spezies-Eigenschaften',
			religion: 'Religionen',
			skill: 'Fertigkeiten',
			equipment: 'Ausrüstung',
			condition: 'Zustände'
		},
		hint: 'Gib einen Suchbegriff ein oder wähle einen Bereich.',
		none: 'Nichts gefunden.',
		count: (n: number, limit: number) => (n > limit ? `${n} Treffer, die ersten ${limit} werden gezeigt.` : `${n} Treffer`),
		source: (file: string, section?: string) => `Quelle: Regelwerk/${file}${section ? ` – ${section}` : ''}`
	},
	specials: {
		title: 'Besonderheiten',
		traits: 'Spezies',
		religion: 'Religion',
		characteristic: 'Charakteristik',
		origin: 'Besondere Herkunft',
		stunts: 'Kunststücke',
		techniques: 'Kampftechniken',
		style: 'Kampfstil',
		spells: 'Zauber'
	},
	list: {
		export: 'Exportieren',
		duplicate: 'Duplizieren',
		delete: 'Löschen',
		import: 'Importieren …',
		confirmDelete: (name: string) => `„${name}“ wirklich löschen? Das lässt sich nicht rückgängig machen.`,
		imported: (name: string) => `„${name}“ wurde importiert.`,
		ruleDataChanged: 'Neue Regeln: bitte prüfen'
	},
	print: {
		back: 'Zurück zum Bogen',
		print: 'Drucken / als PDF speichern',
		open: 'Druckbogen',
		profession: 'Profession',
		attributes: 'Grundattribute',
		values: 'Werte',
		woundThreshold: 'Wundschwelle',
		staStart: 'STA beim Start',
		dodge: 'Ausweichen',
		woundMalus: 'Wundenmalus',
		skills: 'Fertigkeiten',
		professionMarked: 'Fett: Professionsfertigkeiten bzw. gesetzte Heldenfertigkeiten.',
		heroSkills: 'Heldenfertigkeiten',
		specials: 'Besonderheiten',
		basic: 'Basiszauber',
		equipment: 'Ausrüstung',
		writing: 'mit Schrift'
	},
	religion: {
		intro: 'Die Religion prägt Erziehung und Weltbild deines Charakters. Jeder Kult gewährt einen Segen.',
		choose: 'Religion'
	},
	dice: {
		roll: (count: number, sides: number) => `${count}W${sides} würfeln`,
		enter: 'Eintragen',
		overwrite: 'Überschreiben',
		reset: 'Wurf zurücksetzen',
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
