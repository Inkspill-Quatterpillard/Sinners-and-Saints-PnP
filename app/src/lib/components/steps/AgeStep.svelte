<script lang="ts">
	import DiceInput from '$lib/components/DiceInput.svelte';
	import PointsControl from '$lib/components/PointsControl.svelte';
	import type { Action, AgeStage, CharacterView } from '$lib/engine';
	import { parseCount } from '$lib/format';
	import { ruleData, type AttributeId } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const age = $derived(view.ageStep);
	const species = $derived(ruleData.species.find((s) => s.id === view.speciesStep.selected));
	const rules = ruleData.age;
	const physical = ruleData.attributes.filter((a) => a.physical);
	const stages: AgeStage[] = ['child', 'youth', 'adult', 'aging'];
	// Gewähltes Zielattribut für noch nicht gewürfelte Reifewürfe.
	let pendingTarget = $state<Record<number, AttributeId>>({});
	let yearsText = $state('');
	$effect(() => {
		yearsText = age.years !== undefined ? String(age.years) : '';
	});

	function range(stage: AgeStage): string {
		if (!species) return '';
		const a = species.age;
		if (stage === 'child') return t.age.under(a.childUnder);
		if (stage === 'youth') return t.age.between(a.childUnder, a.youthUnder - 1);
		if (stage === 'adult') return t.age.between(a.youthUnder, a.adultUnder - 1);
		return t.age.from(a.adultUnder, a.agingInterval);
	}
	const atrophiaLeft = $derived(age.atrophia.required - age.atrophia.distributed);
	const malusLeft = $derived(age.youngMalus.required - age.youngMalus.distributed);
</script>

<p class="intro">{t.age.intro}</p>

{#if !species}
	<p>{t.age.chooseSpeciesFirst}</p>
{:else}
	<div class="cards">
		{#each stages as stage (stage)}
			<button
				type="button"
				class="card"
				class:selected={age.stage === stage}
				aria-pressed={age.stage === stage}
				onclick={() => dispatch({ type: 'setAgeStage', stage })}
			>
				<strong>{t.age.stages[stage]}</strong>
				<small>{range(stage)}</small>
			</button>
		{/each}
	</div>

	{#if age.stage === 'aging'}
		<div class="row stages">
			<span>{t.age.agingStagesLabel}</span>
			<PointsControl
				label={t.age.agingStagesLabel}
				value={age.agingStages}
				max={99}
				onchange={(n) => n >= 1 && dispatch({ type: 'setAgeStage', stage: 'aging', agingStages: n })}
			/>
		</div>
	{/if}

	<label class="years">
		{t.age.yearsOptional}
		<input
			inputmode="numeric"
			bind:value={yearsText}
			onchange={() => dispatch({ type: 'setAge', years: yearsText.trim() ? parseCount(yearsText) : undefined })}
		/>
	</label>
{/if}

{#if age.youngMalus.required > 0}
	<section>
		<h3>{t.age.malus}</h3>
		<p class="hint">{t.age.malusHint(age.youngMalus.required, age.youngMalus.distributed)}</p>
		<div class="grid">
			{#each age.youngMalus.attributes as attr (attr)}
				{@const points = age.youngMalus.points[attr] ?? 0}
				<div class="row">
					<span class="attr">{attr} <small>{view.attributes[attr].effective ?? '–'}</small></span>
					<PointsControl
						label={attr}
						value={points}
						max={points + Math.max(0, Math.min(malusLeft, (view.attributes[attr].effective ?? 0) - rules.minimumAttribute))}
						onchange={(n) => dispatch({ type: 'setYoungMalus', attribute: attr, points: n })}
					/>
				</div>
			{/each}
		</div>
	</section>
{/if}

{#if age.maturityRolls.length}
	<section>
		<h3>{t.age.maturity}</h3>
		<p class="hint">
			{t.age.maturityHint}{species?.age.maxMaturityRolls ? ` ${t.age.maturityCap(species.age.maxMaturityRolls)}` : ''}
		</p>
		<ol class="rolls">
			{#each age.maturityRolls as roll (roll.index)}
				{@const target = roll.attribute ?? pendingTarget[roll.index] ?? rules.maturityAttributes[0]}
				<li>
					<select
						value={target}
						aria-label={t.age.maturityTarget(roll.index)}
						onchange={(e) => {
							const attribute = e.currentTarget.value as AttributeId;
							if (roll.roll) dispatch({ type: 'setMaturityAttribute', index: roll.index, attribute });
							else pendingTarget[roll.index] = attribute;
						}}
					>
						{#each rules.maturityAttributes as attr (attr)}
							<option value={attr}>{attr}</option>
						{/each}
					</select>
					<DiceInput
						locked
						count={1}
						sides={rules.maturityDie}
						roll={roll.roll}
						onroll={(r) => dispatch({ type: 'rollMaturity', index: roll.index, attribute: target, roll: r })}
						onreset={() => dispatch({ type: 'rollMaturity', index: roll.index, attribute: target, roll: undefined })}
					/>
					{#if roll.success !== undefined && roll.target !== undefined}
						<span class:ok={roll.success}>
							{roll.success ? t.age.maturitySuccess(roll.target) : t.age.maturityFail(roll.target)}
						</span>
					{/if}
				</li>
			{/each}
		</ol>
	</section>
{/if}

{#if age.atrophia.required}
	<section>
		<h3>{t.age.atrophia}</h3>
		<p class="hint">{t.age.atrophiaHint(age.atrophia.required, age.atrophia.distributed)}</p>
		<div class="grid">
			{#each physical as a (a.id)}
				{@const points = age.atrophia.points[a.id] ?? 0}
				<div class="row">
					<span class="attr">{a.id} <small>{view.attributes[a.id].effective ?? '–'}</small></span>
					<PointsControl
						label={a.name}
						value={points}
						max={Math.min(points + Math.max(0, atrophiaLeft), age.atrophia.maxPerAttribute[a.id] ?? points)}
						onchange={(n) => dispatch({ type: 'setAtrophiaPoints', attribute: a.id, points: n })}
					/>
				</div>
			{/each}
		</div>
	</section>
{/if}

{#if view.senility.rolls.length}
	<section>
		<h3>{t.age.senility}</h3>
		<p class="hint">{t.senility.intro(rules.senilityStabilityLoss)}</p>
		<ol class="rolls">
			{#each view.senility.rolls as roll (roll.index)}
				<li>
					<DiceInput
						locked
						count={1}
						sides={rules.senilityDie}
						roll={roll.roll}
						onroll={(r) => dispatch({ type: 'rollSenility', index: roll.index, roll: r })}
						onreset={() => dispatch({ type: 'rollSenility', index: roll.index, roll: undefined })}
					/>
					{#if roll.success !== undefined && roll.target !== undefined}
						<span class:bad={roll.success}>{roll.success ? t.senility.lost(roll.target) : t.senility.kept(roll.target)}</span>
					{/if}
				</li>
			{/each}
		</ol>
		<p>{t.senility.result(view.secondary.stability.value)}</p>
	</section>
{/if}

<style>
	.intro,
	.hint,
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
	.stages {
		justify-content: start;
	}
	.years {
		max-width: 12rem;
		margin-top: 0.6rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: 0.5rem 1rem;
	}
	.row {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		justify-content: space-between;
	}
	.attr {
		font-weight: 600;
	}
	.rolls {
		padding-left: 1.2rem;
		display: grid;
		gap: 0.5rem;
	}
	.rolls li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}
	.ok {
		color: var(--ok);
	}
	.bad {
		color: var(--danger);
	}
</style>
