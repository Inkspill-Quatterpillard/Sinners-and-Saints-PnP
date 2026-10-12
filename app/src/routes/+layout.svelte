<script lang="ts">
	import { base } from '$app/paths';
	import '../app.css';
	import { t } from '$lib/texts';

	let { children } = $props();

	// Service Worker registrieren, damit die App nach dem ersten Laden offline läuft.
	// Übernimmt eine neue Version, lädt die Seite neu, damit nicht die alte weiterläuft.
	// Jede Änderung ist sofort gespeichert, beim Neuladen geht also nichts verloren.
	$effect(() => {
		if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
		const hadController = !!navigator.serviceWorker.controller;
		let reloading = false;
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			if (!hadController || reloading) return;
			reloading = true;
			location.reload();
		});
		navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).then((r) => r.update());
	});
</script>

<svelte:head>
	<title>{t.appTitle} – {t.appSubtitle}</title>
	<link rel="icon" href="{base}/icon.svg" />
	<meta name="theme-color" content="#1b1a1f" />
</svelte:head>

<header class="no-print">
	<a href="{base}/" class="brand">{t.appTitle} <span>{t.appSubtitle}</span></a>
	<a href="{base}/nachschlagen" class="nav">{t.lookup.nav}</a>
</header>

<main>
	{@render children()}
</main>

<footer class="no-print">
	<a href="{base}/THIRD-PARTY-LICENSES.txt" data-sveltekit-reload>{t.licenses}</a>
</footer>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--line);
	}
	.brand {
		color: var(--accent);
		font-weight: 700;
		text-decoration: none;
	}
	.brand span {
		color: var(--muted);
		font-weight: 400;
	}
	footer {
		max-width: 48rem;
		margin: 2rem auto 0;
		padding: 1rem;
		border-top: 1px solid var(--line);
		font-size: 0.85rem;
	}
	footer a {
		color: var(--muted);
	}
	main {
		max-width: 48rem;
		margin: 0 auto;
		padding: 1rem;
	}
</style>
