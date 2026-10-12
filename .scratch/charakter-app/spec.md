# Spec: Charakter-App für Sinners and Saints

Status: ready-for-agent

Begriffe wie in `CONTEXT.md`. Architektur siehe `docs/adr/0001` und `docs/adr/0002`. Regelentscheidungen siehe `docs/offene-regelfragen.md`.

## Problem Statement

Einen Charakter für „Sinners and Saints“ zu erstellen ist aufwendig:
- Die Regeln verteilen sich auf viele Markdown-Dateien.
- Viele Schritte hängen voneinander ab. Die Spezies bestimmt die Altersstufen, die Grundattribute bestimmen die Startwerte der Fertigkeiten, und die Fertigkeitswerte schalten Kunststücke, Kampftechniken und Zauber frei.
- Dazu kommen zahlreiche Würfe.

Wer einen Schritt nachträglich ändert, muss vieles von Hand nachrechnen und übersieht leicht etwas. Am Spieltisch wird weiter gerechnet: Schaden gegen die Wundschwelle, Regeneration von MP und Stabilität, Glück und Geld. Ein Papierbogen hilft dabei nicht.

Spieler, auch neue und auch solche außerhalb der eigenen Runde, haben keinen einfachen Weg, einen regelkonformen Charakter zu bauen und ihn im Spiel aktuell zu halten.

## Solution

Eine kostenlose, offline-fähige Web-App (PWA). Sie lässt sich aufs Handy installieren und läuft auch am PC.

- **Charaktererstellung:** Die App führt Schritt für Schritt durch die Erstellung. Pro Schritt bietet sie nur erlaubte Optionen an, rechnet alle abgeleiteten Werte selbst und würfelt auf Wunsch. Echte Würfe vom Tisch lassen sich eintragen.
- **Zurückgehen:** Man kann jederzeit zu einem früheren Schritt zurück. Die App berechnet dann alles neu und markiert Entscheidungen, die dadurch ungültig geworden sind.
- **Lebender Bogen:** Ein fertiger Charakter wird im Spiel weitergeführt. Die App rechnet Regelfolgen vor, zum Beispiel Schaden gegen die Wundschwelle oder Regeneration nach einer Ruhephase. Jeder Wert bleibt von Hand änderbar.
- **Speicherung:** Charaktere liegen dauerhaft auf dem Gerät und lassen sich als Datei exportieren und importieren.
- **Nachschlagen:** Item-, Zauber-, Kunststück- und Charakteristik-Texte stehen in der App.
- **Druckbogen:** Ein Charakterbogen lässt sich ausdrucken bzw. als PDF speichern.

## User Stories

### Charaktere verwalten

1. Als Spieler möchte ich die App über einen Link öffnen, ohne etwas zu installieren, damit ich sofort loslegen kann.
2. Als Spieler möchte ich die App auf meinem Handy zum Startbildschirm hinzufügen, damit sie sich wie eine normale App anfühlt.
3. Als Spieler möchte ich die App ohne Internetverbindung benutzen, damit sie am Spieltisch ohne WLAN funktioniert.
4. Als Spieler möchte ich eine Liste meiner Charaktere sehen, damit ich mehrere Charaktere parallel führen kann.
5. Als Spieler möchte ich einen neuen Charakter anlegen, damit ich mit der Erstellung beginnen kann.
6. Als Spieler möchte ich, dass ein angefangener Charakter automatisch gespeichert wird, damit ich die Erstellung unterbrechen und später fortsetzen kann.
7. Als Spieler möchte ich, dass meine Charaktere nach dem Schließen des Browsers erhalten bleiben, damit ich sie beim nächsten Spielabend wiederfinde.
8. Als Spieler möchte ich einen Charakter als Datei exportieren, damit ich ihn sichern oder auf ein anderes Gerät übertragen kann.
9. Als Spieler möchte ich eine Charakterdatei importieren, damit ich einen gesicherten oder geteilten Charakter weiterführen kann.
10. Als Spieler möchte ich einen Charakter duplizieren, damit ich Varianten ausprobieren kann, ohne das Original zu verändern.
11. Als Spieler möchte ich einen Charakter löschen, nachdem ich das bestätigt habe, damit meine Liste übersichtlich bleibt und nichts aus Versehen verloren geht.
12. Als Spieler möchte ich auf einen Blick sehen, ob ein Charakter noch in der Erstellung ist oder fertig, damit ich weiß, wo ich weitermachen muss.

### Erstellung allgemein

