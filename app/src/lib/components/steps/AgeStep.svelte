<script lang="ts">
	import DiceInput from '$lib/components/DiceInput.svelte';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData, type AttributeId } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const age = $derived(view.ageStep);
	const species = $derived(ruleData.species.find((s) => s.id === view.speciesStep.selected));
	const rules = ruleData.age;
	const physical = ruleData.attributes.filter((a) => a.physical);
	// Gewähltes Zielattribut für noch nicht gewürfelte Reifewürfe.
	let pendingTarget = $state<Record<number, AttributeId>>({});
</script>

<p class="intro">{t.age.intro}</p>

{#if !species}
	<p>{t.age.chooseSpeciesFirst}</p>
{:else}
	<p class="ranges">
		{t.age.ranges(species.name, species.age.childUnder, species.age.youthUnder, species.age.adultUnder, species.age.agingInterval)}
	</p>
{/if}

<label class="years">
	{t.age.years}
	<input
		type="number"
		min="0"
		inputmode="numeric"
		value={age.years ?? ''}
		oninput={(e) => {
			const v = e.currentTarget.value;
			dispatch({ type: 'setAge', years: v === '' ? undefined : Math.max(0, Math.floor(Number(v))) });
		}}
	/>
</label>

{#if age.stage}
	<p class="stage">
		<strong>{t.age.stages[age.stage]}</strong>{age.agingStages ? ` · ${t.age.agingStages(age.agingStages)}` : ''}
	</p>
{/if}

{#if age.youngMalus.required > 0}
	<section>
		<h3>{t.age.malus}</h3>
		<p>{t.age.malusHint(age.youngMalus.required, age.youngMalus.distributed)}</p>
		<div class="row">
			{#each age.youngMalus.attributes as attr (attr)}
				<label>
					{attr}
					<input
						type="number"
						min="0"
						max={age.youngMalus.required}
						value={age.youngMalus.points[attr] ?? 0}
						oninput={(e) => dispatch({ type: 'setYoungMalus', attribute: attr, points: Math.max(0, Math.floor(Number(e.currentTarget.value) || 0)) })}
					/>
				</label>
			{/each}
		</div>
	</section>
{/if}

{#if age.maturityRolls.length}
	<section>
		<h3>{t.age.maturity}</h3>
		<p class="hint">{t.age.maturityHint}</p>
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
						count={1}
						sides={rules.maturityDie}
						roll={roll.roll}
						onroll={(r) => dispatch({ type: 'rollMaturity', index: roll.index, attribute: target, roll: r })}
					/>
					{#if roll.success !== undefined}
						<span class:ok={roll.success}>{roll.success ? t.age.maturitySuccess(roll.target!) : t.age.maturityFail(roll.target!)}</span>
					{/if}
				</li>
			{/each}
		</ol>
	</section>
{/if}

{#if age.atrophia.required}
	<section>
		<h3>{t.age.atrophia}</h3>
		<p class="hint">{t.age.atrophiaHint}</p>
		<div class="row">
			{#each age.atrophia.slots as attr, index (index)}
				<select
					value={attr ?? ''}
					aria-label={t.age.atrophiaPoint(index)}
					onchange={(e) => dispatch({ type: 'setAtrophia', index, attribute: e.currentTarget.value as AttributeId })}
				>
					<option value="" disabled>–</option>
					{#each physical as a (a.id)}
						<option value={a.id}>{a.id}</option>
					{/each}
				</select>
			{/each}
		</div>
	</section>
{/if}

<style>
	.intro,
	.hint,
	.ranges {
		color: var(--muted);
	}
	.years {
		max-width: 10rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}
	.row input {
		width: 4rem;
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
</style>
