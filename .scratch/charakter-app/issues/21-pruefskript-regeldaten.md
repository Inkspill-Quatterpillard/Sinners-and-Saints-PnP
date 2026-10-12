# 21 — Prüfskript für die Regeldaten

Status: ready-for-agent

**What to build:**

Ein Maintainer startet lokal einen einzigen npm-Befehl. Das Skript vergleicht die gut strukturierten Markdown-Tabellen und -Listen des Regelwerks mit den Regeldaten und listet fehlende, zusätzliche und abweichende Einträge auf. Ein LLM wird nicht verwendet.

**Blocked by:** 05 — Fertigkeitsliste und Startwerte, 10 — Charakteristik, 11 — Besondere Herkunft und Kunststücke, 14 — Ausstattung

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [ ] Node/TypeScript-Skript, das lokal per npm-Befehl läuft.
- [ ] Geprüft werden Ausrüstungslisten (alle Settings), Status-Tabelle, Fertigkeitsliste, Heldenfertigkeiten, Charakteristiken und Kunststücke.
- [ ] Die Ausgabe nennt pro Abweichung Bereich, Eintrag, Wert im Regelwerk und Wert in den Regeldaten.
- [ ] Bei Abweichungen beendet sich das Skript mit Fehlercode. Einträge mit dem Vermerk „vorläufig“ ergeben nur eine Warnung.
- [ ] Fließtext wird nicht geprüft.
- [ ] Tests mit kleinen Beispiel-Markdown- und Beispiel-Datendateien.