13. Als Spieler möchte ich jederzeit festlegen und ändern, mit welchen optionalen Regeln ich spiele (Besondere Herkunft, Charakteristik). Ein Umschalten bewertet den Charakter neu. So passt die Erstellung zu meiner Runde, auch wenn wir uns später umentscheiden.
14. Als Spieler möchte ich ein Setting wählen können, zum Beispiel das Standard-Setting oder Fallout, damit mir die passenden Kataloge angeboten werden.
15. Als Spieler möchte ich in einer festen, sinnvollen Reihenfolge durch die Erstellung geführt werden, damit ich nichts vergesse.
16. Als Spieler möchte ich jederzeit sehen, in welchem Schritt ich bin und welche Schritte noch offen sind, damit ich den Überblick behalte.
17. Als Spieler möchte ich jederzeit zu einem früheren Schritt zurückkehren und ihn ändern, damit ich mich umentscheiden kann.
18. Als Spieler möchte ich, dass nach einer Änderung alle abhängigen Werte automatisch neu berechnet werden, damit ich nichts nachrechnen muss.
19. Als Spieler möchte ich deutlich markiert sehen, welche späteren Entscheidungen durch meine Änderung ungültig geworden sind, damit ich gezielt nur diese neu treffe.
20. Als Spieler möchte ich, dass gültig gebliebene Entscheidungen bei einer Änderung erhalten bleiben, damit ich nicht von vorn anfangen muss.
21. Als Spieler möchte ich in jedem Schritt nur Optionen angeboten bekommen, die nach den Regeln erlaubt sind, damit ich keinen ungültigen Charakter baue.
22. Als Spieler möchte ich Warnungen sehen, wenn eine erlaubte Entscheidung ungewöhnlich ist, etwa ein Wert, der durch Setzen sinkt, damit ich sie bewusst treffe.
23. Als Spieler möchte ich jederzeit eine Zusammenfassung des aktuellen Charakters sehen, damit ich die Auswirkungen meiner Entscheidungen verstehe.
24. Als Spieler möchte ich, dass ein Charakter erst als fertig gilt, wenn alle Pflichtschritte gültig abgeschlossen sind, damit der lebende Bogen nur regelkonforme Charaktere führt.

### Würfe

25. Als Spieler möchte ich einen Wurf per Knopfdruck von der App würfeln lassen, damit die Erstellung schnell geht.
26. Als Spieler möchte ich stattdessen das Ergebnis eines echten Würfels eintragen, damit meine Runde mit echten Würfeln spielen kann.
27. Als Spieler möchte ich bei jedem Wurf sehen, ob er von der App gewürfelt oder eingetragen wurde, damit die Herkunft nachvollziehbar ist.
28. Als Spielleiter möchte ich bei einem fremden Charakter sehen, welche Würfe die App gemacht hat und welche eingetragen wurden, damit ich einen Charakter einschätzen kann.
29. Als Spieler möchte ich, dass ein Wurf neu bewertet wird, wenn sich der Zielwert ändert. Ein Reifewurf von 17 gegen INT soll also nach einer INT-Änderung neu ausgewertet und nicht neu gewürfelt werden, damit eine Änderung keinen Neuwurf erzwingt.

### Grundattribute

30. Als Spieler möchte ich die acht Grundattribute mit 8× 4W6 bestimmen, wobei die drei höchsten Würfel zählen, damit ich nach dem Standardverfahren würfle.
31. Als Spieler möchte ich alternativ das feste Array 16, 14, 12, 12, 10, 10, 10, 8 nutzen, damit ich ohne Zufall planen kann.
32. Als Spieler möchte ich die erzeugten Werte frei auf die acht Grundattribute verteilen, etwa per Ziehen oder Tauschen, damit der Charakter meiner Vorstellung entspricht.
33. Als Spieler möchte ich sehen, welche Grundattribute welche Fertigkeiten und Sekundärattribute beeinflussen, damit ich die Werte sinnvoll verteile.

### Spezies und Alter

