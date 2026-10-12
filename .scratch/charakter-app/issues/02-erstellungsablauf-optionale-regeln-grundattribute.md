# 02 — Erstellungsablauf, optionale Regeln und Grundattribute

Status: ready-for-agent

**What to build:**

Ein Spieler öffnet einen Charakter, wird durch die Schritte der Erstellung geführt und sieht pro Schritt dessen Zustand (offen, gültig, ungültig). Optionale Regeln (Besondere Herkunft, Charakteristik) und Setting lassen sich jederzeit umschalten. Der erste inhaltliche Schritt erzeugt die acht Grundattribute per 8× 4W6 (die drei höchsten zählen) oder per festem Array und verteilt sie frei. Dabei entstehen das Würfel-Bedienelement und die erste Regeldaten-Datei.

**Blocked by:** 01 — Grundgerüst und Charakterliste

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [ ] Die Schrittnavigation zeigt alle Schritte mit Zustand. Jeder Schritt ist jederzeit erreichbar.
- [ ] Optionale Regeln und Setting sind jederzeit umschaltbar. Ein Umschalten bewertet den Charakter neu.
- [ ] Die Grundattribute STR, KON, GES, WAH, KLU, INT, CHA und WIL stehen in den Regeldaten, mit Quellenverweis auf das Regelwerk.
- [ ] Das Würfel-Bedienelement bietet „würfeln“ und „eintragen“. Gespeichert werden der Würfelwert und die Angabe, ob gewürfelt oder eingetragen.
- [ ] Der Regelkern würfelt nie selbst. Jede Wurf-Aktion bringt ihren Würfelwert mit.
- [ ] Das Verfahren 8× 4W6 (drei höchste) und das feste Array 16, 14, 12, 12, 10, 10, 10, 8 sind wählbar. Das Array steht in den Regeldaten.
- [ ] Die erzeugten Werte lassen sich frei auf die acht Grundattribute verteilen und tauschen.
- [ ] Der Schritt ist erst gültig, wenn alle acht Werte vergeben sind.
- [ ] Regelkern-Tests decken beide Verfahren und die Gültigkeit ab.
