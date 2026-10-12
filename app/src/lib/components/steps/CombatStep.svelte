<script lang="ts">
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';
	import { roman } from '$lib/format';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const step = $derived(view.combatStep);
	const unlocked = $derived(step.skills.filter((s) => s.allowed > 0));
	const anyStyle = $derived(step.styleAllowed.melee || step.styleAllowed.ranged);
</script>

<p class="intro">{t.combat.intro}</p>

<h3>{t.combat.techniques}</h3>
{#if unlocked.length === 0}
	<p>{t.combat.noTechniques}</p>
{/if}
{#each unlocked as skill (skill.skill)}
	{@const techniques = ruleData.combat.techniques.filter((x) => x.skill === skill.skill)}
	<details open={skill.chosen.length > 0}>
		<summary>
			<strong>{skill.name}</strong> ({skill.value}) · {t.combat.unlocked(
				skill.chosen.length,
				skill.allowed,
				roman(skill.maxTier)
			)}
		</summary>
		{#each [1, 2, 3] as tier (tier)}
			<h4 class:locked={tier > skill.maxTier}>{t.combat.tier(roman(tier))}</h4>
			{#each techniques.filter((x) => x.tier === tier) as tech (tech.id)}
				{@const chosen = skill.chosen.includes(tech.id)}
				<label class="tech" class:chosen class:locked={tier > skill.maxTier}>
					<input
						type="checkbox"
						checked={chosen}
						disabled={!chosen && (tier > skill.maxTier || skill.chosen.length >= skill.allowed)}
						onchange={() => dispatch({ type: 'toggleTechnique', technique: tech.id })}
					/>
					<span>
						<strong>{tech.name}</strong>
						<small>{[tech.kind, tech.hands].filter(Boolean).join(' · ')}</small>
						{#if tech.flavor}<em>{tech.flavor}</em>{/if}
						<span class="text">{tech.text}</span>
					</span>
				</label>
			{/each}
		{/each}
	</details>
{/each}

<h3>{t.combat.style}</h3>
<p class="hint">{t.combat.styleHint(ruleData.combat.styleUnlock.from)}</p>
{#if !anyStyle && !step.style}
	<p>{t.combat.noStyle}</p>
{:else}
	<label class="tech">
		<input type="radio" name="style" checked={!step.style} onchange={() => dispatch({ type: 'chooseStyle', style: undefined })} />
		<span>{t.combat.noStyleChoice}</span>
	</label>
	{#each ruleData.combat.styles as style (style.id)}
		{@const allowed = step.styleAllowed[style.kind]}
		{#if allowed || step.style === style.id}
			<label class="tech" class:chosen={step.style === style.id}>
				<input
					type="radio"
					name="style"
					checked={step.style === style.id}
					onchange={() => dispatch({ type: 'chooseStyle', style: style.id })}
				/>
				<span>
					<strong>{style.name}</strong>
					<small>{style.kind === 'melee' ? t.combat.melee : t.combat.ranged}</small>
					<span class="text">{style.text}</span>
				</span>
			</label>
		{/if}
	{/each}
{/if}

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
	summary {
		cursor: pointer;
	}
	h4 {
		margin: 0.8rem 0 0.2rem;
	}
	h4.locked {
		color: var(--muted);
	}
	.tech {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
		padding: 0.4rem 0;
		border-bottom: 1px solid var(--line);
	}
	.tech input {
		margin-top: 0.3rem;
	}
	.tech span {
		display: grid;
		gap: 0.1rem;
	}
	.tech small,
	.tech em {
		color: var(--muted);
	}
	.tech.chosen strong {
		color: var(--accent);
	}
	.tech.locked {
		opacity: 0.55;
	}
	.text {
		font-size: 0.92rem;
	}
</style>