34. Als Spieler möchte ich eine Spezies wählen (Mensch, Zwerg, Elf) und ihre Attributsmodifikatoren und Eigenschaften sehen, damit ich die Folgen der Wahl kenne.
35. Als Spieler möchte ich bei Spezies-Eigenschaften mit Wahlmöglichkeit, etwa „Eherner Wille“ oder „Blut der Alten Welt“, die Variante auswählen, damit die Eigenschaft korrekt angewendet wird.
36. Als Spieler möchte ich ein Alter eingeben und sehen, welche Altersstufe es für meine Spezies bedeutet, damit ich die Folgen des Alters kenne.
37. Als Spieler möchte ich den Malus junger Charaktere frei auf die betroffenen Grundattribute verteilen, damit ich ihn gezielt setzen kann.
38. Als Spieler möchte ich, dass kein Grundattribut durch Altersmali unter 5 fällt, damit die Grenze des Regelwerks eingehalten wird.
39. Als Spieler möchte ich Reifewürfe für das Alter durchführen und sehen, ob sie INT oder KLU erhöhen, damit Lebenserfahrung abgebildet wird.
40. Als Spieler möchte ich Atrophia-Mali alter Charaktere auf ein körperliches Grundattribut meiner Wahl legen, damit der Verfall regelkonform ist.
41. Als Spieler möchte ich Vergreisungswürfe gegen die Stabilität durchführen, sobald diese feststeht, damit der geistige Verfall abgebildet wird.
42. Als Spieler möchte ich, dass Glück bei Kind oder Jugend mit Vorteil gewürfelt wird und Kinder +2 erhalten, damit die Altersregeln vollständig angewendet werden.
43. Als Spieler möchte ich, dass Spezies-Eigenschaften, die erst in der Reflexionsphase wirken (etwa „Stupor Mundi“), als Text am Charakter stehen, damit sie in Version 2 nicht vergessen werden.

### Religion

44. Als Spieler möchte ich eine von neun Religionen wählen und ihren Bonus sehen, damit ich meinen Glauben festlege.
45. Als Spieler möchte ich bei Religionen mit Unterwahl, etwa Gott der Kirche der Acht oder Höllenkreis der Sieben Erzdämonen, die Unterwahl treffen, damit der richtige Bonus gilt.
46. Als Spieler möchte ich bei Religionen, die eine Fertigkeit verbessern, die Fertigkeit auswählen, damit der Bonus angewendet wird, auch über 20.

### Charakteristik

47. Als Spieler möchte ich entweder eine Charakteristik frei wählen oder bis zu zwei auswürfeln (W100), damit ich zwischen Kontrolle und Zufall entscheide.
48. Als Spieler möchte ich eine der beiden gewürfelten Charakteristiken einmal neu würfeln, damit ich ein unpassendes Ergebnis ersetzen kann.
49. Als Spieler möchte ich, dass ein doppeltes Würfelergebnis automatisch neu gewürfelt wird, damit ich zwei verschiedene Charakteristiken erhalte.
50. Als Spieler möchte ich per Override zwei Charakteristiken selbst festlegen, damit am Tisch gewürfelte Ergebnisse übernommen werden können.
51. Als Spieler möchte ich, dass die mechanischen Effekte einer Charakteristik auf Grundattribute, Fertigkeiten, Status und Bewegung automatisch einfließen, damit ich nichts nachtragen muss.
52. Als Spieler möchte ich den vollen Text jeder Charakteristik lesen, damit ich sie ausspielen kann.
53. Als Spieler möchte ich zusätzliche Charakteristiken aus Spezies-Eigenschaften wie „Eherner Wille“ oder „Blut der Alten Welt“ angeboten bekommen, damit diese Eigenschaften greifen.

### Besondere Herkunft und Kunststücke

54. Als Spieler möchte ich, wenn die optionale Regel aktiv ist, eine Besondere Herkunft frei wählen und ihre Mali und Fähigkeiten sehen, damit ich die Abstammung meines Charakters gestalte.
55. Als Spieler möchte ich bei Herkünften mit Unterwahl, etwa Artefakt, Elemente oder Drachenblut, die Unterwahl treffen, damit die Herkunft vollständig ist.
56. Als Spieler möchte ich statt einer Besonderen Herkunft ein zweites Kunststück wählen, damit ich einen gleichwertigen Ausgleich bekomme.
57. Als Spieler möchte ich immer mindestens ein Kunststück wählen, damit jeder Charakter eine Besonderheit hat.
58. Als Spieler möchte ich nur Kunststücke angeboten bekommen, deren Fertigkeitsvoraussetzungen mein Charakter erfüllt, damit meine Wahl gültig ist.

### Profession und Fertigkeiten

