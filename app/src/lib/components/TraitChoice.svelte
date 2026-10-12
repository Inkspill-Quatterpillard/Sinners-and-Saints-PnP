<script lang="ts">
	import type { Action, SkillView, TraitView } from '$lib/engine';
	import { t } from '$lib/texts';

	interface Props {
		trait: TraitView;
		dispatch: (a: Action) => void;
		/** Für Effekte wie „+2 auf eine beliebige Fertigkeit“. */
		skills?: SkillView[];
	}

	let { trait, dispatch, skills = [] }: Props = $props();

	const choosable = $derived(
		trait.skillChoice
			? skills.filter(
					(s) =>
						!(s.needsSpecialization && !s.specialization) && (trait.skillChoice!.includeHeroSkills || s.category === 'general')
				)
			: []
	);
</script>

<article class:invalid={!!trait.invalid}>
	<h4>{trait.name}</h4>
	<p class="text">{trait.text}</p>
	{#if trait.options}
		<fieldset>
			<legend>{t.traits.choose}</legend>
			{#each trait.options as option (option.id)}
				<label class="check">
					<input
						type="radio"
						name="trait-{trait.id}"
						checked={trait.chosenOption === option.id}
						onchange={() => dispatch({ type: 'chooseTraitOption', trait: trait.id, option: option.id })}
					/>
					<span
						>{option.name}{#if option.text}<small class="option-text">{option.text}</small>{/if}</span
					>
				</label>
			{/each}
		</fieldset>
	{/if}
	{#if trait.tiedAttributes && trait.chosenOption}
		<fieldset>
			<legend>{t.traits.tied}</legend>
			{#each trait.tiedAttributes as attr (attr)}
				<label class="check">
					<input
						type="radio"
						name="trait-attr-{trait.id}"
						checked={trait.chosenAttribute === attr}
						onchange={() => dispatch({ type: 'chooseTraitAttribute', trait: trait.id, attribute: attr })}
					/>
					{attr}
				</label>
			{/each}
		</fieldset>
	{/if}
	{#if trait.skillChoice}
		<label>
			{t.traits.skill(trait.skillChoice.value)}
			<select
				value={trait.skillChoice.chosen ?? ''}
				onchange={(e) => dispatch({ type: 'chooseTraitSkill', trait: trait.id, skill: e.currentTarget.value })}
			>
				<option value="" disabled>–</option>
				{#if trait.skillChoice.chosen && !choosable.some((s) => s.key === trait.skillChoice!.chosen)}
					<option value={trait.skillChoice.chosen}>{trait.skillChoice.chosen}</option>
				{/if}
				{#each choosable as s (s.key)}
					<option value={s.key}>{s.name} ({s.value ?? '–'})</option>
				{/each}
			</select>
		</label>
	{/if}
</article>

<style>
	article {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.6rem 0.9rem;
		margin-bottom: 0.7rem;
	}
	article.invalid {
		border-color: var(--danger);
	}
	h4 {
		margin: 0 0 0.3rem;
	}
	.text {
		color: var(--muted);
		font-size: 0.92rem;
		margin: 0 0 0.5rem;
	}
	fieldset {
		border: none;
		padding: 0;
		margin: 0 0 0.4rem;
		display: grid;
		gap: 0.3rem;
	}
	legend {
		font-weight: 600;
		margin-bottom: 0.2rem;
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
	}
	.check input {
		margin-top: 0.3rem;
	}
	.option-text {
		display: block;
		color: var(--muted);
		font-size: 0.88rem;
	}
</style>
