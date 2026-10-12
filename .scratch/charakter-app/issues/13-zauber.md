# 13 — Zauber

Status: done

**What to build:**

Ein Spieler mit Magiefertigkeiten erhält deren Basiszauber automatisch, sobald er Punkte in die Fertigkeit steckt. Er sieht sein Kontingent an Zaubern je Stufe und wählt passende Zauber mit vollem Text.

**Blocked by:** 07 — Profession und Heldenfertigkeiten

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [x] Die Zauber stehen je Disziplin in den Regeldaten (aus `Zauber/*.md`), mit Stufe und Text.
- [x] Basiszauber werden automatisch gewährt.
- [x] Die Kontingenttabelle steht in den Regeldaten. Vorläufig gilt die Tabelle aus `Charaktererstellung.md`, als vorläufig markiert mit Verweis auf Regelfrage W6.
- [x] Die Auswahl über dem Kontingent ist nicht möglich. Wird das Kontingent durch Änderungen kleiner, wird die Auswahl als ungültig markiert.
- [x] Regeltests decken jede Stufe der Kontingenttabelle ab.
