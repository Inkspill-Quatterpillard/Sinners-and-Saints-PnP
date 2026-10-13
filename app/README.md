# Sinners and Saints – Charakter-App

Offline-fähige PWA (SvelteKit, statischer Build) zum Erstellen und Führen von Charakteren. Hintergrund in `../docs/adr/`.

## Befehle

- `npm install`: Abhängigkeiten installieren
- `npm run dev`: Entwicklungsserver (ohne Service Worker)
- `npm test`: Tests des Regelkerns (Vitest)
- `npm run check`: Typecheck
- `npm run build`: statischer Build nach `build/`
- `npm run preview`: den Build lokal ausliefern, mit Service Worker und offline-fähig
- `npm run check-rules`: die Regeldaten mit den Tabellen und Listen im `Regelwerk/` vergleichen. Das Skript endet bei Abweichungen mit Fehlercode 1; vorläufige Einträge ergeben nur Warnungen. Geprüft werden Fertigkeiten, Heldenfertigkeiten, Status-Tabelle, Charakteristiken, Kunststücke und alle Ausrüstungslisten. Fließtext prüft es nicht.
- `npm run format`: Code einheitlich formatieren (Prettier)

## GitHub Pages

Der Workflow `.github/workflows/pages.yml` baut die App bei jedem Push auf `main` oder `charakter-app` (nur bei Änderungen in `app/` oder `Regelwerk/`). Er führt die Tests und die Regeldaten-Prüfung aus und veröffentlicht die App unter `https://<owner>.github.io/<repo>/`. Einmalig nötig: Im Repo unter Settings → Pages als Source „GitHub Actions“ wählen.

Der Grundpfad kommt aus der Umgebungsvariable `BASE_PATH`. Lokal bleibt sie leer. Zum Nachstellen des Pages-Builds unter Windows (Git Bash):

```
MSYS_NO_PATHCONV=1 BASE_PATH=/Sinners-and-Saints-PnP npm run build
```

## Aufbau

- `src/lib/engine`: der Regelkern. Er besteht aus reinem TypeScript und ist die einzige Testgrenze. `computeView` berechnet die Ansicht, `applyAction` wendet eine Aktion an.
- `src/lib/ruleData`: die Regeldaten. Jeder Eintrag verweist auf seine Quelle im `Regelwerk/`.
- `src/lib/storage`: die Speicherung der Charaktere in IndexedDB.
- `src/routes`: die Oberfläche. Sie enthält keine Regellogik.
