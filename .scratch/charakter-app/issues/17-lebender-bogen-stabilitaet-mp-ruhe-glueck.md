# 17 — Lebender Bogen: Stabilität, MP, Ruhe und Glück

Status: ready-for-agent

**What to build:**

Am Tisch gibt ein Spieler Stabilitätsverlust ein und bekommt Hinweise auf Panik oder einen mentalen Zusammenbruch. Fällt die STA unter die Hälfte des Startwerts, warnt die App. Er gibt MP aus, auch ins Negative, und sieht den Schaden durch das Überziehen. Ruhephasen und Meditation regenerieren regelkonform. Glück wird neu gewürfelt und steigt nach einem Patzer um 1.

**Blocked by:** 16 — Lebender Bogen: Grundlage

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [ ] Der Start-Stabilitätswert wird gespeichert. Unter der Hälfte davon gibt es eine Warnung (schleichender Wahnsinn).
- [ ] Bei mehr als 5 STA-Verlust im Kampf gibt es einen Hinweis auf Panik, bei mehr als 10 auf einmal einen Hinweis auf einen mentalen Zusammenbruch.
- [ ] MP lassen sich ausgeben und dürfen negativ werden. Die Ansicht zeigt den Schaden je überzogenem Punkt.
- [ ] Ruhephase: 8 Stunden füllen die MP voll, 4 Stunden halb. Nach einer Stunde Pause sind die TP voll, die Wundenpunkte bleiben. Meditation regeneriert 1W6+X MP pro Stunde.
- [ ] Glück wird nach Einsatz, Session oder Ruhephase neu gewürfelt und nach einem Patzer um 1 erhöht.
