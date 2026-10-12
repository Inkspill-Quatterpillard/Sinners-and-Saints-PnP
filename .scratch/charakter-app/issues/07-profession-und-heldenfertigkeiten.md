# 07 — Profession und Heldenfertigkeiten

Status: done

**What to build:**

Ein Spieler baut seine Profession selbst: Er gibt ihr einen Namen, wählt acht Professionsfertigkeiten mit je +5 und bestimmt den Statusmodifikator per W6. Er wählt fünf Heldenfertigkeiten und setzt sie auf 14, 12, 10, 8 und 8. Sinkt eine Heldenfertigkeit dadurch unter ihren Startwert, warnt die App.

**Blocked by:** 05 — Fertigkeitsliste und Startwerte

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [x] Die Profession hat einen frei eingegebenen Namen. Eine vorgefertigte Professionsliste gibt es nicht (vorläufig, siehe Regelfrage R1).
- [x] Genau acht Professionsfertigkeiten mit je +5. Die Anzahl und der Bonus stehen als Regelparameter in den Regeldaten.
- [x] Status startet bei 5 plus Modifikator per W6 (1: −3, 2: −2, 3: −1, 4: +1, 5: +2, 6: +3), würfelbar oder eintragbar.
- [x] Fünf Heldenfertigkeiten werden auf 14/12/10/8/8 *gesetzt*, nicht addiert.
- [x] Liegt der Startwert über dem gesetzten Wert, ist das Setzen erlaubt. Die Ansicht liefert dann eine Warnung.
- [x] Der Schritt ist erst gültig, wenn alles vergeben ist.
