# 06 — Alter

Status: ready-for-agent

**What to build:**

Ein Spieler gibt das Alter ein und sieht die Altersstufe für seine Spezies. Die App wendet die Folgen an:
- Malus junger Charaktere, frei auf die betroffenen Attribute verteilbar
- Reifewürfe auf INT oder KLU
- Atrophia
- Vergreisungswürfe gegen die Stabilität
- Glück mit Vorteil bzw. +2 für Kinder
- Abzug auf die Bewegung

Wird ein Zielwert später geändert, werden die Würfe neu bewertet und nicht neu gewürfelt.

**Blocked by:** 03 — Spezies und Neubewertung, 04 — Sekundärattribute und Glück

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [ ] Die Altersstufen je Spezies stehen in den Regeldaten (aus `Spezies_&_Alter.md` und `Alter.md`). Für Elfen gilt die Tabelle (Jugend unter 80).
- [ ] Der Malus junger Charaktere (Kind −4, Jugend −2 auf STR, KON und INT) ist frei auf die betroffenen Attribute verteilbar.
- [ ] Kein Grundattribut fällt durch Altersmali unter 5.
- [ ] Reifewurf: W20 gegen INT oder KLU, liegt der Wurf höher, gibt es +1. Der Würfelwert wird gespeichert und bei einer Änderung des Zielwerts neu bewertet.
- [ ] Atrophia (−1 auf ein körperliches Attribut nach Wahl) wird gemäß der Anzahl der Altersstufen angeboten.
- [ ] Vergreisungswurf: W100 gegen STA, liegt der Wurf höher, sinken aktuelle und maximale STA um 5. Er ist erst möglich, wenn die STA feststeht.
- [ ] Glück mit Vorteil bei Kind und Jugend, Kinder bekommen +2.
- [ ] Der Altersabzug auf die Bewegung (50er bis 90er: −1 bis −5) wird angewendet.
- [ ] Regeltests decken alle Altersstufen aller Spezies ab, ebenso die Neubewertung der Reifewürfe.