59. Als Spieler möchte ich meine Profession selbst benennen, damit sie zu meinem Charakter passt.
60. Als Spieler möchte ich acht Professionsfertigkeiten wählen, die je +5 erhalten, damit meine Profession ihre Kompetenzen bekommt.
61. Als Spieler möchte ich den Statusmodifikator meiner Profession per W6 bestimmen, damit mein Startstatus feststeht.
62. Als Spieler möchte ich fünf Heldenfertigkeiten wählen und ihnen die Werte 14, 12, 10, 8 und 8 zuweisen, damit mein Charakter Kampf- oder Magiefähigkeiten hat.
63. Als Spieler möchte ich gewarnt werden, wenn das Setzen einer Heldenfertigkeit ihren Wert unter den Startwert senkt, damit ich das bewusst entscheide.
64. Als Spieler möchte ich den Startwert jeder Fertigkeit aus dem zugehörigen Grundattribut berechnet sehen (½ oder ⅕, bei zwei Attributen das höhere), damit ich weiß, wo ich stehe.
65. Als Spieler möchte ich für Fertigkeiten mit Spezialisierung, etwa Wissenschaften, eine Spezialisierung angeben und sie mehrfach wählen, damit ich etwa Medizin und Alchemie getrennt führen kann.
66. Als Spieler möchte ich die Punkte für Persönliche Interessen auf Basis von KLU oder INT bekommen, vorausgewählt ist der höhere Wert, damit ich die Wahl habe, aber den günstigen Standard bekomme.
67. Als Spieler möchte ich die Punkte für Persönliche Interessen frei verteilen, auch auf Professionsfertigkeiten und Status, aber nicht auf Kampf- oder Magiefertigkeiten, damit ich die Regel einhalte.
68. Als Spieler möchte ich jederzeit sehen, wie viele Punkte ich noch verteilen kann, damit ich nichts verschwende.
69. Als Spieler möchte ich zu jeder Fertigkeit den vollen Wert, den Halbwert und den Fünftelwert sehen, damit ich die Erfolgsstufen am Tisch ablesen kann.

### Sekundärattribute

70. Als Spieler möchte ich TP, Stabilität, Magiepunkte, Ausweichen, Schadensbonus, Wundschwelle und Bewegung automatisch berechnet sehen, abgerundet, damit ich nicht rechnen muss.
71. Als Spieler möchte ich Glück per W20 würfeln, mit Vorteil, wo die Regeln es vorsehen, damit mein Startwert feststeht.
72. Als Spieler möchte ich, dass Boni aus Spezies, Charakteristik, Herkunft und Religion in die Sekundärattribute einfließen, damit die Werte stimmen.
73. Als Spieler möchte ich, dass der Altersabzug auf die Bewegung automatisch angewendet wird, damit das Alter vollständig wirkt.

### Freischaltungen

74. Als Spieler möchte ich sehen, welche Kampftechniken mir meine Kampffertigkeiten erlauben (Stufe I ab 10, II ab 14, III ab 18, je 2 Punkte eine weitere Technik), damit ich passende Techniken wähle.
75. Als Spieler möchte ich ab 18 Punkten in einer Kampffertigkeit einen Kampfstil wählen, damit mein Charakter sein Können zeigt.
76. Als Spieler möchte ich, dass ich die Basiszauber einer Magiefertigkeit automatisch erhalte, sobald ich Punkte in sie stecke, damit ich nichts vergesse.
77. Als Spieler möchte ich sehen, wie viele Zauber welcher Stufe mir meine Magiefertigkeit erlaubt, und nur so viele wählen können, damit mein Zauberrepertoire gültig ist.
78. Als Spieler möchte ich den vollen Text jedes Zaubers, jeder Technik und jedes Kampfstils lesen, damit ich ihn am Tisch einsetzen kann.
79. Als Spieler möchte ich, dass Freischaltungen nach einer Änderung der Fertigkeitswerte neu geprüft werden, damit keine ungültigen Techniken oder Zauber übrig bleiben.

### Vorgeschichte

80. Als Spieler möchte ich Name, Geschlecht, persönliche Beschreibung, Herkunfts- und Wohnort sowie Sprachen eintragen, damit mein Charakter eine Identität hat.
81. Als Spieler möchte ich Glaube, Weltanschauung, wichtige Personen, bedeutungsvolle Orte, wertvollen Besitz und Wesenszüge frei eintragen oder aus den W10-Tabellen würfeln, damit ich Inspiration bekomme.
82. Als Spieler möchte ich mir Namensvorschläge aus den Namenslisten nach Kultur anzeigen lassen, damit ich schnell einen passenden Namen finde.
83. Als Spieler möchte ich Aussehens-Adjektive auswürfeln, damit die Beschreibung leichter fällt.

### Ausstattung

84. Als Spieler möchte ich, dass sich Stufe, Geldbeutel, Tagesgeld und Besitztümer aus meinem Status ergeben, damit mein Startvermögen stimmt.
85. Als Spieler möchte ich Waffen, Rüstungen, Kleidung und Ausrüstung aus einem Katalog mit Preisen und Werten übernehmen, damit ich schnell ausrüste.
86. Als Spieler möchte ich frei eigene Gegenstände eintragen, damit Absprachen mit dem Spielleiter möglich sind.
87. Als Spieler möchte ich sehen, wie viel Geld nach meinen Käufen noch übrig ist, ohne dass die App das Überziehen verbietet, damit ich planen kann.
88. Als Spieler möchte ich Beträge in Gulden, Kronen und Pfennig sehen und eingeben, damit die Währung des Regelwerks gilt.
89. Als Spieler möchte ich bei Katalog-Einträgen die Werte und den vollen Text sehen, also Schaden, Modifikator, Länge, RS und Besonderheiten, damit ich gut auswähle.

