# Sinners and Saints – Fragen zum Regelwerk

Stand: 12.10.2026

Beim Bau der Charakter-App sind uns Stellen im Regelwerk aufgefallen, die sich widersprechen, unklar formuliert sind, unvollständig sind oder ganz fehlen. Die App braucht an jeder dieser Stellen eine feste Antwort. Darum haben wir für jede eine Annahme getroffen und eingebaut.

Diese Liste zeigt dir für jede Stelle:

- **Was im Regelwerk steht** (Pfade relativ zu `Regelwerk/`)
- **Wie die App es gerade macht** (unsere Annahme)
- **Was wir von dir brauchen**

Die Kennungen (R1, W6, U9 …) sind dieselben wie in `docs/offene-regelfragen.md`. Dort pflegen wir den laufenden Stand.

Bei Widersprüchen zwischen Dateien sind wir nach dieser Regel vorgegangen: Neuere Commits gehen älteren vor, deine Commits gehen denen von AnyoChili vor. Ausnahme: `Alter.md` und `Spezies_&_Alter.md` von AnyoChili waren mit dir abgestimmt und gelten.

**Was wir von dir brauchen:**

| Zeichen | Bedeutung |
|---|---|
| ❓ | Bitte entscheiden. Wir haben nur eine vorläufige Annahme. |
| ✅ | Jonathan hat entschieden, die App macht es so. Bitte kurz bestätigen oder widersprechen. |
| 🛠️ | Text im Regelwerk fehlt oder ist kaputt. Bitte ergänzen, wenn du Zeit hast. |

---

## Kurzfassung: die wichtigsten offenen Punkte

1. **W10 – Wundschwelle TP/4 oder TP/5?** Vier Dateien, zwei verschiedene Werte.
2. **W6 – Zauber-Freischaltung:** Die Tabelle in `Magie_erlernen.md` wirkt bei 16 und 18 Punkten vertauscht.
3. **R1 – Professionsliste:** Sie wird erwähnt, existiert aber nicht.
4. **U11 – Eherner Wille:** Jonathans Auslegung weicht vom Wortlaut ab.
5. **U9 – Reifewürfe alter Charaktere:** Zählt der Wurf des Erwachsenen zusätzlich? Gilt die Höchstzahl 10 beim Menschen?
6. **F1 – Geld im Fallout-Setting:** Es gibt keine eigene Tabelle.

---

## 1. Ungereimtheiten: Dateien widersprechen sich

### W10 – Wundschwelle ❓
- **Im Regelwerk:**

  | Datei | Wundschwelle |
  |---|---|
  | `Charaktererstellung/Charaktererstellung.md` | „Die Wundschwelle beträgt ein Fünftel der maximalen TP. TP/5 = Wundschwelle“ |
  | `Spielsystem/Trefferpunkte.md` | „mehr als **ein Fünftel der maximalen Trefferpunkte**“ |
  | `Charaktererstellung/Sekundärattribute.md` | „ein Viertel der maximalen TP. TP/4 = Wundschwelle“ |
  | `Kampfregeln/Trefferpunkte.md` | „mehr als ein Viertel der maximalen Trefferpunkte“ |

- **App:** **TP/5** (Jonathans Entscheidung). Du hast die Fünftel zuletzt geändert. Insgesamt ersetzen Fünftel jetzt die Viertel, z. B. auch bei den MP und den Startwerten der Fertigkeiten.
- **Frage:** Gilt TP/5? Dann müssten `Sekundärattribute.md` und `Kampfregeln/Trefferpunkte.md` angepasst werden. Nebenbei: `Kampfregeln/Trefferpunkte.md` und `Spielsystem/Trefferpunkte.md` sind fast Doppelungen. Ist eine davon veraltet?

