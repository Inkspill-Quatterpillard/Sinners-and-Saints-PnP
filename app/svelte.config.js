import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: true
	},
	kit: {
		// Reine Client-App: Eine Fallback-Seite übernimmt alle Routen, damit die App offline läuft.
		adapter: adapter({ fallback: 'index.html' }),
		// Auf GitHub Pages liegt die App unter /<Repo-Name>; lokal unter /.
		paths: { base: process.env.BASE_PATH ?? '' }
	}
};

export default config;
