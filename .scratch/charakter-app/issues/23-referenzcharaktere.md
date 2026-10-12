# 23 — Referenzcharaktere

Status: done

**What to build:**

Einige vollständig durchgerechnete Beispielcharaktere dienen als Regressionstests über die gesamte Erstellung. Mit ihnen fällt auf, wenn eine Änderung an Regelkern oder Regeldaten das Ergebnis eines kompletten Charakters verändert.

**Blocked by:** 06 — Alter, 08 — Persönliche Interessen, 09 — Religion, 10 — Charakteristik, 11 — Besondere Herkunft und Kunststücke, 12 — Kampftechniken und Kampfstile, 13 — Zauber, 14 — Ausstattung, 15 — Vorgeschichte und Name

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [x] Mindestens drei Referenzcharaktere, je Spezies einer, mit unterschiedlichen Altersstufen, Religionen, mit und ohne Besondere Herkunft und mit Charakteristik.
- [x] Jeder Referenzcharakter ist eine Folge von Aktionen mit festen Würfelwerten. Die erwartete Ansicht (alle Werte, keine ungültigen Entscheidungen) ist von Hand nachgerechnet.
- [x] Die Tests laufen gegen die echten Regeldaten mit Vitest.
