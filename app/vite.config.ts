import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vitest/config';

// Grundpfad, z. B. /Sinners-and-Saints-PnP auf GitHub Pages; lokal leer.
const base = process.env.BASE_PATH ?? '';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			// Die Registrierung übernimmt das Layout selbst.
			injectRegister: false,
			base: `${base}/`,
			scope: `${base}/`,
			manifest: {
				name: 'Sinners and Saints – Charaktere',
				short_name: 'SnS Charaktere',
				lang: 'de',
				start_url: `${base}/`,
				scope: `${base}/`,
				display: 'standalone',
				background_color: '#1b1a1f',
				theme_color: '#1b1a1f',
				icons: [{ src: `${base}/icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
			},
			// Die Fallback-Seite des statischen Adapters muss mit in den Offline-Cache.
			kit: { adapterFallback: 'index.html', spa: true },
			// Eine neue Version übernimmt sofort, das Layout lädt dann neu.
			workbox: { skipWaiting: true, clientsClaim: true },
			devOptions: { enabled: false }
		})
	],
	test: {
		include: ['src/**/*.test.ts', 'scripts/**/*.test.ts']
	}
});
