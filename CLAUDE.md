# Sinners and Saints PnP

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## App

Der Code der Charakter-App liegt in `app/`. Befehle (`npm test`, `npm run check`, `npm run build`, `npm run preview`) stehen in `app/README.md`. Regellogik gehört nur in den Regelkern `app/src/lib/engine`, getestet über `computeView`/`applyAction`. Siehe `docs/adr/0002`.
