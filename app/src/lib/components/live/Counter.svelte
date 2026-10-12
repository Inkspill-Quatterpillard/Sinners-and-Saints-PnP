<script lang="ts">
	import { t } from '$lib/texts';

	interface Props {
		label: string;
		short: string;
		value: number;
		max?: number;
		/** Ändert den aktuellen Wert um `delta`. */
		onchange: (delta: number) => void;
		/** Setzt den aktuellen Wert direkt. */
		onset: (value: number) => void;
		warn?: boolean;
	}

	let { label, short, value, max, onchange, onset, warn = false }: Props = $props();
	let editing = $state(false);
	let text = $state('');
</script>

<div class="counter" class:warn role="group" aria-label={label}>
	<span class="label">{short}</span>
	{#if editing}
		<form
			onsubmit={(e) => {
				e.preventDefault();
				const n = Number(text.replace(',', '.'));
				if (Number.isFinite(n)) onset(Math.round(n));
				editing = false;
			}}
		>
			<!-- svelte-ignore a11y_autofocus -->
			<input bind:value={text} inputmode="numeric" aria-label={t.live.setValue(label)} autofocus />
			<button type="submit">OK</button>
		</form>
	{:else}
		<button class="value" title={t.live.tapToSet} onclick={() => ((text = String(value)), (editing = true))}>
			{value}{#if max !== undefined}<small>/{max}</small>{/if}
		</button>
	{/if}
	<span class="buttons">
		<button aria-label={t.live.minus(label)} onclick={() => onchange(-1)}>−</button>
		<button aria-label={t.live.plus(label)} onclick={() => onchange(1)}>+</button>
	</span>
</div>

<style>
	.counter {
		display: grid;
		justify-items: center;
		gap: 0.2rem;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.6rem;
		padding: 0.5rem 0.3rem;
	}
	.counter.warn {
		border-color: var(--warn);
	}
	.label {
		color: var(--muted);
		font-size: 0.8rem;
		font-weight: 600;
	}
	.value {
		background: none;
		border: none;
		font-size: 1.8rem;
		font-weight: 700;
		padding: 0;
		font-variant-numeric: tabular-nums;
	}
	.value small {
		font-size: 0.9rem;
		color: var(--muted);
		font-weight: 400;
	}
	.buttons {
		display: flex;
		gap: 0.3rem;
	}
	.buttons button {
		min-width: 2.4rem;
		font-size: 1.1rem;
		padding: 0.2rem 0.5rem;
	}
	form {
		display: flex;
		gap: 0.2rem;
	}
	form input {
		width: 3.5rem;
		text-align: center;
	}
</style>
