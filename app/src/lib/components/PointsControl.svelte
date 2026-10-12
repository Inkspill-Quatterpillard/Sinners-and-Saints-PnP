<script lang="ts">
	import { t } from '$lib/texts';

	/** Punkte mit − und + vergeben; die Grenzen kommen von außen (z. B. verbleibende Punkte). */
	interface Props {
		label: string;
		value: number;
		max: number;
		onchange: (value: number) => void;
	}

	let { label, value, max, onchange }: Props = $props();
</script>

<span class="points" role="group" aria-label={label}>
	<button type="button" aria-label={t.points.less(label)} disabled={value <= 0} onclick={() => onchange(value - 1)}>−</button>
	<output aria-live="polite">{value}</output>
	<button type="button" aria-label={t.points.more(label)} disabled={value >= max} onclick={() => onchange(value + 1)}>+</button>
</span>

<style>
	.points {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
	output {
		min-width: 1.8rem;
		text-align: center;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	button {
		min-width: 2.2rem;
		padding: 0.2rem 0.5rem;
	}
</style>