### Lebender Bogen

90. Als Spieler möchte ich einen fertigen Charakter am Tisch auf dem Handy öffnen und alle wichtigen Werte übersichtlich sehen, damit ich keinen Papierbogen brauche.
91. Als Spieler möchte ich erlittenen Schaden eingeben. Die App soll die TP abziehen und prüfen, ob die Wundschwelle überschritten ist, damit ich Wunden nicht übersehe.
92. Als Spieler möchte ich nach einem Kampf den Wundenmalus auf die maximalen TP vorgeschlagen bekommen und würfeln oder eintragen, damit die Regel angewendet wird.
93. Als Spieler möchte ich Zustände wie Wunde, Infektion, Wundfieber, Panik, Mentaler Zusammenbruch oder sterbend setzen und entfernen, damit ich den Zustand meines Charakters festhalte.
94. Als Spieler möchte ich Stabilitätsverlust eingeben und Hinweise bekommen, etwa Panik bei mehr als 5 Verlust im Kampf oder Zusammenbruch bei mehr als 10 auf einmal, damit ich die Folgen kenne.
95. Als Spieler möchte ich den Stabilitäts-Startwert sehen und gewarnt werden, wenn die Stabilität unter die Hälfte davon fällt, damit ich den schleichenden Wahnsinn bemerke.
96. Als Spieler möchte ich Magiepunkte ausgeben, auch ins Negative, und den Schaden durch Überziehen angezeigt bekommen, damit Magie am Tisch korrekt läuft.
97. Als Spieler möchte ich eine Ruhephase (8 Stunden voll, 4 Stunden halb) oder Meditation auslösen, damit MP und TP regelkonform regenerieren.
98. Als Spieler möchte ich Glück nach Einsatz, Session oder Ruhephase neu würfeln und nach einem Patzer um 1 erhöhen, damit der Glückswert stimmt.
99. Als Spieler möchte ich Geld ausgeben und einnehmen, damit mein Geldbeutel aktuell bleibt.
100. Als Spieler möchte ich Gegenstände ins Inventar aufnehmen, entfernen und als angelegt markieren, damit ich weiß, was mein Charakter trägt.
101. Als Spieler möchte ich begrenzte Ressourcen aus Herkunft oder Eigenschaften abhaken, zum Beispiel „einmal pro Tag“ oder Seelen im Artefakt, damit ich sie nicht doppelt nutze.
102. Als Spieler möchte ich jeden Wert jederzeit von Hand ändern, damit Spielleiter-Entscheidungen und Sonderfälle immer Vorrang haben.
103. Als Spieler möchte ich die letzten Aktionen der laufenden Sitzung rückgängig machen, damit ein Vertipper keine Folgen hat.
104. Als Spieler möchte ich, dass nur der aktuelle Stand gespeichert wird und nicht der Weg dorthin, damit Charakterdateien einfach und klein bleiben.
105. Als Spieler möchte ich am lebenden Bogen jederzeit Zauber-, Kunststück- und Item-Texte nachschlagen, damit ich das Regelwerk nicht öffnen muss.

### Druckbogen

106. Als Spieler möchte ich einen druckbaren Charakterbogen erzeugen, damit ich klassisch auf Papier spielen kann.
107. Als Spieler möchte ich den Druckbogen über den Browser als PDF speichern, damit ich ihn weitergeben kann.

### Pflege der Regeldaten

108. Als Maintainer möchte ich Regeldaten in eigenen Datendateien ändern, ohne Code anzufassen, damit Regeländerungen des Autors schnell übernommen werden.
109. Als Maintainer möchte ich bei jedem Eintrag sehen, auf welche Stelle im Regelwerk er sich bezieht, damit ich ihn gegen die Quelle prüfen kann.
110. Als Maintainer möchte ich vorläufige Annahmen in den Regeldaten als solche markiert sehen, damit ich sie ersetze, sobald der Autor entschieden hat.
111. Als Maintainer möchte ich Freischaltungstabellen wie die Zaubertabelle als Daten pflegen, damit eine Antwort des Autors nur eine Datenänderung ist.
112. Als Maintainer möchte ich ein Prüfskript starten, das die Regeldaten mit den Markdown-Tabellen des Regelwerks vergleicht und Abweichungen auflistet, damit ich Änderungen des Autors bemerke.
113. Als Maintainer möchte ich das Prüfskript mit einem einzigen Befehl lokal starten, damit die Prüfung keinen Aufwand macht.
114. Als Maintainer möchte ich neue Settings oder Katalogeinträge, etwa Fallout, als weitere Datendateien ergänzen, damit Erweiterungen keinen Code brauchen.
115. Als Spieler möchte ich, dass ein gespeicherter Charakter nach einem Update der App oder der Regeldaten weiter geöffnet werden kann, damit meine Charaktere nicht verloren gehen.
116. Als Spieler möchte ich nach einem Update der Regeldaten Hinweise sehen, wenn mein Charakter dadurch ungültig geworden ist, damit ich ihn anpassen kann.

