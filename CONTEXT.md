# Sinners and Saints – Charakter-App

Eine App, mit der Spieler Charaktere für das Pen-and-Paper-Regelwerk „Sinners and Saints“ erstellen und am Spieltisch weiterführen. Sichtbare Begriffe sind Deutsch. Der englische Code-Name steht jeweils in Klammern. Spielbegriffe ohne gute Übersetzung behalten im Code ihren deutschen Namen.

## Language

### Regelwerk und App

**Regelwerk** (`rulebook`):
Die Markdown-Texte unter `Regelwerk/`, gepflegt vom Autor. Sie sind die maßgebliche Quelle aller Regeln.
_Avoid_: Regeln, Rulebook-Dateien

**Regeldaten** (`ruleData`):
Die strukturierte, von Hand gepflegte Abbildung des Regelwerks, die die App liest. Jeder Eintrag verweist auf seine Stelle im Regelwerk.
_Avoid_: Datenbank, Database

**Optionale Regel** (`optionalRule`):
Eine Regel, die laut Regelwerk nicht verpflichtend ist, etwa die Besondere Herkunft oder die Charakteristik. Der Spieler schaltet sie pro Charakter jederzeit ein oder aus.
_Avoid_: Hausregel, Variante

**Setting** (`setting`):
Eine vom Autor ausgearbeitete Variante der Spielwelt mit eigenen Inhalten, etwa „Fallout“ mit eigenen Ausrüstungslisten und Pferderegeln. Alle Settings sind zunächst sichtbar.
_Avoid_: Variante, Modul, Kampagne

**Katalog** (`catalog`):
Die Auswahlliste der Regeldaten, aus der ein Charakter Ausrüstung, Zauber, Kunststücke usw. übernimmt. Ein Eintrag kann einem Setting zugeordnet sein. Neben dem Katalog sind freie Einträge immer möglich.
_Avoid_: Shop, Datenbank

**Offene Regelfrage**:
Eine Lücke oder ein Widerspruch im Regelwerk, die der Autor klären muss. Sie wird in `docs/offene-regelfragen.md` gesammelt.
_Avoid_: Bug, Fehler

### Charakter

**Charakter** (`Character`):
Eine Spielfigur samt allen Entscheidungen, Würfen und aktuellen Werten.
_Avoid_: Held, Char, Figur

**Charaktererstellung** (`creation`):
Der geführte Ablauf, an dessen Ende ein regelkonformer Charakter steht.
_Avoid_: Wizard, Generator

**Lebender Bogen** (`liveSheet`):
Die Ansicht eines fertigen Charakters im Spiel, in der sich wechselnde Werte wie TP, Stabilität, MP, Glück und Geld fortschreiben lassen. Die App rechnet Regelfolgen wie Wundschwelle oder Regeneration vor, jeder Wert bleibt aber von Hand änderbar.
_Avoid_: Digitaler Bogen, Tracker

**Charakterbogen** (`sheet`):
Die druckbare Darstellung eines Charakters.
_Avoid_: Export, PDF

**Wurf** (`roll`):
Ein Würfelergebnis, das in den Charakter eingeht. Gespeichert werden der Würfelwert und die Angabe, ob die App gewürfelt oder der Spieler ein echtes Ergebnis eingetragen hat. Ob eine Probe gelungen ist, wird daraus jeweils neu bewertet.
_Avoid_: Random, Zufallswert

### Werte

**Grundattribut** (`PrimaryAttribute`):
Einer der acht Grundwerte STR, KON, GES, WAH, KLU, INT, CHA, WIL.
_Avoid_: Attribut (ohne Zusatz), Stat

**Sekundärattribut** (`SecondaryAttribute`):
Ein aus den Grundattributen abgeleiteter Wert, etwa TP, Stabilität, Magiepunkte, Glück, Bewegung, Ausweichen, Schadensbonus oder Wundschwelle.
_Avoid_: Abgeleiteter Wert

**Fertigkeit** (`Skill`):
Ein Wert für eine erlernbare Tätigkeit. Ihr Startwert ergibt sich aus einem Bruchteil eines Grundattributs.
_Avoid_: Talent, Skill (in sichtbaren Texten)

**Heldenfertigkeit** (`HeroSkill`):
Eine Fertigkeit für Kampf oder Magie. Bei der Erstellung bekommt der Charakter fünf davon mit festen Werten.
_Avoid_: Kampffertigkeit (als Oberbegriff)

**Profession** (`Profession`):
Die gesellschaftliche Rolle eines Charakters, die der Spieler selbst zusammenstellt und benennt. Sie legt acht Professionsfertigkeiten, fünf Heldenfertigkeiten und einen Statusmodifikator fest.
_Avoid_: Beruf, Klasse

**Stabilität (STA)** (`stability`):
Das Sekundärattribut für die geistige Belastbarkeit eines Charakters.
_Avoid_: SAN, Sanity, geistige Gesundheit

**Willenskraft (WIL)** (`willpower`):
Das Grundattribut für Selbstbeherrschung und magische Kraft.
_Avoid_: Willensstärke

### Herkunft

**Spezies** (`Species`):
Das Volk eines Charakters (Mensch, Zwerg, Elf). Es bestimmt Attributsmodifikatoren, Altersstufen und besondere Eigenschaften.
_Avoid_: Rasse, Volk

**Besondere Herkunft** (`origin`):
Eine optionale Abstammung zusätzlich zur Spezies. Sie bringt Fähigkeiten und Attributsmali.
_Avoid_: Herkunft (ohne Zusatz, kollidiert mit dem Wohnort aus der Vorgeschichte)

### Steigerung

**Reifewurf** (`Reifewurf`):
Ein W20-Wurf gegen INT oder KLU bei der Erstellung, der vom Alter abhängt. Liegt der Wurf über dem Wert, steigt der Wert um 1.
_Avoid_: Verbesserungswurf (ist ein anderer Wurf)

**Verbesserungswurf** (`Verbesserungswurf`):
Ein W20-Wurf auf eine Fertigkeit in der Reflexionsphase. Liegt der Wurf über dem Wert, steigt die Fertigkeit um 1.
_Avoid_: Reifewurf (ist ein anderer Wurf)

**Reflexionsphase**:
Die Phase nach einem Abenteuer, in der ein Charakter gesteigert wird. Ein XP-System gibt es nicht.
_Avoid_: Levelup, Erfahrungspunkte
