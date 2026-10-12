# 04 — Sekundärattribute und Glück

Status: done

**What to build:**

Ein Spieler sieht jederzeit TP, Stabilität (STA), Magiepunkte, Ausweichen, Schadensbonus, Wundschwelle und Bewegung, berechnet aus den effektiven Grundattributen und abgerundet. Glück wird per W20 gewürfelt oder eingetragen.

**Blocked by:** 02 — Erstellungsablauf, optionale Regeln und Grundattribute

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [x] Die Formeln folgen `Sekundärattribute.md`:
  - TP = KON + 5
  - STA = (WIL + KON) × 5 / 2
  - MP = WIL/2 + max(CHA, INT, KLU)/5
  - Ausweichen = (GES + WAH)/2
  - Schadensbonus nach STR-Tabelle
  - Wundschwelle = TP/5
  - Bewegung nach GES + KON
- [x] Es wird immer abgerundet (Regelparameter in den Regeldaten).
- [x] Boni aus anderen Quellen (Spezies, später Charakteristik, Herkunft, Religion) fließen über einen gemeinsamen Mechanismus ein.
- [x] Glück ist ein W20-Wurf. Vorteil (zwei Würfe, der höhere zählt) lässt sich durch andere Regeln auslösen.
- [x] Die Werte erscheinen in der Zusammenfassung des Charakters und werden nach jeder Änderung neu berechnet.
- [x] Regeltests decken jede Formel und Grenzfälle der Tabellen ab.
