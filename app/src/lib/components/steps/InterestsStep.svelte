<script lang="ts">
	import PointsControl from '$lib/components/PointsControl.svelte';
	import SkillName from '$lib/components/SkillName.svelte';
	import { INTERESTS_SOURCE, STATUS_TARGET, type Action, type CharacterView, type SkillView } from '$lib/engine';
	import { skillOrigin } from '$lib/format';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const step = $derived(view.interestsStep);
	const skills = $derived(
		view.skills
			.filter((s) => s.category === 'general' && !(s.needsSpecialization && !s.specialization))
			.sort((a, b) => a.name.localeCompare(b.name, 'de'))
	);
	const left = $derived(Math.max(0, step.remaining ?? 0));

	function set(target: string, points: number) {
		dispatch({ type: 'setInterestPoints', target, points: Math.max(0, points) });
	}
</script>

{#snippet row(key: string, value: number | undefined, label: string, skill?: SkillView)}
	{@const points = step.points[key] ?? 0}
	<li class:has={points > 0}>
		<span class="name">
			{#if skill}<SkillName {skill} />{:else}{label}{/if}
			{#if skill}<small>{skillOrigin(skill, INTERESTS_SOURCE)}</small>{/if}
		</span>
		<span class="value">{value ?? '–'}</span>
		<PointsControl {label} value={points} max={points + left} onchange={(n) => set(key, n)} />
	</li>
{/snippet}

<p class="intro">{t.interests.intro}</p>

<h3>{t.interests.basis}</h3>
<div class="cards">
	{#each ['KLU', 'INT'] as const as attr (attr)}
		<button
			type="button"
			class="card"
			class:selected={step.basis === attr}
			aria-pressed={step.basis === attr}
			onclick={() => dispatch({ type: 'setInterestBasis', attribute: attr })}
		>
			<strong>2 × {attr}</strong>
			<small>{t.interests.basisPoints(view.attributes[attr].effective)}</small>
		</button>
	{/each}
</div>

{#if step.total === undefined}
	<p>{t.interests.needsAttributes}</p>
{:else}
	<p class="counter" class:over={(step.remaining ?? 0) < 0}>{t.interests.remaining(step.remaining!, step.total)}</p>
	<ul class="targets">
		{@render row(STATUS_TARGET, view.socialStatus.value, t.interests.status)}
		{#each skills as s (s.key)}
			{@render row(s.key, s.value, s.name, s)}
		{/each}
	</ul>
{/if}

<style>
	.intro,
	small {
		color: var(--muted);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
		gap: 0.5rem;
		margin-bottom: 0.8rem;
	}
	.card {
		display: grid;
		gap: 0.15rem;
		text-align: left;
		padding: 0.6rem 0.8rem;
	}
	.card.selected {
		border-color: var(--accent);
		color: var(--accent);
	}
	.counter {
		position: sticky;
		top: 0;
		background: var(--bg);
		padding: 0.4rem 0;
		font-weight: 600;
		z-index: 1;
	}
	.counter.over {
		color: var(--danger);
	}
	.targets {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 0.2rem;
	}
	.targets li {
		display: grid;
		grid-template-columns: 1fr 2.5rem auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.15rem 0;
		border-bottom: 1px solid var(--line);
	}
	.name {
		display: grid;
	}
	.name small {
		font-size: 0.8rem;
	}
	.targets li.has .name :global(.term) {
		color: var(--accent);
	}
	.value {
		text-align: right;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
</style>
