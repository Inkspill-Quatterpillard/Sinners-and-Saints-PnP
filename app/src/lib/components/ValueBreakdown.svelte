<script lang="ts">
	import type { Modifier } from '$lib/engine';
	import { t } from '$lib/texts';

	/** Wie sich ein Wert zusammensetzt: Grundwert, jeder Bonus und Malus mit Herkunft, Ergebnis. */
	let {
		label,
		base,
		baseLabel,
		modifiers,
		value
	}: {
		label: string;
		base: number;
		baseLabel: string;
		modifiers: Modifier[];
		value: number;
	} = $props();

	const signed = (v: number) => (v >= 0 ? `+${v}` : `−${-v}`);
</script>

<table class="breakdown" aria-label={t.breakdown(label)}>
	<tbody>
		<tr><td>{baseLabel}</td><td class="num">{base}</td></tr>
		{#each modifiers as m, i (i)}
			<tr><td>{m.source}</td><td class="num" class:minus={m.value < 0}>{signed(m.value)}</td></tr>
		{/each}
		<tr class="total"><td>{label}</td><td class="num">{value}</td></tr>
	</tbody>
</table>

<style>
	.breakdown {
		border-collapse: collapse;
		min-width: 14rem;
		margin: 0.3rem 0 0.6rem;
	}
	td {
		padding: 0.15rem 0.5rem 0.15rem 0;
		border-bottom: 1px solid var(--line);
	}
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.minus {
		color: var(--danger);
	}
	.total td {
		font-weight: 700;
		border-bottom: none;
	}
</style>
