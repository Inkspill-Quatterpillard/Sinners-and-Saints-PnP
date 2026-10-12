<script lang="ts">
	import type { Action, TraitView } from '$lib/engine';
	import { t } from '$lib/texts';

	let { trait, dispatch }: { trait: TraitView; dispatch: (a: Action) => void } = $props();
</script>

<article class:invalid={!!trait.invalid}>
	<h4>{trait.name}</h4>
	<p class="text">{trait.text}</p>
	{#if trait.options}
		<fieldset>
			<legend>{t.traits.choose}</legend>
			{#each trait.options as option (option.id)}
				<label class="check">
					<input
						type="radio"
						name="trait-{trait.id}"
						checked={trait.chosenOption === option.id}
						onchange={() => dispatch({ type: 'chooseTraitOption', trait: trait.id, option: option.id })}
					/>
					{option.name}
				</label>
			{/each}
		</fieldset>
	{/if}
	{#if trait.tiedAttributes && trait.chosenOption}
		<fieldset>
			<legend>{t.traits.tied}</legend>
			{#each trait.tiedAttributes as attr (attr)}
				<label class="check">
					<input
						type="radio"
						name="trait-attr-{trait.id}"
						checked={trait.chosenAttribute === attr}
						onchange={() => dispatch({ type: 'chooseTraitAttribute', trait: trait.id, attribute: attr })}
					/>
					{attr}
				</label>
			{/each}
		</fieldset>
	{/if}
</article>

<style>
	article {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.6rem 0.9rem;
		margin-bottom: 0.7rem;
	}
	article.invalid {
		border-color: var(--danger);
	}
	h4 {
		margin: 0 0 0.3rem;
	}
	.text {
		color: var(--muted);
		font-size: 0.92rem;
		margin: 0 0 0.5rem;
	}
	fieldset {
		border: none;
		padding: 0;
		margin: 0 0 0.4rem;
		display: grid;
		gap: 0.3rem;
	}
	legend {
		font-weight: 600;
		margin-bottom: 0.2rem;
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
</style>
