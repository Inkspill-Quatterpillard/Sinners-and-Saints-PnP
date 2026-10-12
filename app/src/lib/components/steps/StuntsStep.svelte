<script lang="ts">
	import type { Action, CharacterView } from '$lib/engine';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const step = $derived(view.stuntStep);
	let onlyAvailable = $state(true);
	let search = $state('');
	const shown = $derived(
		step.stunts.filter(
			(s) =>
				(s.chosen || !onlyAvailable || s.available) &&
				(!search || `${s.name} ${s.text}`.toLowerCase().includes(search.toLowerCase()))
		)
	);
	const tiers = $derived([...new Set(shown.map((s) => s.tier))].sort());
	const full = $derived(step.chosen.length >= step.allowed);
</script>

<p class="intro">{t.stunts.intro(step.allowed)}</p>
<p class="counter">{t.stunts.chosen(step.chosen.length, step.allowed)}</p>

<div class="filters">
	<label class="check"><input type="checkbox" bind:checked={onlyAvailable} /> {t.stunts.onlyAvailable}</label>
	<input type="search" placeholder={t.stunts.search} aria-label={t.stunts.search} bind:value={search} />
</div>

{#if shown.length === 0}
	<p>{t.stunts.none}</p>
{/if}

{#each tiers as tier (tier)}
	{@const list = shown.filter((s) => s.tier === tier)}
	<h3>{t.stunts.tier(tier, list[0].tierName)}</h3>
	{#each list as stunt (stunt.id)}
		<label class="stunt" class:chosen={stunt.chosen} class:unavailable={!stunt.available}>
			<input
				type="checkbox"
				checked={stunt.chosen}
				disabled={!stunt.chosen && (full || !stunt.available)}
				onchange={() => dispatch({ type: 'toggleStunt', stunt: stunt.id })}
			/>
			<span>
				<strong>{stunt.name}</strong>
				<small>{stunt.prerequisites.join(', ')}</small>
				{#if stunt.unmet.length}<small class="unmet">{t.stunts.unmet(stunt.unmet.join(', '))}</small>{/if}
				<span class="text">{stunt.text}</span>
			</span>
		</label>
	{/each}
{/each}

<style>
	.intro {
		color: var(--muted);
	}
	.counter {
		font-weight: 600;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
		align-items: center;
		margin-bottom: 0.8rem;
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.stunt {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--line);
	}
	.stunt input {
		margin-top: 0.3rem;
	}
	.stunt span {
		display: grid;
		gap: 0.1rem;
	}
	.stunt small {
		color: var(--muted);
	}
	.stunt .unmet {
		color: var(--danger);
	}
	.stunt.chosen strong {
		color: var(--accent);
	}
	.stunt.unavailable .text {
		opacity: 0.7;
	}
	.text {
		font-size: 0.92rem;
	}
</style>
