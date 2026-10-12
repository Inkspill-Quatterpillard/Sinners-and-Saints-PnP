<script lang="ts">
	import RuleText from '$lib/components/RuleText.svelte';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const learned = $derived(view.magicStep.disciplines.filter((x) => x.basics.length > 0 || x.contingent.total > 0));
</script>

<p class="intro">{t.magic.intro}</p>

{#if learned.length === 0}
	<p>{t.magic.none}</p>
{/if}

{#each learned as d (d.skill)}
	{@const spells = ruleData.magic.spells.filter((s) => s.skill === d.skill)}
	{@const c = d.contingent}
	<details open>
		<summary>
			<strong>{d.name}</strong> ({d.value}) · {t.magic.contingent(d.chosen.length, c.total, c.maxTier, c.tier2, c.tier3)}
		</summary>
		{#if d.basics.length}
			<h4>{t.magic.basics}</h4>
			{#each spells.filter((s) => s.tier === 0) as s (s.id)}
				<div class="spell basic">
					<strong>{s.name}</strong>
					<RuleText text={s.text} />
				</div>
			{/each}
		{/if}
		{#each [1, 2, 3] as tier (tier)}
			{@const list = spells.filter((s) => s.tier === tier)}
			{#if list.length}
				<h4 class:locked={tier > c.maxTier}>{t.magic.tier(tier)}</h4>
				{#each list as s (s.id)}
					{@const chosen = d.chosen.includes(s.id)}
					<details class="spell" class:chosen class:locked={tier > c.maxTier}>
						<summary>
							<input
								type="checkbox"
								aria-label={s.name}
								checked={chosen}
								disabled={!chosen && !d.selectable.includes(s.id)}
								onchange={() => dispatch({ type: 'toggleSpell', spell: s.id })}
								onclick={(e) => e.stopPropagation()}
							/>
							<strong>{s.name}</strong>{s.kind ? ` · ${s.kind}` : ''}
						</summary>
						<RuleText text={s.text} />
					</details>
				{/each}
			{/if}
		{/each}
	</details>
{/each}

<p class="hint">{t.magic.provisional}</p>

<style>
	.intro,
	.hint {
		color: var(--muted);
	}
	details {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.5rem 0.8rem;
		margin-bottom: 0.6rem;
	}
	details.spell {
		background: var(--bg);
		margin-bottom: 0.3rem;
	}
	details.spell.chosen > summary strong {
		color: var(--accent);
	}
	details.spell.locked {
		opacity: 0.55;
	}
	summary {
		cursor: pointer;
	}
	h4 {
		margin: 0.8rem 0 0.3rem;
	}
	h4.locked {
		color: var(--muted);
	}
	.spell.basic {
		border-left: 3px solid var(--accent);
		padding-left: 0.7rem;
	}
</style>
