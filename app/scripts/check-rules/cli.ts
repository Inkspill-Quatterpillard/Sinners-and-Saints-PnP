// Prüfskript: vergleicht die Regeldaten der App mit den gut strukturierten Teilen des Regelwerks.
// Aufruf: npm run check-rules  (Fehlercode 1 bei Abweichungen; vorläufige Einträge nur als Warnung)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareCharacteristics, compareEquipment, compareSkills, compareStatus, compareStunts, type Diff } from './compare.ts';
import { parseCharacteristics, parseMarkdownTables, parseSkillList, parseStatusTable, parseStunts } from './parse.ts';

const here = dirname(fileURLToPath(import.meta.url));
const rulebook = join(here, '../../../Regelwerk');
const dataDir = join(here, '../../src/lib/ruleData/data');

const md = (path: string) => readFileSync(join(rulebook, path), 'utf8');
const json = (file: string) => JSON.parse(readFileSync(join(dataDir, file), 'utf8'));

const equipment = json('ausruestung.json').items;
const EQUIPMENT_FILES: [string, string][] = [
	['Ausrüstung/Liste_der_Nahkampfwaffen.md', 'standard'],
	['Ausrüstung/Liste_der_Fernkampfwaffen.md', 'standard'],
	['Ausrüstung/Liste_der_Rüstungen_und_Schilde.md', 'standard'],
	['Ausrüstung/Liste_von_Ausrüstungsgegenständen.md', 'standard'],
	['Ausrüstung/Liste_der_Nahkampfwaffen_(Fallout).md', 'fallout'],
	['Ausrüstung/Liste_der_Fernkampfwaffen_(Fallout).md', 'fallout'],
	['Ausrüstung/Liste_der_Rüstungen_und_Schilde_(Fallout).md', 'fallout'],
	['Ausrüstung/Liste_von_Ausrüstungsgegenständen_(Fallout).md', 'fallout']
];

const diffs: Diff[] = [
	...compareSkills(
		'Fertigkeiten',
		parseSkillList(md('Charaktererstellung/Liste_der_Fertigkeiten.md')),
		json('fertigkeiten.json').skills
	),
	...compareSkills(
		'Heldenfertigkeiten',
		parseSkillList(md('Charaktererstellung/Liste_der_Heldenfertigkeiten.md')),
		json('heldenfertigkeiten.json').heroSkills
	),
	...compareStatus(parseStatusTable(md('Charaktererstellung/Ausstattung.md')), json('status.json').stages),
	...compareCharacteristics(
		parseCharacteristics(md('Charaktererstellung/Charakteristik.md')),
		json('charakteristiken.json').characteristics
	),
	...compareStunts(parseStunts(md('Charaktererstellung/Kunststücke.md')), json('kunststuecke.json').stunts),
	// Je Setting alle Tabellen gemeinsam vergleichen, damit Einträge nicht doppelt als „fehlt“ gemeldet werden.
	...['standard', 'fallout'].flatMap((setting) =>
		compareEquipment(
			`Ausrüstung (${setting})`,
			setting,
			EQUIPMENT_FILES.filter(([, s]) => s === setting).flatMap(([file]) => parseMarkdownTables(md(file))),
			equipment
		)
	)
];

const errors = diffs.filter((d) => !d.provisional);
const warnings = diffs.filter((d) => d.provisional);
const show = (d: Diff) => `  ${d.area} · ${d.entry} · ${d.field}\n      Regelwerk:  ${d.rulebook}\n      Regeldaten: ${d.data}`;

if (warnings.length) console.log(`Warnungen (vorläufige Einträge): ${warnings.length}\n${warnings.map(show).join('\n')}\n`);
if (errors.length) {
	console.log(`Abweichungen: ${errors.length}\n${errors.map(show).join('\n')}`);
	process.exit(1);
}
console.log('Regeldaten und Regelwerk stimmen überein.');
