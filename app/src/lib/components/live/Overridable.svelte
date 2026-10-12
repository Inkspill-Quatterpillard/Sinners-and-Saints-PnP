<script lang="ts">
	import { t } from '$lib/texts';

	interface Props {
		label: string;
		value: number | undefined;
		/** Von Hand gesetzt? */
		overridden: boolean;
		onset: (value: number | undefined) => void;
	}

	let { label, value, overridden, onset }: Props = $props();
	let editing = $state(false);
	let text = $state('');
</script>

<div class="item" class:overridden>
	<dt>{label}</dt>
	<dd>
		{#if editing}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					const n = Number(text.replace(',', '.'));
					if (text.trim() && Number.isFinite(n)) onset(Math.round(n));
					editing = false;
				}}
			>
				<!-- svelte-ignore a11y_autofocus -->
				<input bind:value={text} inputmode="numeric" aria-label={t.live.override(label)} autofocus />
				<button type="submit">OK</button>
			</form>
		{:else}
			<button class="value" title={t.live.tapToOverride} onclick={() => ((text = String(value ?? '')), (editing = true))}
				>{value ?? '–'}</button
			>
			{#if overridden}
				<button
					class="reset"
					title={t.live.resetOverride}
					aria-label={t.live.resetOverrideOf(label)}
					onclick={() => onset(undefined)}>↺</button
				>
			{/if}
		{/if}
	</dd>
</div>

<style>
	.item {
		text-align: center;
	}
	dt {
		color: var(--muted);
		font-size: 0.8rem;
	}
	dd {
		margin: 0;
		display: flex;
		justify-content: center;
		gap: 0.2rem;
	}
	.value {
		background: none;
		border: none;
		padding: 0;
		font-size: 1.15rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.overridden .value {
		color: var(--accent);
	}
	.reset {
		padding: 0 0.3rem;
		font-size: 0.8rem;
	}
	form {
		display: flex;
		gap: 0.2rem;
	}
	form input {
		width: 3rem;
		text-align: center;
		padding: 0.1rem;
	}
	form button {
		padding: 0.1rem 0.4rem;
	}
</style>
