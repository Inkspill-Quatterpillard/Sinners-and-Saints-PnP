<script lang="ts">
	import TraitChoice from '$lib/components/TraitChoice.svelte';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const step = $derived(view.originStep);
</script>

<p class="intro">{t.origin.intro}</p>

{#if !view.options.optionalRules.besondereHerkunft}
	<p>{t.origin.disabled}</p>
{:else}
	<fieldset>
		<legend>{t.origin.choice}</legend>
		<label class="check">
			<input
				type="radio"
				name="origin-choice"
				checked={step.choice === 'origin'}
				onchange={() => dispatch({ type: 'chooseOriginOrStunt', choice: 'origin' })}
			/>
			{t.origin.takeOrigin}
		</label>
		<label class="check">
			<input
				type="radio"
				name="origin-choice"
				checked={step.choice === 'stunt'}
				onchange={() => dispatch({ type: 'chooseOriginOrStunt', choice: 'stunt' })}
			/>
			{t.origin.takeStunt}
		</label>
	</fieldset>

	{#if step.choice === 'origin'}
		<label>
			{t.origin.origin}
			<select value={step.selected ?? ''} onchange={(e) => dispatch({ type: 'chooseOrigin', origin: e.currentTarget.value })}>
				<option value="" disabled>–</option>
				{#each ruleData.origins as origin (origin.id)}
					<option value={origin.id}>{origin.number}. {origin.name}</option>
				{/each}
			</select>
		</label>

		{#if step.trait}
			<TraitChoice trait={step.trait} {dispatch} skills={view.skills} />
			{#each step.abilities as ability (ability.name)}
				<article>
					<h4>{ability.name}</h4>
					<p>{ability.text}</p>
				</article>
			{/each}
			{#if step.note}<p class="note">{step.note}</p>{/if}
		{/if}
	{/if}
{/if}

<style>
	.intro,
	.note {
		color: var(--muted);
	}
	fieldset {
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		display: grid;
		gap: 0.3rem;
		margin-bottom: 1rem;
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	label {
		margin-bottom: 0.8rem;
	}
	article {
		border-left: 3px solid var(--line);
		padding-left: 0.8rem;
		margin-bottom: 0.6rem;
	}
	article h4 {
		margin: 0;
	}
	article p {
		margin: 0.2rem 0 0;
		font-size: 0.92rem;
	}
</style>