### W6 – Zauber-Freischaltung ❓
- **Im Regelwerk:** Zwei Tabellen weichen bei 16 und 18 Punkten voneinander ab:

  | Fertigkeitswert | `Charaktererstellung.md` (älter) | `Magieregeln/Magie_erlernen.md` (neuer) |
  |---|---|---|
  | 16 | 6 Zauber, davon max. **drei der Stufe II** | 6 Zauber, davon max. **ein Zauber der Stufe III** |
  | 18 | 7 Zauber, davon max. **ein Zauber der Stufe III** | 7 Zauber, davon max. **zwei der Stufe II** |
  | 20 | 8 Zauber, davon max. drei der Stufe III | gleich |

  In der neueren Tabelle kommt Stufe III vor Stufe II. Das wirkt vertauscht.
- **App:** **vorläufig die ältere Tabelle** aus `Charaktererstellung.md`. Die Tabelle steht in den Regeldaten und lässt sich ohne Programmierung ändern.
- **Frage:** Welche Tabelle stimmt? Bitte ggf. `Magie_erlernen.md` korrigieren.

### W1 – Zwei Alterssysteme ✅
- **Im Regelwerk:** Der Alters-Abschnitt in `Charaktererstellung.md` (Zwerge ab 60, Elfen alle 20 Jahre ab 80 usw.) widerspricht `Alter.md` und `Spezies_&_Alter.md`.
- **App:** `Alter.md` und `Spezies_&_Alter.md` gelten. Diese Überarbeitung von AnyoChili war mit dir abgestimmt.
- **Bitte:** Den alten Abschnitt in `Charaktererstellung.md` entfernen oder angleichen.

### W2 – Jugend der Elfen ✅
- **Im Regelwerk:** Tabelle und Fließtext geben unterschiedliche Altersgrenzen an.
- **App:** Die Tabelle gilt: Elfen sind unter 80 jugendlich.

### W3 – Malus für junge Charaktere ✅
- **Im Regelwerk:** Unterschiedliche Angaben, welche Attribute der Malus trifft.
- **App:** STR, KON und **INT** (Intuition ist korrekt). Der Spieler verteilt die Malus-Punkte frei auf diese Attribute. Kein Attribut darf dadurch unter 5 fallen.

### W4 – Reihenfolge der Erstellung ✅
- **App:** Die App legt eine praktische Reihenfolge fest: Optionen, Grundattribute, Spezies, Alter, Religion, Charakteristik, Profession, Interessen, Kunststücke, Kampf, Zauber, Ausstattung, Vorgeschichte. Jeder Schritt lässt sich jederzeit wieder ändern.

### W5 – Anzahl der Kunststücke ✅
- **App:** Jeder Charakter bekommt **ein** Kunststück. Mit der optionalen Regel „Besondere Herkunft“ darf man statt einer Herkunft ein **zweites** Kunststück wählen.
- **Ergänzung:** Erfüllt ein Charakter für kein (weiteres) Kunststück die Voraussetzungen, gilt der Schritt trotzdem als erledigt. Die App weist darauf hin.

### W7 – Kampfstil ✅
- **App:** Ein Kampfstil ist ab einem Wert von **18** in einer Nah- bzw. Fernkampffertigkeit wählbar.

### W8 – Steigerung oder Formeln ✅
- **App:** `Sekundärattribute.md` ist aktueller und gilt für die Formeln. Ausnahme ist die Wundschwelle, siehe W10.

### W9 – Besitztümer ✅
- **Im Regelwerk:** Es gibt eine Formel und daneben grobe Spannen.
- **App:** Es gilt die Formel (Status × Faktor der Statusstufe). Die Spannen gelten nur als Richtwerte.

---

## 2. Unklarheiten: Formulierungen lassen mehrere Lesarten zu

### U11 – Eherner Wille: „keine Charakteristik“ ✅ (weicht vom Wortlaut ab)
- **Im Regelwerk** (`Charaktererstellung/Spezies.md`): „Alternativ kann ein Spieler sich dazu entscheiden, **keine Charakteristik zu wählen**. Dafür erhöht er seine Stabilität um 10 Punkte.“ Wörtlich heißt das: gar keine Charakteristik.
- **App** (Jonathans Entscheidung): Der Zwerg verzichtet nur auf die **zusätzliche** Charakteristik aus „Eherner Wille“. Die normalen Charakteristiken bleiben erlaubt.
- **Bitte:** Bestätigen oder widersprechen. Bei Zustimmung den Satz z. B. so ändern: „… sich dazu entscheiden, auf die zusätzliche Charakteristik zu verzichten.“

