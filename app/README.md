# Sinners and Saints – Charakter-App

Offline-fähige PWA (SvelteKit, statischer Build) zum Erstellen und Führen von Charakteren. Hintergrund in `../CONTEXT.md`, `../docs/adr/` und `../.scratch/charakter-app/`.

## Befehle

- `npm install`: Abhängigkeiten installieren
- `npm run dev`: Entwicklungsserver (ohne Service Worker)
- `npm test`: Tests des Regelkerns (Vitest)
- `npm run check`: Typecheck
- `npm run build`: statischer Build nach `build/`
- `npm run preview`: den Build lokal ausliefern, mit Service Worker und offline-fähig
- `npm run check-rules`: die Regeldaten mit den Tabellen und Listen im `Regelwerk/` vergleichen. Das Skript endet bei Abweichungen mit Fehlercode 1; vorläufige Einträge ergeben nur Warnungen. Geprüft werden Fertigkeiten, Heldenfertigkeiten, Status-Tabelle, Charakteristiken, Kunststücke und alle Ausrüstungslisten. Fließtext prüft es nicht.
- `npm run format`: Code einheitlich formatieren (Prettier)

## Aufbau

- `src/lib/engine`: der Regelkern. Er besteht aus reinem TypeScript und ist die einzige Testgrenze. `computeView` berechnet die Ansicht, `applyAction` wendet eine Aktion an.
- `src/lib/ruleData`: die Regeldaten. Jeder Eintrag verweist auf seine Quelle im `Regelwerk/`.
- `src/lib/storage`: die Speicherung der Charaktere in IndexedDB.
- `src/routes`: die Oberfläche. Sie enthält keine Regellogik.
