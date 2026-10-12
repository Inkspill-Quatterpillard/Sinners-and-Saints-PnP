<script lang="ts">
	import { STATUS_TARGET, type Action, type CharacterView } from '$lib/engine';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const step = $derived(view.interestsStep);
	const targets = $derived([
		{ key: STATUS_TARGET, name: t.interests.status, value: view.socialStatus.value as number | undefined },
		...view.skills
			.filter((s) => s.category === 'general' && !(s.needsSpecialization && !s.specialization))
			.map((s) => ({ key: s.key, name: s.name, value: s.value }))
	]);

	function set(target: string, points: number) {
		dispatch({ type: 'setInterestPoints', target, points: Math.max(0, points) });
	}
</script>

<p class="intro">{t.interests.intro}</p>

<fieldset>
	<legend>{t.interests.basis}</legend>
	{#each ['KLU', 'INT'] as const as attr (attr)}
		<label class="check">
			<input
				type="radio"
				name="interest-basis"
				checked={step.basis === attr}
				onchange={() => dispatch({ type: 'setInterestBasis', attribute: attr })}
			/>
			{t.interests.basisOption(attr, view.attributes[attr].effective)}
		</label>
	{/each}
</fieldset>

{#if step.total === undefined}
	<p>{t.interests.needsAttributes}</p>
{:else}
	<p class="counter" class:over={(step.remaining ?? 0) < 0}>{t.interests.remaining(step.remaining!, step.total)}</p>
	<ul class="targets">
		{#each targets as target (target.key)}
			{@const points = step.points[target.key] ?? 0}
			<li class:has={points > 0}>
				<span class="name">{target.name}</span>
				<span class="value">{target.value ?? '–'}</span>
				<span class="ctrl">
					<button aria-label={t.interests.less(target.name)} disabled={points === 0} onclick={() => set(target.key, points - 1)}
						>−</button
					>
					<input
						type="number"
						min="0"
						inputmode="numeric"
						aria-label={t.interests.points(target.name)}
						value={points}
						oninput={(e) => set(target.key, Math.floor(Number(e.currentTarget.value) || 0))}
					/>
					<button aria-label={t.interests.more(target.name)} onclick={() => set(target.key, points + 1)}>+</button>
				</span>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.intro {
		color: var(--muted);
	}
	fieldset {
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		display: grid;
		gap: 0.3rem;
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: center;
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
	.targets li.has .name {
		color: var(--accent);
	}
	.value {
		text-align: right;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.ctrl {
		display: flex;
		gap: 0.25rem;
	}
	.ctrl input {
		width: 3.2rem;
		text-align: center;
		padding: 0.2rem;
	}
	.ctrl button {
		padding: 0.2rem 0.6rem;
	}
</style>
