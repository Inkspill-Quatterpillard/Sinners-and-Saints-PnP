<script lang="ts">
	import { parseManualDice, rollDice } from '$lib/dice';
	import type { Roll } from '$lib/engine';
	import { t } from '$lib/texts';

	interface Props {
		/** Anzahl und Art der Würfel, z. B. 4 und 6 für 4W6. */
		count: number;
		sides: number;
		roll?: Roll;
		onroll: (roll: Roll) => void;
	}

	let { count, sides, roll, onroll }: Props = $props();

	let editing = $state(false);
	let text = $state('');
	const parsed = $derived(parseManualDice(text, count, sides));

	function submitManual(event: SubmitEvent) {
		event.preventDefault();
		if (!parsed) return;
		onroll(parsed);
		editing = false;
		text = '';
	}
</script>

<span class="dice">
	{#if roll}
		<span class="result" title={roll.source === 'app' ? t.dice.rolledByApp : t.dice.enteredManually}>
			{roll.dice.join(' · ')}
			<span class="badge">{roll.source === 'app' ? t.dice.appBadge : t.dice.manualBadge}</span>
		</span>
	{/if}
	{#if editing}
		<form onsubmit={submitManual}>
			<input
				bind:value={text}
				placeholder={t.dice.manualPlaceholder(count, sides)}
				aria-label={t.dice.manualLabel(count, sides)}
				size="10"
			/>
			<button type="submit" disabled={!parsed}>{t.dice.apply}</button>
			<button type="button" onclick={() => (editing = false)}>{t.dice.cancel}</button>
		</form>
	{:else}
		<button type="button" onclick={() => onroll(rollDice(count, sides))}>{t.dice.roll(count, sides)}</button>
		<button type="button" onclick={() => (editing = true)}>{t.dice.enter}</button>
	{/if}
</span>

<style>
	.dice {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
	}
	form {
		display: inline-flex;
		gap: 0.3rem;
	}
	.result {
		font-variant-numeric: tabular-nums;
	}
	.badge {
		font-size: 0.75em;
		color: var(--muted);
		border: 1px solid var(--line);
		border-radius: 0.3rem;
		padding: 0 0.3rem;
		margin-left: 0.2rem;
	}
	button {
		padding: 0.2rem 0.55rem;
		font-size: 0.9em;
	}
</style>
