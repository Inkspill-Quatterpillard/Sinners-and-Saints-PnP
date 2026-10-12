<script lang="ts">
	import TraitChoice from '$lib/components/TraitChoice.svelte';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const selected = $derived(ruleData.religions.find((r) => r.id === view.religionStep.selected));
</script>

<p class="intro">{t.religion.intro}</p>

<label>
	{t.religion.choose}
	<select
		value={view.religionStep.selected ?? ''}
		onchange={(e) => dispatch({ type: 'chooseReligion', religion: e.currentTarget.value })}
	>
		<option value="" disabled>–</option>
		{#each ruleData.religions as religion (religion.id)}
			<option value={religion.id}>{religion.name} – {religion.blessing}</option>
		{/each}
	</select>
</label>

{#if selected && view.religionStep.trait}
	<p class="description">{selected.description}</p>
	<TraitChoice trait={view.religionStep.trait} {dispatch} skills={view.skills} />
{/if}

<style>
	.intro,
	.description {
		color: var(--muted);
	}
	label {
		max-width: 28rem;
		margin-bottom: 0.8rem;
	}
</style>
