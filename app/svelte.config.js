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
		adapter: adapter({ fallback: 'index.html' })
	}
};

export default config;
