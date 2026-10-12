<script lang="ts">
	import TraitChoice from '$lib/components/TraitChoice.svelte';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const formatModifiers = (mods: Record<string, number | undefined>) =>
		Object.entries(mods)
			.map(([attr, v]) => `${v! > 0 ? '+' : '−'}${Math.abs(v!)} ${attr}`)
			.join(', ');
</script>

<p class="intro">{t.species.intro}</p>

<div class="choices">
	{#each ruleData.species as species (species.id)}
		<label class="card" class:selected={view.speciesStep.selected === species.id}>
			<input
				type="radio"
				name="species"
				checked={view.speciesStep.selected === species.id}
				onchange={() => dispatch({ type: 'chooseSpecies', species: species.id })}
			/>
			<strong>{species.name}</strong>
			<span>{formatModifiers(species.attributeModifiers)}</span>
			<small>{species.traits.map((tr) => tr.name).join(' · ')}</small>
		</label>
	{/each}
</div>

{#if view.speciesStep.traits.length}
	<h3>{t.species.traits}</h3>
	{#each view.speciesStep.traits as trait (trait.id)}
		<TraitChoice {trait} {dispatch} />
	{/each}
{/if}

<style>
	.intro {
		color: var(--muted);
	}
	.choices {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: 0.6rem;
	}
	.card {
		display: grid;
		gap: 0.2rem;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.6rem 0.8rem;
		cursor: pointer;
	}
	.card.selected {
		border-color: var(--accent);
	}
	.card input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.card small {
		color: var(--muted);
	}
</style>
