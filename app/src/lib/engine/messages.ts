// Texte, die der Regelkern in Hinweisen und Warnungen ausgibt, gesammelt an einer Stelle.
import { roman } from '$lib/format';
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
	tooMuchAtrophia: (distributed: number, required: number) =>
		`Es sind ${distributed} Atrophia-Punkte verteilt, vorgesehen sind ${required}.`,
	luckMissing: 'Würfle noch das Glück.',
	malusWrongAttribute: (attr: string) => `Der Altersmalus darf nur auf STR, KON oder INT verteilt werden, nicht auf ${attr}.`,
	tooMuchMalus: (distributed: number, required: number) =>
		`Es sind ${distributed} Malus-Punkte verteilt, vorgesehen sind ${required}.`,
	atrophiaNotPhysical: (attr: string) => `Atrophia trifft nur körperliche Attribute (STR, KON, GES, WAH), nicht ${attr}.`,
	belowMinimum: (attr: string, value: number, min: number) =>
		`${attr} fiele durch Altersmali auf ${value}. Kein Attribut darf dadurch unter ${min} sinken.`,
	professionSource: (name: string) => `Profession: ${name || 'ohne Namen'}`,
	heroSkillSource: 'Heldenfertigkeit',
	professionSkillMissing: (key: string) =>
		`Die Professionsfertigkeit ${key.replace(':', ': ')} gibt es nicht mehr (z. B. weil die Spezialisierung entfernt wurde). Wähle eine andere.`,
	heroSkillLowered: (name: string, start: number, value: number) =>
		`${name}: Der Startwert ${start} sinkt durch das Setzen auf ${value}. Das ist erlaubt, aber vermutlich nicht gewollt.`,
	interestsSource: 'Persönliche Interessen',
	tooManyInterestPoints: (spent: number, total: number) =>
		`Es sind ${spent} Punkte für Persönliche Interessen verteilt, zur Verfügung stehen ${total}. Nimm ${spent - total} Punkte zurück.`,
	skillChoiceInvalid: (trait: string, key: string, heroAllowed: boolean) =>
		`${trait}: ${key.replace(':', ': ')} ist hier nicht wählbar` +
		(heroAllowed
			? ' (die Spezialisierung wurde entfernt).'
			: ' (keine Kampf- oder Magiefertigkeit; Spezialisierungen müssen angelegt sein).') +
		' Wähle eine andere Fertigkeit.',
	characteristicDuplicateRoll: (name: string) => `${name} wurde doppelt gewürfelt. Würfle diesen Platz neu.`,
	characteristicDuplicatePick: (name: string) => `${name} ist zweimal eingetragen. Jede Charakteristik zählt nur einmal.`,
	percentSource: (percent: number) => `+${percent} %`,
	tooManyStunts: (chosen: number, allowed: number) => `Es sind ${chosen} Kunststücke gewählt, erlaubt sind ${allowed}.`,
	noStuntAvailable: 'Für kein weiteres Kunststück sind die Voraussetzungen erfüllt. Der Schritt gilt trotzdem als erledigt.',
	stuntUnmet: (name: string, unmet: string[]) => `${name}: Voraussetzungen nicht erfüllt (${unmet.join(', ')}).`,
	techniquesExceeded: (skill: string, chosen: number, allowed: number, maxTier: number) =>
		`${skill}: ${chosen} Kampftechniken gewählt, erlaubt sind ${allowed}${maxTier ? ` bis Stufe ${roman(maxTier)}` : ''}. Entferne Techniken oder steigere die Fertigkeit.`,
	styleNotUnlocked: (style: string, from: number) =>
		`${style}: Ein Kampfstil verlangt ${from} Punkte in einer passenden Kampffertigkeit (Nah- bzw. Fernkampf).`,
	spellsExceeded: (discipline: string, total: number) =>
		`${discipline}: Die gewählten Zauber überschreiten das Kontingent (${total} Zauber, Stufen und Höchstzahlen laut Tabelle). Entferne Zauber oder steigere die Fertigkeit.`,
	overspent: 'Die Ausrüstung kostet mehr, als im Geldbeutel ist. Das ist erlaubt, wenn der Spielleiter zustimmt.',
	fileNotJson: 'Die Datei ist keine gültige Charakterdatei (kein JSON).',
	fileNotCharacter: 'Die Datei enthält keinen Charakter dieser App.',
	fileTooNew: (version: number, supported: number) =>
		`Die Datei stammt aus einer neueren Version der App (Format ${version}, unterstützt bis ${supported}). Bitte die App aktualisieren.`,
	copyName: (name: string) => `${name || 'Unbenannt'} (Kopie)`,
	tooManyProfessionSkills: (n: number, max: number) =>
		`Es sind ${n} Professionsfertigkeiten gewählt, erlaubt sind ${max}. Entferne ${n - max}.`,
	characteristicForbidden: 'Durch „Eherner Wille“ (keine Charakteristik) darf keine Charakteristik gewählt werden.'
};
