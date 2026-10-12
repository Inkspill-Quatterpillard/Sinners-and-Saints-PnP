# 05 — Fertigkeitsliste und Startwerte

Status: ready-for-agent

**What to build:**

Ein Spieler sieht alle Fertigkeiten und Heldenfertigkeiten mit ihrem Startwert, also ½ oder ⅕ des zugehörigen Grundattributs, bei zwei Attributen das höhere. Zu jeder Fertigkeit zeigt die App Voll-, Halb- und Fünftelwert. Fertigkeiten mit Spezialisierung, etwa Wissenschaften, lassen sich mehrfach mit unterschiedlicher Spezialisierung anlegen.

**Blocked by:** 02 — Erstellungsablauf, optionale Regeln und Grundattribute

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [ ] Fertigkeiten und Heldenfertigkeiten stehen in den Regeldaten (aus `Liste_der_Fertigkeiten.md` und `Liste_der_Heldenfertigkeiten.md`) mit Attribut, Bruchteil, Kennzeichen „Spezialisierung notwendig“ und Quellenverweis.
- [ ] Der Startwert wird abgerundet aus dem effektiven Attribut berechnet, bei zwei Attributen aus dem höheren.
- [ ] Die Ansicht liefert pro Fertigkeit Voll-, Halb- und Fünftelwert.
- [ ] Fertigkeiten mit Spezialisierung lassen sich mehrfach mit unterschiedlichen Spezialisierungen anlegen.
- [ ] Ein gemeinsamer Mechanismus für Fertigkeitsboni (Profession, Religion, Charakteristik, Interessen …) ist vorhanden.
- [ ] Der Ansicht ist bekannt, ob eine Fertigkeit eine Kampf- oder Magiefertigkeit ist.
