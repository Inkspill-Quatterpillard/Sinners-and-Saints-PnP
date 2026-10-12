# 11 — Besondere Herkunft und Kunststücke

Status: ready-for-agent

**What to build:**

Jeder Charakter wählt ein Kunststück, dessen Fertigkeitsvoraussetzungen er erfüllt. Ist die optionale Besondere Herkunft aktiv, wählt der Spieler entweder eine Herkunft (frei, mit Unterwahl bei Artefakt, Elemente und Drachenblut) mit ihren Mali und Fähigkeiten, oder ein zweites Kunststück.

**Blocked by:** 03 — Spezies und Neubewertung, 07 — Profession und Heldenfertigkeiten

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [ ] Die Herkünfte stehen in den Regeldaten (aus `Herkunft.md`) mit Mali, Fähigkeiten (Text) und Unterwahlen. Die Wahl ist frei, ohne Wurf.
- [ ] Unvollständige Texte (Talisman, Foliant usw.) werden so angezeigt, wie sie im Regelwerk stehen.
- [ ] Die Kunststücke stehen in den Regeldaten (aus `Kunststücke.md`) mit Voraussetzungen und Text.
- [ ] Angeboten werden nur Kunststücke, deren Voraussetzungen der Charakter erfüllt. Fällt eine Voraussetzung später weg, wird das Kunststück als ungültig markiert.
- [ ] Immer ein Kunststück. Mit aktiver Herkunftsregel statt einer Herkunft ein zweites.
- [ ] Begrenzte Ressourcen von Herkünften, etwa „einmal pro Tag“ oder Seelen im Artefakt, sind in den Regeldaten als solche gekennzeichnet (für Ticket 18).