### U9 – Reifewürfe alter Charaktere ❓ / ✅
- **Im Regelwerk:** Ein Erwachsener erhält 1 Reifewurf. Je Alterungsstufe kommen „alle Reife-Boni“ hinzu.
- **App:**
  - **Vorläufig:** Ein gealterter Charakter bekommt den Reifewurf des Erwachsenen **plus** die Reifewürfe je Alterungsstufe.
  - **Entschieden (Jonathan):** Ein Mensch hat insgesamt **höchstens 10 Reifewürfe**.
- **Frage:** Stimmt beides so? Gibt es bei anderen Spezies auch eine Höchstzahl?

### U10 – Bewegungsabzug im Alter ❓
- **Im Regelwerk** (`Sekundärattribute.md`): „in den 50ern“ bis „in den 90ern“ sinkt die Bewegung um 1 bis 5.
- **App:**
  - **Vorläufig:** nach Lebensjahren, für **alle** Spezies. Ein 120-jähriger Elf, der noch gar nicht altert, bekommt also −5.
  - Über 99 Jahren bleibt es bei −5.
  - Ohne eingetragenes Alter gilt der Beginn der Altersstufe.
- **Frage:** Soll der Abzug bei langlebigen Spezies erst mit den Alterungsstufen greifen?

### U7 – Stupor Mundi ❓ (betrifft erst Version 2)
- **Im Regelwerk:** Laut `Spezies_&_Alter.md` darf ein Mensch in der Reflexionsphase einen zusätzlichen **Reifewurf** machen. Laut `Spezies.md` ist es ein zusätzlicher **Verbesserungswurf**.
- **Frage:** Welcher Wurf ist gemeint? Wir behandeln Reifewurf und Verbesserungswurf als zwei verschiedene Würfe.

### U8 – Blut der Alten Welt: höchstes Attribut ❓
- **Frage 1:** Zählt das höchste Attribut **vor oder nach** den Spezies-Modifikatoren?
- **Frage 2:** Wer entscheidet bei Gleichstand?
- **App, vorläufig:** nach den Modifikatoren. Bei Gleichstand wählt der Spieler.

### U1 – Persönliche Interessen ✅
- **App:** Die Punkte betragen 2 × KLU **oder** 2 × INT, frei wählbar. Vorausgewählt ist der höhere Wert.

### U2 – Heldenfertigkeiten 14/12/10/8/8 ✅
- **App:** Die Werte werden **gesetzt**, nicht addiert. Liegt der Startwert schon höher, darf man trotzdem setzen, die App warnt aber vor der Verringerung.

### U3 – Charakteristik ✅
- **App:**
  - Man wählt keine Charakteristik, eine freie oder würfelt bis zu zwei.
  - **Eine** der gewürfelten darf einmal neu gewürfelt werden.
  - Würfelt die App ein doppeltes Ergebnis, würfelt sie neu.
  - Am Tisch gewürfelte Ergebnisse wählt der Spieler direkt aus einer Liste.

### U4 – Begriffe ✅
- **App:** Wir verwenden einheitlich:
  - Willenskraft
  - Stabilität (STA)
  - Überzeugen
  - Wissenschaften (mehrfach wählbar, je Spezialisierung)
- Reifewurf und Verbesserungswurf sind zwei verschiedene Würfe.

### U5 – Fertigkeiten, die es so nicht gibt ✅
- **App:** Einige Texte nennen Fertigkeiten, die nicht in der Liste stehen. Wir ordnen sie so zu:

  | Im Text | In der App |
  |---|---|
  | Verborgenes Entdecken | Sondieren |
  | Einschüchtern | Autorität |
  | Vorstellen | Vorstellungskraft (wahrscheinlich) |
  | Steuern | Fahrzeug steuern oder Steuern (Boot), je nach Zusammenhang |

