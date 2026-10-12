# Regelfragen

Diese Fragen sind beim Bau der Charakter-App aufgefallen. Die App soll im normalen Ablauf nur gültige Charaktere erzeugen, deshalb braucht jede dieser Stellen eine verbindliche Antwort. Pfade beziehen sich auf `Regelwerk/`.

**Vorrangregel bei Widersprüchen im Regelwerk:** Neuere Commits gehen älteren vor, und Commits von Inkspill (Autor) gehen Commits von AnyoChili vor.

Legende:
- [x] entschieden
- [ ] offen oder nur vorläufig entschieden

## Fehlende Regeln

- [ ] **R1 – Professionsliste.** `Fertigkeiten.md` verweist auf eine „Liste der Professionen“. In der Git-Historie dieses Repos gab es zu keinem Zeitpunkt eine Datei `Professionen.md`.
  → *Vorläufig:* Jeder Spieler baut seine Profession selbst und gibt ihr einen Namen. Er wählt 8 Professionsfertigkeiten und 5 Heldenfertigkeiten, der Statusmodifikator wird per W6 bestimmt.
- [ ] **R2 – Point-Buy.** → Vorerst nicht enthalten, kommt später.
- [x] **R3 – Rundung.** → Es wird immer abgerundet.
- [x] **R4 – Obergrenzen.** → Es gibt keine Obergrenze. Bringt ein Bonus einen Wert über 20, bleibt er dort.
- [x] **R5 – Würfel der Besonderen Herkunft.** → Kein Wurf. Die Besondere Herkunft wird frei gewählt, solange die optionale Regel aktiv ist. Ein Würfel kommt vielleicht später.
- [ ] **R6 – Tragkraft.** → Bleibt vorerst außen vor.

## Widersprüche

- [x] **W1 – Zwei Alterssysteme.** → Es gilt `Alter.md` bzw. `Spezies_&_Alter.md`, nicht der Alters-Abschnitt in `Charaktererstellung.md`. Die Überarbeitung von AnyoChili war mit dem Autor abgestimmt.
- [x] **W2 – Jugend der Elfen.** → Die Tabelle geht dem Text vor: Elfen sind unter 80 jugendlich.
- [x] **W3 – Malus für junge Charaktere.** → Intuition ist korrekt. Der Malus wird frei auf die betroffenen Attribute verteilt.
- [x] **W4 – Reihenfolge der Erstellung.** → Die App legt eine praktische Reihenfolge fest. Im Zweifel kommt das Alter später.
- [x] **W5 – Kunststücke.** → Jeder Charakter bekommt ein Kunststück. Wird mit der optionalen Besonderen Herkunft gespielt, darf ein Spieler statt einer Besonderen Herkunft ein zweites wählen.
- [ ] **W6 – Zauber-Freischaltung.** → Muss in den Regeldaten anpassbar sein. *Vorläufig* gilt die Tabelle aus `Charaktererstellung.md`, weil die neuere in `Magie_erlernen.md` verdreht wirkt (16 Punkte: Stufe III, 18 Punkte: Stufe II). Bestätigung durch den Autor steht aus.
- [x] **W7 – Kampfstil.** → Ab 18 Punkten.
- [x] **W8 – Steigerung vs. Formeln.** → `Sekundärattribute.md` ist aktueller und gilt.
- [x] **W9 – Besitztümer.** → Es gilt die Formel. Die Spannen sind nur grobe Werte.
- [ ] **W10 – Wundschwelle.** `Charaktererstellung.md` und `Spielsystem/Trefferpunkte.md` sagen TP/5, `Sekundärattribute.md` und `Kampfregeln/Trefferpunkte.md` sagen TP/4. → **Entschieden (Nutzer):** TP/5 (neuere Änderung des Autors). Bestätigung durch den Autor steht aus.

## Unklare Formulierungen

- [x] **U1 – Persönliche Interessen.** → Der Spieler wählt KLU oder INT frei. Vorausgewählt ist der höhere Wert.
- [x] **U2 – Heldenfertigkeiten 14/12/10/8/8.** → Die Werte werden *gesetzt*, nicht addiert. Liegt der Startwert schon höher, darf trotzdem gesetzt werden, die App warnt aber vor der Verringerung.
- [x] **U3 – Charakteristik.** → Eine der beiden gewürfelten Charakteristiken darf neu gewürfelt werden. Doppelte Ergebnisse werden neu gewürfelt. Am Tisch gewürfelte Ergebnisse wählt der Spieler je Platz direkt aus einer Liste.
- [x] **U4 – Begriffe.** →
  - Willenskraft
  - Stabilität (STA)
  - Überzeugen
  - Wissenschaften, weil die Fertigkeit mehrfach gewählt werden kann
  - Reifewurf und Verbesserungswurf sind zwei verschiedene Würfe.
