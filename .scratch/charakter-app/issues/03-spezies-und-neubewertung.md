# 03 — Spezies und Neubewertung

Status: ready-for-agent

**What to build:**

Ein Spieler wählt Mensch, Zwerg oder Elf und sieht sofort die effektiven Grundattribute nach den Modifikatoren der Spezies. Eigenschaften mit Wahlmöglichkeit („Eherner Wille“, „Blut der Alten Welt“) lassen sich festlegen. Ändert der Spieler die Spezies nachträglich, rechnet die App alles neu. Gültige Entscheidungen bleiben erhalten, ungültige werden markiert und begründet. Dieses Ticket führt den allgemeinen Mechanismus der Neubewertung ein.

**Blocked by:** 02 — Erstellungsablauf, optionale Regeln und Grundattribute

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [ ] Die Spezies stehen in den Regeldaten (aus `Spezies_&_Alter.md`) mit Modifikatoren, Eigenschaften (Text und, wo möglich, strukturierte Effekte) und Wahlmöglichkeiten.
- [ ] Die Ansicht liefert die effektiven Grundattribute (Basis plus alle Modifikatoren).
- [ ] „Blut der Alten Welt“ (+2 auf das höchste Attribut, auch über 20, −1 auf alle anderen) und „Eherner Wille“ sind als Wahl umgesetzt. Eine Variante, die eine zusätzliche Charakteristik bringt, ist vermerkt (wird in Ticket 10 wirksam).
- [ ] Eigenschaften, die sich nicht strukturiert beschreiben lassen, erscheinen als Text.
- [ ] Ändert sich die Spezies, bleiben gültige Entscheidungen erhalten. Ungültige werden in der Ansicht als ungültig markiert, mit Begründung, und nicht gelöscht.
- [ ] Ungültige Entscheidungen sind in der Schrittnavigation sichtbar markiert.
- [ ] Mechaniktests mit eigenen kleinen Testdaten decken die Neubewertung ab, Regeltests mit den echten Regeldaten die Spezies.