### Import ohne Prüfung

117. Als Spieler möchte ich eine von Hand bearbeitete Charakterdatei importieren, ohne dass die App sie ablehnt, damit Sonderanfertigungen möglich sind. Verantwortlich dafür bin dann ich.

## Implementation Decisions

### Architektur
- **App:** Statische PWA mit SvelteKit (statischer Adapter), TypeScript und `vite-plugin-pwa`, ohne Backend (ADR 0001, ADR 0002).
- **Ort und Hosting:** Der App-Code liegt im Repository des Autors in einem eigenen Ordner. Vorerst läuft alles lokal (Entwicklungsserver bzw. lokale Vorschau des statischen Builds). Die spätere Veröffentlichung, voraussichtlich über GitHub Pages, ist nicht Teil dieser Spec.
- **Offline:** Der Service Worker cached alle App-Dateien und alle Regeldaten. Nach dem ersten Aufruf funktioniert die App vollständig ohne Netz.
- **Sprache:** Die Oberfläche ist deutsch, Bezeichner im Code sind englisch. Spielbegriffe ohne gute Übersetzung bleiben im Code deutsch, siehe `CONTEXT.md`. Sichtbare Texte stehen gesammelt an einer Stelle und nicht verstreut im Code, damit eine spätere Übersetzung möglich bleibt.

### Module

**1. Regeldaten** (`ruleData`)
- **Inhalt:** Handgepflegte, strukturierte Datendateien (JSON oder YAML), getrennt nach Bereichen: Grundattribute, Spezies (mit Altersstufen und Eigenschaften), Religionen, Charakteristiken, Besondere Herkünfte, Fertigkeiten, Heldenfertigkeiten, Kunststücke, Kampftechniken, Kampfstile, Zauber, Vorgeschichte-Tabellen, Status-Stufen und Ausrüstungskataloge.
- **Pflichtfelder jedes Eintrags:**
  - eine stabile ID, auf die Charaktere verweisen
  - einen Anzeigenamen
  - einen Verweis auf die Quelle im Regelwerk (Datei und Abschnitt)
  - bei Bedarf eine Setting-Zuordnung
  - bei Bedarf eine Markierung „vorläufig“ mit Verweis auf die Regelfrage
- **Texte:** Volltexte von Items, Zaubern, Kunststücken, Techniken, Stilen und Charakteristiken sind enthalten. Regeln werden nicht erklärt.
- **Mechanik als Daten:** Mechanische Effekte sind als Daten beschrieben, nicht als Code. Dazu zählen Attributsmodifikatoren, Fertigkeitsboni, Wahlmöglichkeiten mit Unteroptionen und Freischaltschwellen.
- **Freier Text als Fallback:** Effekte, die sich nicht strukturiert beschreiben lassen, stehen als reiner Text und werden nicht automatisch angewendet. Sie lassen sich dann von Hand berücksichtigen.
- **Regelparameter:** Werte wie Rundungsart, Array-Werte, Würfelformeln, die Werte der Heldenfertigkeiten (14/12/10/8/8), Punkte pro Profession und Altersgrenzen stehen ebenfalls in den Daten.
- **Version:** Die Regeldaten tragen eine Versionsnummer.

**2. Regelkern** (`engine`). Reines TypeScript ohne Bezug zu Svelte, Browser oder Zufall. Das ist die einzige Testgrenze der App. Er hat zwei Funktionen:
- **Ansicht berechnen:** Charakter + Regeldaten → Ansicht. Die Ansicht enthält:
  - alle effektiven Werte: Grundattribute nach allen Modifikatoren, Sekundärattribute, Fertigkeiten mit Voll-, Halb- und Fünftelwert, Status-Stufe und Startgeld
  - pro Schritt der Erstellung den Zustand (offen, gültig, ungültig) und die erlaubten Optionen
  - alle Warnungen und alle ungültigen Entscheidungen mit Begründung
  - die freigeschalteten Techniken, Stile und Zauberkontingente
  - den Spielstand mit Hinweisen, etwa „Wundschwelle überschritten“
