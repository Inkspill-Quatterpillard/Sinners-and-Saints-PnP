<script lang="ts">
	import { page } from '$app/state';
	import RuleText from '$lib/components/RuleText.svelte';
	import { buildLookup, searchLookup, type LookupArea } from '$lib/lookup';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	const entries = buildLookup(ruleData);
	const areas = Object.keys(t.lookup.areas) as LookupArea[];
	const LIMIT = 60;

	// Ein Link wie /nachschlagen?eintrag=spell:mystik:auraAnalysieren öffnet direkt diesen Eintrag.
	const linked = $derived(entries.find((e) => e.key === page.url.searchParams.get('eintrag')));
	let query = $state(page.url.searchParams.get('q') ?? '');
	let area = $state<LookupArea | ''>('');
	let setting = $state(ruleData.defaultSetting);
	let open = $state<string | undefined>();

	const results = $derived(query.trim() || area ? searchLookup(entries, query, { area: area || undefined, setting }) : []);
</script>

<p class="top">
	<!-- Zurück dorthin, woher man kam (z. B. lebender Bogen); ohne Verlauf zur Übersicht. -->
	<a href="/" onclick={(e) => history.length > 1 && (e.preventDefault(), history.back())}>← {t.back}</a>
</p>

<h1>{t.lookup.title}</h1>

{#if linked}
	<article class="entry linked">
		<h2>{linked.name}</h2>
		{#if linked.meta}<p class="meta">{t.lookup.areas[linked.area]} · {linked.meta}</p>{/if}
		<RuleText text={linked.text} />
		{#if linked.source}<p class="source">{t.lookup.source(linked.source.file, linked.source.section)}</p>{/if}
	</article>
{/if}

<input type="search" placeholder={t.lookup.search} aria-label={t.lookup.search} bind:value={query} />

<div class="filters">
	<div class="chips" role="group" aria-label={t.lookup.area}>
		<button class="chip" class:active={area === ''} aria-pressed={area === ''} onclick={() => (area = '')}>{t.lookup.all}</button>
		{#each areas as a (a)}
			<button class="chip" class:active={area === a} aria-pressed={area === a} onclick={() => (area = area === a ? '' : a)}
				>{t.lookup.areas[a]}</button
			>
		{/each}
	</div>
	<label>
		{t.options.setting}
		<select bind:value={setting}>
			{#each ruleData.settings as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
		</select>
	</label>
</div>

{#if !query.trim() && !area}
	<p class="hint">{t.lookup.hint}</p>
{:else if results.length === 0}
	<p>{t.lookup.none}</p>
{:else}
	<p class="hint">{t.lookup.count(results.length, LIMIT)}</p>
	<ul class="results">
		{#each results.slice(0, LIMIT) as e (e.key)}
			<li>
				<button class="head" aria-expanded={open === e.key} onclick={() => (open = open === e.key ? undefined : e.key)}>
					<strong>{e.name}</strong>
					<small>{t.lookup.areas[e.area]}{e.meta ? ` · ${e.meta}` : ''}</small>
				</button>
				{#if open === e.key}
					<div class="body">
						<RuleText text={e.text} />
						{#if e.source}<p class="source">{t.lookup.source(e.source.file, e.source.section)}</p>{/if}
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	input[type='search'] {
		width: 100%;
		box-sizing: border-box;
		margin-bottom: 0.6rem;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-items: end;
		margin-bottom: 0.6rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.chip {
		border-radius: 1rem;
		padding: 0.2rem 0.6rem;
		font-size: 0.88rem;
	}
	.chip.active {
		border-color: var(--accent);
		color: var(--accent);
	}
	.hint,
	.meta,
	.source,
	small {
		color: var(--muted);
	}
	.source {
		font-size: 0.8rem;
	}
	.results {
		list-style: none;
		padding: 0;
	}
	.results li {
		border-bottom: 1px solid var(--line);
	}
	.head {
		display: grid;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: 0.5rem 0;
	}
	.body {
		padding: 0 0 0.6rem;
	}
	.entry.linked {
		background: var(--surface);
		border: 1px solid var(--accent);
		border-radius: 0.6rem;
		padding: 0.6rem 0.9rem;
		margin-bottom: 1rem;
	}
	.entry h2 {
		margin: 0;
	}
</style>
