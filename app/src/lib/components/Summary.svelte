<script lang="ts">
	import type { CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view }: { view: CharacterView } = $props();
</script>

<aside>
	<h2>{t.summary}</h2>
	<dl class="attrs">
		{#each ruleData.attributes as attr (attr.id)}
			{@const a = view.attributes[attr.id]}
			<div title={a.modifiers.map((m) => `${m.source}: ${m.value > 0 ? '+' : ''}${m.value}`).join('\n')}>
				<dt>{attr.id}</dt>
				<dd>{a.effective ?? '–'}</dd>
			</div>
		{/each}
	</dl>
	<dl class="attrs secondary">
		{#each ruleData.secondary.secondaryAttributes as def (def.key)}
			<div title={def.name}>
				<dt>{def.short}</dt>
				<dd>{view.secondary[def.key].value ?? '–'}</dd>
			</div>
		{/each}
	</dl>
</aside>

<style>
	aside {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
	}
	h2 {
		font-size: 1rem;
		margin: 0 0 0.5rem;
	}
	.attrs {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.4rem;
		margin: 0;
	}
	.secondary {
		margin-top: 0.7rem;
		padding-top: 0.6rem;
		border-top: 1px solid var(--line);
	}
	.attrs div {
		text-align: center;
	}
	dt {
		color: var(--muted);
		font-size: 0.8rem;
	}
	dd {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
</style>
