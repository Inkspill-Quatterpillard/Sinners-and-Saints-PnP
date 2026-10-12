import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Schreibt beim Build `THIRD-PARTY-LICENSES.txt` mit den Lizenzen aller Pakete, deren Code in der
 * App landet. Die Pakete stammen aus den gebauten Modulen; die Workbox-Pakete des Service Workers
 * baut vite-pwa getrennt, sie stehen deshalb fest in `extra`.
 */
export function thirdPartyLicenses(extra: string[]): Plugin {
	const packages = new Set<string>(extra);
	return {
		name: 'third-party-licenses',
		apply: 'build',
		moduleParsed(info) {
			const match = info.id.replace(/\\/g, '/').match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)\//);
			if (match) packages.add(match[1]);
		},
		generateBundle() {
			if (this.environment?.config.consumer !== 'client') return;
			const sections = [...packages].sort().map((name) => {
				const dir = join('node_modules', name);
				const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
				const file = existsSync(dir) ? readdirSync(dir).find((f) => /^(licen[cs]e|copying)(\.|$)/i.test(f)) : undefined;
				const text = file ? readFileSync(join(dir, file), 'utf-8').trim() : `License: ${pkg.license}`;
				return `${name} ${pkg.version} (${pkg.license})\n${'-'.repeat(60)}\n${text}`;
			});
			this.emitFile({
				type: 'asset',
				fileName: 'THIRD-PARTY-LICENSES.txt',
				// Mit BOM, damit Browser die Datei auch ohne Zeichensatz-Angabe des Servers als UTF-8 lesen.
				source: `\uFEFFSinners and Saints – Charakter-App\nLizenzen der enthaltenen Fremdpakete\n\n${sections.join('\n\n\n')}\n`
			});
		}
	};
}
