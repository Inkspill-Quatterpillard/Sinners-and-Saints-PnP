<script lang="ts">
	import DiceInput from '$lib/components/DiceInput.svelte';
	import { rollDice } from '$lib/dice';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const gen = ruleData.attributeGeneration;
	const step = $derived(view.attributeStep);

	function rollAll() {
		step.slots.forEach((slot) => {
			if (!slot.roll) dispatch({ type: 'rollAttributeSlot', slot: slot.index, roll: rollDice(gen.dice.count, gen.dice.sides) });
		});
	}
</script>

<p class="intro">{t.attributes.intro}</p>

<fieldset>
	<legend>{t.attributes.method}</legend>
	<label class="check">
		<input
			type="radio"
			name="method"
			checked={step.method === 'roll'}
			onchange={() => dispatch({ type: 'setAttributeMethod', method: 'roll' })}
		/>
		{t.attributes.methodRoll(gen.dice.count, gen.dice.sides, gen.dice.keep)}
	</label>
	<label class="check">
		<input
			type="radio"
			name="method"
			checked={step.method === 'array'}
			onchange={() => dispatch({ type: 'setAttributeMethod', method: 'array' })}
		/>
		{t.attributes.methodArray(gen.fixedArray)}
	</label>
</fieldset>

{#if !step.method}
	<p>{t.attributes.chooseMethod}</p>
{:else}
	{#if step.method === 'roll'}
		<section>
			<h3>{t.attributes.slots}</h3>
			<ol class="slots">
				{#each step.slots as slot (slot.index)}
					<li>
						<span class="slot-name">{t.attributes.slot(slot.index)}</span>
						<strong class="value">{slot.value ?? '–'}</strong>
						<DiceInput
							count={gen.dice.count}
							sides={gen.dice.sides}
							roll={slot.roll}
							onroll={(roll) => dispatch({ type: 'rollAttributeSlot', slot: slot.index, roll })}
						/>
					</li>
				{/each}
			</ol>
			<button onclick={rollAll}>{t.attributes.rollAll}</button>
		</section>
	{/if}

	<section>
		<h3>{t.attributes.assign}</h3>
		<div class="assign">
			{#each ruleData.attributes as attr (attr.id)}
				{@const current = step.slots.find((s) => s.assignedTo === attr.id)}
				<label>
					<span><strong>{attr.id}</strong> {attr.name}</span>
					<select
						value={current?.index ?? ''}
						onchange={(e) => dispatch({ type: 'assignAttribute', attribute: attr.id, slot: Number(e.currentTarget.value) })}
					>
						<option value="" disabled>{t.attributes.notAssigned}</option>
						{#each step.slots as slot (slot.index)}
							<option value={slot.index} disabled={slot.value === undefined}>
								{slot.value ?? '?'}{slot.assignedTo && slot.assignedTo !== attr.id ? ` (${slot.assignedTo})` : ''}
							</option>
						{/each}
					</select>
				</label>
			{/each}
		</div>
	</section>
{/if}

<style>
	fieldset {
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		margin: 0 0 1rem;
		display: grid;
		gap: 0.4rem;
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.intro {
		color: var(--muted);
	}
	.slots {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 0.4rem;
	}
	.slots li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-items: center;
	}
	.slot-name {
		min-width: 4.5rem;
		color: var(--muted);
	}
	.value {
		min-width: 1.8rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.assign {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		gap: 0.6rem;
	}
</style>
