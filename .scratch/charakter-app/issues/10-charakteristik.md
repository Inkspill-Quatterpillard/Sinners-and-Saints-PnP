# 10 — Charakteristik

Status: done

**What to build:**

Ist die optionale Regel aktiv, wählt der Spieler eine Charakteristik frei oder würfelt zwei per W100. Eine der beiden darf einmal neu gewürfelt werden, und Dopplungen werden automatisch neu gewürfelt. Per Override legt der Spieler zwei Charakteristiken selbst fest, etwa nach einem Wurf am Tisch. Mechanische Effekte wirken automatisch, die Texte sind lesbar. Zusätzliche Charakteristiken aus Spezies-Eigenschaften werden angeboten.

**Blocked by:** 03 — Spezies und Neubewertung, 05 — Fertigkeitsliste und Startwerte

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [x] Die 50 Charakteristiken stehen in den Regeldaten (aus `Charakteristik.md`) mit Würfelbereich, Name, Text und, wo möglich, strukturierten Effekten auf Attribute, Fertigkeiten, Status und Bewegung.
- [x] Die Modi „eine frei wählen“, „zwei würfeln“ und „Override: zwei selbst wählen“ sind vorhanden.
- [x] Einmal Neuwürfeln einer der beiden Charakteristiken. Dopplungen werden neu gewürfelt.
- [x] „Eherner Wille“ und „Blut der Alten Welt“ geben in der entsprechenden Variante eine zusätzliche Charakteristik.
- [x] Ist die optionale Regel deaktiviert, entfällt der Schritt. Gewählte Charakteristiken werden dann nicht angewendet, gehen aber nicht verloren.
