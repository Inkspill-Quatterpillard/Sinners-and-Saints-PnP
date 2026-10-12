<script lang="ts">
	import '../app.css';
	import { t } from '$lib/texts';

	let { children } = $props();

	// Service Worker registrieren, damit die App nach dem ersten Laden offline läuft.
	$effect(() => {
		if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
	});
</script>

<svelte:head>
	<title>{t.appTitle} – {t.appSubtitle}</title>
	<link rel="icon" href="/icon.svg" />
	<meta name="theme-color" content="#1b1a1f" />
</svelte:head>

<header class="no-print">
	<a href="/" class="brand">{t.appTitle} <span>{t.appSubtitle}</span></a>
	<a href="/nachschlagen" class="nav">{t.lookup.nav}</a>
</header>

<main>
	{@render children()}
</main>

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
	main {
		max-width: 48rem;
		margin: 0 auto;
		padding: 1rem;
	}
</style>