- **Bitte:** Die Begriffe im Regelwerk vereinheitlichen.

### U6 – Kampftechniken ✅
- **App:** Wir lesen die Stelle als „weitere Technik“.

---

## 3. Ungenauigkeiten: Text unvollständig oder fehlerhaft

### T1 – Besondere Herkunft unvollständig 🛠️
- **Im Regelwerk** (`Charaktererstellung/Herkunft.md`):
  - Die Texte zu Talisman und Foliant brechen ab.
  - „Erde“ heißt ebenfalls „Sturmmark“.
  - Biestmensch ist nur skizziert.
- **App:** Sie zeigt den Text so, wie er dasteht.

### T3 – Stufe von „Auren verbinden“ ❓
- **Im Regelwerk** (`Charaktererstellung/Zauber/Mystik.md`): Der Zauber steht im Abschnitt „Stufe 2“, seine eigene Überschrift nennt „Stufe 3“.
- **App, vorläufig:** Stufe 3 laut Überschrift.

### T2 – Kaputte Links 🛠️
- Mehrere interne Links im Regelwerk führen ins Leere. Das gehen wir später gesammelt an.

### F2 – „Kreuzer“ ❓
- **Im Regelwerk** (`Ausrüstung/Diverse_Preise.md`): Reisekosten stehen in **Kreuzern**. Diese Währung ist sonst nirgends definiert. Im Standard-Setting gibt es Gulden, Kronen und Pfennig.
- **Frage:** Sind Pfennig gemeint?

---

## 4. Fehlende Regeln und andere Fragen

### R1 – Liste der Professionen ❓
- **Im Regelwerk:** `Fertigkeiten.md` verweist auf eine „Liste der Professionen“. Eine solche Datei gab es in der Git-Historie nie.
- **App, vorläufig:**
  - Jeder Spieler baut seine Profession selbst und benennt sie.
  - Er wählt 8 Professionsfertigkeiten (je +5) und verteilt 5 Heldenfertigkeiten (14/12/10/8/8).
  - Der Statusmodifikator wird per W6 bestimmt.
- **Frage:** Kommt eine Liste? Sobald es sie gibt, lässt sie sich als Auswahl einbauen.

### F1 – Geld im Fallout-Setting ❓
- **Im Regelwerk:** Die Fallout-Preislisten rechnen in Kronkorken. Eine Status- und Geldtabelle für Fallout gibt es nicht.
- **App, vorläufig:** Die Statustabelle aus `Ausstattung.md` gilt 1:1 in Kronkorken.
- **Folgeproblem:** „Mittellos“ (15 Pfennig) ergibt umgerechnet 0 Kronkorken Geldbeutel und 0 Tagesgeld.
- **Frage:** Gibt es eine eigene Fallout-Tabelle oder einen Umrechnungskurs?

### V1 – Verkaufen von Ausrüstung ✅ (keine Regel gefunden)
- **Im Regelwerk:** Wir haben keine Regel zum Wiederverkauf gefunden.
- **App** (Jonathans Entscheidung):
  - Verkaufen bringt den **vollen Preis** zurück. Verlieren bringt nichts.
  - Gefundenes kostet nichts, bringt beim Verkauf aber den vollen Preis.
- **Frage:** Soll es stattdessen einen Abschlag geben, z. B. die Hälfte?

### R2 – Point-Buy für Grundattribute ❓
- **App:** Point-Buy ist noch nicht enthalten. Es kommt, sobald es eine Regel dafür gibt. Bis dahin gibt es nur „würfeln (4W6, drei höchste)“ und „festes Array“.

### R3 – Rundung ✅
- **App:** Es wird **immer abgerundet**, auch bei ½ und ⅕ der Fertigkeitswerte.

