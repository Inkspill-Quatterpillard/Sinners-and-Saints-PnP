# 16 — Lebender Bogen: Grundlage

Status: ready-for-agent

**What to build:**

Ein Spieler schließt einen Charakter ab, sobald alle Pflichtschritte gültig sind, und öffnet ihn als lebenden Bogen auf dem Handy. Er sieht die wichtigsten Werte übersichtlich. Er gibt Schaden ein, die App zieht die TP ab und prüft die Wundschwelle. Nach dem Kampf schlägt sie den Wundenmalus vor. Zustände lassen sich setzen und entfernen. Jeder Wert ist von Hand überschreibbar, und die Aktionen der laufenden Sitzung lassen sich rückgängig machen.

**Blocked by:** 04 — Sekundärattribute und Glück

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [ ] „Abschließen“ ist nur möglich, wenn alle bis dahin vorhandenen Pflichtschritte gültig sind. Danach hat der Charakter den Status „fertig“.
- [ ] Die Handy-Übersicht zeigt TP, STA, MP, Glück, Grundattribute, wichtigste Fertigkeiten mit Halb- und Fünftelwerten sowie Zustände.
- [ ] Die Aktion „Schaden erleiden“ zieht die TP ab. Bei mehr Schaden als die Wundschwelle meldet die Ansicht eine Wunde.
- [ ] „Kampfende“ schlägt den Wundenmalus (W6, kumulativ auf die maximalen TP) vor, würfelbar oder eintragbar.
- [ ] Zustände (Wunde, Infektion, Wundfieber, sterbend usw.) lassen sich setzen und entfernen.
- [ ] Jeder Wert lässt sich von Hand setzen. Ein von Hand gesetzter Wert geht dem berechneten vor und lässt sich zurücksetzen.
- [ ] „Rückgängig“ für die Aktionen der laufenden Sitzung. Das Protokoll wird nicht gespeichert, gespeichert wird nur der aktuelle Stand.
- [ ] Regelkern-Tests decken Schaden, Wundschwelle, Wundenmalus und Override ab.