- **Aktion anwenden:** Charakter + Aktion + Regeldaten → neuer Charakter. Aktionen gibt es für die Erstellung (z. B. Spezies wählen, Wurf eintragen, Fertigkeitspunkt setzen) und für das Spiel (z. B. Schaden erleiden, Ruhephase, MP ausgeben, Wert von Hand setzen).
- **Würfe:** Der Regelkern würfelt nie selbst. Jede Wurf-Aktion bringt den fertigen Würfelwert mit. Die Oberfläche erzeugt ihn per Zufall oder übernimmt die Eingabe des Spielers. Dadurch ist der Regelkern deterministisch.
- **Neubewertung:** Ändert sich eine frühere Entscheidung, bewertet die Ansicht alle späteren neu. Gültige Entscheidungen bleiben erhalten, ungültige werden markiert, aber nicht gelöscht. Würfe werden mit ihrem gespeicherten Würfelwert gegen den neuen Zielwert ausgewertet.
- **Feste Regeln:** Rundung ist immer Abrundung. Werte haben keine Obergrenze. Kein Grundattribut fällt durch Altersmali unter 5. Alle übrigen Regelentscheidungen stehen in `docs/offene-regelfragen.md`.
- **Reihenfolge der Erstellung:**
  1. Optionale Regeln und Setting (jederzeit änderbar, eine Änderung löst eine Neubewertung aus)
  2. Grundattribute
  3. Spezies
  4. Alter (Mali, Reifewürfe, Atrophia)
  5. Religion
  6. Charakteristik
  7. Besondere Herkunft oder zweites Kunststück
  8. Profession und Fertigkeiten (Professionsfertigkeiten, Heldenfertigkeiten, Status)
  9. Persönliche Interessen
  10. Sekundärattribute und Glück
  11. Vergreisungswürfe
  12. Kunststück, Kampftechniken, Kampfstil, Zauber
  13. Ausstattung
  14. Vorgeschichte und Name

  Sekundärattribute werden fortlaufend berechnet. Ein eigener Schritt ist nur für die Würfe nötig.

**3. Charaktermodell und Charakterdatei.** Ein Charakter speichert nur seinen aktuellen Stand und keine Vorgeschichte der Änderungen. Er besteht aus:
- **Metadaten:** ID, Name, Version des Dateiformats, Version der Regeldaten bei der letzten Speicherung, Status in Erstellung bzw. fertig.
- **Optionen:** aktive optionale Regeln und Setting.
- **Grundlage:** die aktuellen Entscheidungen der Erstellung, als Verweise auf Regeldaten-IDs plus eigene Eingaben. Jeder Wurf mit Würfelwert(en) und der Angabe „gewürfelt“ oder „eingetragen“.
- **Spielstand:** aktuelle TP und Wunden, aktuelle Stabilität, MP, Glück, Status, Geld, Zustände, Inventar mit Katalog- und freien Einträgen, verbrauchte Ressourcen und Werte, die von Hand gesetzt wurden und Vorrang vor berechneten haben.
- **Format:** Die Datei ist JSON mit einer Versionsnummer. Bei neuen Formatversionen migriert die App ältere Dateien beim Laden.
- **Import:** Importierte Dateien werden nur so weit geprüft, dass sie sich laden lassen. Regelkonformität wird nicht erzwungen.

**4. Sitzung** (`session`). Hält im Speicher eine Liste der Aktionen der laufenden Sitzung, damit „Rückgängig“ funktioniert. Diese Liste wird nicht gespeichert.

**5. Charakterspeicher** (`storage`). Liest und schreibt Charaktere in IndexedDB und speichert nach jeder Aktion automatisch. Dazu gehören Export als Datei, Import aus einer Datei, Duplizieren und Löschen.

**6. Oberfläche (SvelteKit).** Seiten:
- Charakterliste
- geführte Erstellung mit Schrittnavigation, Zusammenfassung und Markierung ungültiger Schritte
- lebender Bogen, optimiert fürs Handy
- Nachschlageansicht für Texte
- Druckbogen mit Druck-CSS

Die Oberfläche enthält keine Regellogik. Sie zeigt die Ansicht an und löst Aktionen aus. Ein Würfel-Bedienelement bietet überall „würfeln“ und „eintragen“ an.

**7. Prüfskript für die Regeldaten.**
- **Technik:** Ein Node/TypeScript-Skript ohne LLM, das lokal per npm-Befehl läuft.
- **Ablauf:** Es liest die gut strukturierten Markdown-Tabellen und -Listen des Regelwerks per Textverarbeitung aus und vergleicht sie mit den Regeldaten. Gemeint sind Ausrüstungslisten, Status-Tabelle, Fertigkeitsliste, Heldenfertigkeiten, Charakteristiken und Kunststücke. Gemeldet werden fehlende, zusätzliche und abweichende Einträge.
- **Grenzen:** Fließtext wird nicht geprüft. Bei Abweichungen schlägt das Skript fehl, Einträge mit dem Vermerk „vorläufig“ bekommen nur eine Warnung.

