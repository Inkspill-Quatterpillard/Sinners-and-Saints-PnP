# 12 — Kampftechniken und Kampfstile

Status: done

**What to build:**

Ein Spieler sieht, welche Kampftechniken seine Kampffertigkeiten freischalten (Stufe I ab 10, II ab 14, III ab 18, je 2 Punkte eine weitere Technik), und wählt sie. Ab 18 Punkten in einer Kampffertigkeit wählt er einen Kampfstil. Bei Änderungen der Fertigkeitswerte prüft die App die Auswahl neu.

**Blocked by:** 07 — Profession und Heldenfertigkeiten

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [x] Kampftechniken stehen je Waffengattung in den Regeldaten (aus `Kampftechniken/*.md`), mit Stufe und Text.
- [x] Kampfstile stehen in den Regeldaten (aus `Kampfstile.md`).
- [x] Freischaltschwellen und Anzahl stehen als Regelparameter in den Daten.
- [x] Kampfstil ab 18 Punkten.
- [x] Techniken oder Stile, die nicht mehr erlaubt sind, werden als ungültig markiert.
