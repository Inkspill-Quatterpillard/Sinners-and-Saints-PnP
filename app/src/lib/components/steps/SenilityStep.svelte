<script lang="ts">
	import DiceInput from '$lib/components/DiceInput.svelte';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();
</script>

<p class="intro">{t.senility.intro(ruleData.age.senilityStabilityLoss)}</p>

<ol class="rolls">
	{#each view.senility.rolls as roll (roll.index)}
		<li>
			<DiceInput
				count={1}
				sides={ruleData.age.senilityDie}
				roll={roll.roll}
				onroll={(r) => dispatch({ type: 'rollSenility', index: roll.index, roll: r })}
			/>
			{#if roll.success !== undefined}
				<span class:bad={roll.success}>{roll.success ? t.senility.lost(roll.target!) : t.senility.kept(roll.target!)}</span>
			{/if}
		</li>
	{/each}
</ol>
<p>{t.senility.result(view.secondary.stability.value)}</p>

<style>
	.intro {
		color: var(--muted);
	}
	.rolls {
		padding-left: 1.2rem;
		display: grid;
		gap: 0.5rem;
	}
	.rolls li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}
	.bad {
		color: var(--danger);
	}
</style>