### Aufräumen
- Die alten Versuche `GUI_test` und `PWA_test` werden einmal committet und danach entfernt.
- Die neue Arbeit läuft auf einem frischen Branch von `main`.

## Testing Decisions

- **Was ein guter Test ist:** Ein Test prüft nur äußeres Verhalten über die öffentliche Schnittstelle des Regelkerns. Gegeben ein Charakter und eine Folge von Aktionen mit festen Würfelwerten, erwartet er eine bestimmte Ansicht. Tests kennen keine internen Hilfsfunktionen, damit Umbauten im Inneren keine Tests brechen.
- **Getestete Module:**
  - **Regelkern:** fast alles, also jede Regel der Erstellung, Neubewertung nach Änderungen, Würfe mit festen Werten, Warnungen und ungültige Entscheidungen, Freischaltungen und die Assistenz-Aktionen des lebenden Bogens.
  - **Charakterdatei:** Migration alter Formatversionen über die Lade-Schnittstelle.
  - **Prüfskript:** mit kleinen Beispiel-Markdown- und Beispiel-Datendateien.
- **Regeldaten in Tests:** Regeltests laufen gegen die echten Regeldaten, so dass ein Test „ein Zwerg mit KON 14 hat X TP“ die echten Daten prüft. Mechaniktests, etwa zur Neubewertung oder zu ungültigen Entscheidungen, nutzen kleine eigene Testdaten, damit sie bei Regeländerungen stabil bleiben.
- **Referenzcharaktere:** Einige vollständig durchgerechnete Beispielcharaktere dienen als Regressionstests über die gesamte Erstellung.
- **Werkzeug:** Vitest, passend zu Vite und SvelteKit.
- **Nicht automatisch getestet:** Svelte-Oberfläche, IndexedDB-Speicher, PWA-Installation und Druckbogen. Sie enthalten kaum eigene Logik und werden durch Durchklicken, Installieren aufs Handy und einen Testdruck von Hand geprüft. Bei wiederholten Fehlern kommen gezielte Klicktests mit Playwright dazu.
- **Prior Art:** Im Repository gibt es keine Tests. Die früheren Versuche enthalten keine wiederverwendbaren Muster.

## Out of Scope

- Reflexionsphase und Steigerung (Version 2)
- Point-Buy für Grundattribute (kommt, sobald der Autor die Regel schreibt)
- Tragkraft
- Würfeln der Besonderen Herkunft
- Liste vorgefertigter Professionen (bis sie existiert, baut jeder Spieler seine Profession selbst)
- Ergänzen unvollständiger Regeltexte und Reparieren kaputter Links im Regelwerk
- Cloud-Sync, Benutzerkonten, Server, Spielleiter-Übersicht über die Charaktere einer Runde
- Store-Apps (Play Store, App Store)
- Veröffentlichung bzw. Auslieferung über GitHub Pages und GitHub Actions; vorerst bleibt alles lokal
- Übersetzungen
- Prüfung importierter oder von Hand bearbeiteter Charakterdateien auf Regelkonformität
- Erklärungen der Spielregeln in der App
- Ausblenden von Settings hinter einer Einstellung

## Further Notes

- **Vorläufige Annahmen:** Bis der Autor antwortet, gelten zwei vorläufige Annahmen, die in den Regeldaten als vorläufig markiert sind. Die Zauber-Freischaltung folgt der Tabelle aus `Charaktererstellung.md`. Professionen werden frei gebaut.
- **Vorrangregel bei Widersprüchen:** Neuere Commits gehen älteren vor, Commits von Inkspill gehen Commits von AnyoChili vor. Ausnahme: Die mit dem Autor abgestimmten Dateien `Alter.md` und `Spezies_&_Alter.md` gelten.
- **Veröffentlichung:** Für die spätere Veröffentlichung über GitHub Pages muss der Autor Pages einmalig aktivieren. Eine automatische Prüfung per GitHub Actions kann dann ebenfalls dazukommen.
- **Fallout-Setting:** Es wird von Anfang an als eigenes Setting mitgeliefert, sobald die zugehörigen Regeldaten erfasst sind.
- **Spätere Optionen:** Ein Cloud-Sync, etwa über ein Google-Konto, kann später ergänzt werden, ohne die lokale Speicherung aufzugeben. Die PWA kann später als Trusted Web Activity in den Play Store gebracht werden.
