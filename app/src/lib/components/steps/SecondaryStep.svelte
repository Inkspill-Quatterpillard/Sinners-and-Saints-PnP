<script lang="ts">
	import DiceInput from '$lib/components/DiceInput.svelte';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const sign = (v: number) => (v > 0 ? `+${v}` : `${v}`);
</script>

<p class="intro">{t.secondary.intro}</p>

<section class="luck">
	<h3>{t.secondary.luck}</h3>
	<p>{view.luck.advantage ? t.secondary.luckAdvantage : t.secondary.luckPlain}</p>
	<DiceInput
		count={view.luck.advantage ? 2 : 1}
		sides={ruleData.secondary.luckDie}
		roll={view.luck.roll}
		onroll={(roll) => dispatch({ type: 'rollLuck', roll })}
	/>
	{#if view.luck.roll && view.secondary.luck.value === undefined}
		<p class="hint">{t.secondary.luckNeedsSecondDie}</p>
	{/if}
</section>

<table>
	<thead>
		<tr><th>{t.secondary.value}</th><th>{t.secondary.formula}</th><th class="num">{t.secondary.result}</th></tr>
	</thead>
	<tbody>
		{#each ruleData.secondary.secondaryAttributes as def (def.key)}
			{@const v = view.secondary[def.key]}
			<tr>
				<td><strong>{def.short}</strong> {def.name}</td>
				<td class="formula">
					{def.formula}
					{#each v.modifiers as m, i (i)}
						<span class="mod">{sign(m.value)} {m.source}</span>
					{/each}
					{#if v.cap !== undefined}<span class="mod">{t.secondary.cap(v.cap)}</span>{/if}
				</td>
				<td class="num">{v.value ?? '–'}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.intro,
	.hint {
		color: var(--muted);
	}
	.luck {
		margin-bottom: 1rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		text-align: left;
		padding: 0.35rem 0.4rem;
		border-bottom: 1px solid var(--line);
		vertical-align: top;
	}
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.formula {
		color: var(--muted);
		font-size: 0.9rem;
	}
	.mod {
		display: block;
		color: var(--text);
	}
</style>
