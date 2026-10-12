# 20 — Export, Import, Verwaltung und Migration

Status: ready-for-agent

**What to build:**

Ein Spieler exportiert einen Charakter als Datei und importiert ihn auf einem anderen Gerät, auch von Hand bearbeitet und ohne Prüfung auf Regelkonformität. Er dupliziert und löscht Charaktere, Löschen erst nach Bestätigung. Ältere Charakterdateien werden beim Laden migriert. Machen neue Regeldaten einen Charakter ungültig, sieht der Spieler einen Hinweis.

**Blocked by:** 01 — Grundgerüst und Charakterliste, 03 — Spezies und Neubewertung

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [ ] Der Export liefert eine JSON-Datei. Der Import liest sie ein und prüft nur, ob sie sich laden lässt.
- [ ] Duplizieren erzeugt einen unabhängigen Charakter mit neuer ID.
- [ ] Löschen ist nur nach Bestätigung möglich.
- [ ] Die Formatversion wird beim Laden geprüft. Ältere Versionen werden schrittweise migriert, mit Tests über die Lade-Schnittstelle.
- [ ] Unterscheidet sich die gespeicherte Regeldaten-Version von der aktuellen und ist der Charakter dadurch ungültig, gibt es einen Hinweis in der Liste und im Charakter.
