# 01 — Grundgerüst und Charakterliste

Status: done

**What to build:**

Ein Spieler startet die App lokal, legt einen Charakter mit Namen an und findet ihn nach einem Neuladen in der Charakterliste wieder. Die App läuft nach dem ersten Laden auch offline. Dieses Ticket legt das Fundament: SvelteKit-PWA, ein Regelkern mit seinen zwei Funktionen *Ansicht berechnen* und *Aktion anwenden* sowie die Charakterdatei in Version 1, gespeichert in IndexedDB. Die alten Versuche werden aufgeräumt. Es wird nichts veröffentlicht, alles bleibt lokal.

**Blocked by:** None — can start immediately

Siehe Spec: `.scratch/charakter-app/spec.md`. Begriffe: `CONTEXT.md`.

- [x] Neuer Branch von `main`. `GUI_test` und `PWA_test` sind einmal committet und danach entfernt.
- [x] Die SvelteKit-App (statischer Adapter, TypeScript, `vite-plugin-pwa`) startet lokal per npm-Befehl. Der statische Build lässt sich lokal als Vorschau starten.
- [x] Nach dem ersten Laden funktioniert die App ohne Netzwerk (Service Worker cached alle App-Dateien).
- [x] Der Regelkern ist reines TypeScript ohne Svelte- oder Browser-Bezug und bietet *Ansicht berechnen* und *Aktion anwenden*. Die erste Aktion ist „Name setzen“.
- [x] Die Charakterdatei hat Metadaten (ID, Name, Formatversion, Regeldaten-Version, Status „in Erstellung“/„fertig“), Grundlage und Spielstand und speichert nur den aktuellen Stand.
- [x] Die Charakterliste zeigt alle Charaktere mit Name und Status. „Neuer Charakter“ legt einen an, jede Aktion speichert automatisch in IndexedDB.
- [x] Vitest läuft per npm-Befehl. Es gibt erste Tests für den Regelkern über seine öffentliche Schnittstelle.
- [x] Sichtbare Texte stehen gesammelt an einer Stelle (Vorbereitung für spätere Übersetzungen).
