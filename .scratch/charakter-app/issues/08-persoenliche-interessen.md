# 08 — Persönliche Interessen

Status: done

**What to build:**

Ein Spieler bekommt Punkte für Persönliche Interessen in Höhe von 2× KLU oder 2× INT, wobei der höhere Wert vorausgewählt ist. Er verteilt sie frei auf Fertigkeiten, Professionsfertigkeiten und Status, aber nicht auf Kampf- oder Magiefertigkeiten. Die verbleibenden Punkte sind jederzeit sichtbar.

**Blocked by:** 07 — Profession und Heldenfertigkeiten

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [x] Die Wahl zwischen KLU und INT ist frei, vorausgewählt ist der höhere Wert.
- [x] Die Punkte lassen sich auf beliebige Fertigkeiten und auf Status verteilen. Kampf- und Magiefertigkeiten sind ausgeschlossen.
- [x] Die Ansicht zeigt die Restpunkte. Überzogene Punkte machen den Schritt ungültig.
- [x] Ändern sich KLU oder INT später, werden die Punkte neu bewertet.