### R4 – Obergrenzen ✅
- **App:** Es gibt keine allgemeine Obergrenze. Bringt ein Bonus einen Wert über 20, bleibt er dort. Ausnahme sind ausdrückliche Grenzen wie „Stabilität höchstens 99“.

### R5 – Würfel der Besonderen Herkunft ✅
- **App:** Es wird nicht gewürfelt. Die Besondere Herkunft wird frei gewählt, solange die optionale Regel aktiv ist.

### R6 – Tragkraft
- **App:** Bleibt vorerst außen vor.

### Wunden heilen (zur Info)
- Die App setzt die Regeln aus `Spielsystem/Trefferpunkte.md` um:
  - Ein Treffer über der Wundschwelle gibt eine Wunde. Ab der Hälfte der TP auf einen Schlag gibt es zwei Wunden.
  - Wer mehr als die maximalen TP auf einen Schlag verliert, stirbt sofort.
  - Wer ohne Wunde auf 0 TP fällt, ist kampfunfähig und bekommt nach dem Kampf eine Wunde. Wer schon eine Wunde hat und auf 0 TP fällt, liegt im Sterben.
  - Am Kampfende gibt es je Wunde W6 Wundenmalus auf die maximalen TP.
- Der Malus sinkt durch Erste Hilfe (−1 und 1 TP), Medizin oder Regeneration in der Ruhephase. Die Würfe dafür macht der Spieler, die App zieht nur das Ergebnis ab.

---

## Für dich: die App über GitHub Pages erreichbar machen

Die App liegt im Ordner `app/`. Ein fertiger Workflow (`.github/workflows/pages.yml`) testet sie und veröffentlicht sie bei jedem Push auf `main` oder `charakter-app`. Danach ist sie hier erreichbar:

**https://inkspill-quatterpillard.github.io/Sinners-and-Saints-PnP/**

Dafür musst du einmalig zwei Dinge einstellen (nur mit Admin-Rechten am Repo möglich):

1. **Pages einschalten:** Repo auf GitHub → **Settings** → **Pages** → bei „Build and deployment“ unter **Source** „**GitHub Actions**“ wählen.
2. **Branch freigeben:** Settings → **Environments** → **github-pages** → bei „Deployment branches and tags“ den Branch **`charakter-app`** hinzufügen. Standardmäßig darf meist nur `main` veröffentlichen. Dieser Schritt entfällt, sobald `charakter-app` in `main` gemergt ist.

Danach unter **Actions** → „Charakter-App auf GitHub Pages“ → **Run workflow** (Branch `charakter-app`) starten, oder auf den nächsten Push warten.

Gut zu wissen:

- **Kosten:** Für öffentliche Repos sind Pages und Actions kostenlos.
- **Daten:**
  - Die App speichert Charaktere nur im Browser der jeweiligen Person. Es gibt keinen Server, kein Tracking und keine Cookies.
  - GitHub protokolliert als Hoster die IP-Adressen der Besucher.
  - Ein kurzer Datenschutzhinweis wäre sinnvoll, da du als Betreiber der Seite giltst.
- **Lizenzen:**
  - Die Hinweise zu den verwendeten Bibliotheken (MIT bzw. ISC) liefert die App unter „Lizenzen verwendeter Software“ mit.
  - Das Repo selbst hat keine LICENSE-Datei. Ob du eine Lizenz für Regelwerk und Code wählst, liegt bei dir.

### Lokal ausprobieren (optional)

Voraussetzung: Node.js 22.

```
cd app
npm ci
npm run dev          # Entwicklungsserver, http://localhost:5173
npm test             # Tests des Regelkerns
npm run check-rules  # prüft die Regeldaten gegen das Regelwerk
npm run build        # fertige App nach app/build
npm run preview      # fertige App ansehen, http://localhost:4173
```

Die Regeln der App (Tabellen, Werte, Texte) liegen als JSON-Dateien in `app/src/lib/ruleData/data/`. Wenn sich das Regelwerk ändert, werden dort die Werte angepasst. `npm run check-rules` zeigt an, wo Regeldaten und Regelwerk auseinanderlaufen.