- [x] **U5 – Fertigkeiten außerhalb der Liste.** →
  - Verborgenes Entdecken = Sondieren
  - Einschüchtern = Autorität
  - Vorstellen = Vorstellungskraft (wahrscheinlich)
  - Steuern = Fahrzeug steuern oder Steuern (Boot), je nach Zusammenhang
- [x] **U6 – Kampftechniken.** → Gemeint ist „weitere Technik“.
- [ ] **U7 – Stupor Mundi.** Laut `Spezies_&_Alter.md` darf ein Mensch „in der Reflexionsphase einen zusätzlichen **Reifewurf**“ durchführen. Laut `Spezies.md` ist es ein zusätzlicher **Verbesserungswurf**. Reifewurf und Verbesserungswurf sind aber verschiedene Würfe (U4). Welcher ist gemeint? Betrifft erst Version 2 (Reflexionsphase).
- [ ] **U8 – Blut der Alten Welt: höchstes Attribut.** Zählt das höchste Attribut vor oder nach den Modifikatoren der Spezies? Und wer entscheidet bei Gleichstand? → *Vorläufig:* nach den Modifikatoren der Spezies; bei Gleichstand wählt der Spieler.
- [ ] **U9 – Reifewürfe alter Charaktere.** Ein Erwachsener erhält 1 Reifewurf, pro Alterungsstufe kommen „alle Reife-Boni“ dazu. Bekommt ein Charakter mit Alterungsstufen den Reifewurf des Erwachsenen zusätzlich? → *Vorläufig:* ja, also 1 + Reifewürfe je Alterungsstufe. **Entschieden (Nutzer):** Ein Mensch hat insgesamt höchstens 10 Reifewürfe (`maxMaturityRolls` in den Spezies-Daten).
- [ ] **U10 – Bewegungsabzug im Alter.** `Sekundärattribute.md` zieht „in den 50ern“ bis „in den 90ern“ 1 bis 5 Punkte Bewegung ab. Gilt das nach Lebensjahren für alle Spezies, also auch für einen 120-jährigen Elfen, der noch gar nicht altert? → *Vorläufig:* ja, nach Lebensjahren für alle Spezies, wie geschrieben.
- [x] **U11 – Eherner Wille: „keine Charakteristik“.** `Spezies.md`: „Alternativ kann ein Spieler sich dazu entscheiden, keine Charakteristik zu wählen. Dafür erhöht er seine Stabilität um 10 Punkte.“ Wörtlich heißt das: gar keine Charakteristik. → **Entschieden (Nutzer, weicht vom Wortlaut ab):** Der Zwerg verzichtet nur auf die *zusätzliche* Charakteristik; die normalen Charakteristiken bleiben erlaubt.

## Unvollständiger Text

- [ ] **T1 – Herkunft.** Talisman und Foliant brechen ab, „Erde“ heißt ebenfalls „Sturmmark“, Biestmensch ist nur skizziert. → Vorerst übersprungen. Die App zeigt den Text so, wie er im Regelwerk steht.
- [ ] **T3 – Stufe von „Auren verbinden“.** In `Charaktererstellung/Zauber/Mystik.md` steht der Zauber unter „Stufe 2“, die Überschrift nennt aber „Stufe 3“. → *Vorläufig:* Stufe 3 laut Überschrift.
- [ ] **T2 – Kaputte Links.** → Wird später angegangen.

## Andere Fragen

- [ ] **V1 – Verkaufen.** Eine Regel zum Wiederverkauf fehlt. → **Entschieden (Nutzer):** Verkaufen bringt den vollen Preis, Verlieren nichts; Gefundenes kostet nichts. Bestätigung durch den Autor steht aus.

## Settings

- [ ] **F1 – Geld im Fallout-Setting.** Die Fallout-Listen rechnen in Kronkorken, eine Status- und Geldtabelle für Fallout gibt es aber nicht. → *Vorläufig:* Die Statustabelle aus `Ausstattung.md` gilt 1:1 in Kronkorken (die Preise liegen in derselben Größenordnung).
- [ ] **F2 – „Kreuzer“.** `Ausrüstung/Diverse_Preise.md` nennt Reisekosten in Kreuzern, eine Währung, die sonst nirgends definiert ist. Sind Pfennig gemeint?
