import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			// Die Registrierung übernimmt das Layout selbst.
			injectRegister: false,
			base: '/',
			scope: '/',
			manifest: {
				name: 'Sinners and Saints – Charaktere',
				short_name: 'SnS Charaktere',
				lang: 'de',
				start_url: '/',
				display: 'standalone',
				background_color: '#1b1a1f',
				theme_color: '#1b1a1f',
				icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
			},
			// Die Fallback-Seite des statischen Adapters muss mit in den Offline-Cache.
			kit: { adapterFallback: 'index.html', spa: true },
			devOptions: { enabled: false }
		})
	],
	test: {
		include: ['src/**/*.test.ts']
	}
});
