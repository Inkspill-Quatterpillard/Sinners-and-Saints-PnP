<script lang="ts">
	import DiceInput from '$lib/components/DiceInput.svelte';
	import InfoButton from '$lib/components/InfoButton.svelte';
	import { rollDice } from '$lib/dice';
	import type { Action, AttributeMethod, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const gen = ruleData.attributeGeneration;
	const step = $derived(view.attributeStep);
	const unrolled = $derived(step.method === 'roll' ? step.slots.filter((s) => !s.roll) : []);
	/** Plätze in der Auswahl absteigend nach Wert. */
	const sortedSlots = $derived([...step.slots].sort((a, b) => (b.value ?? -1) - (a.value ?? -1) || a.index - b.index));

	/** Würfelt alle Plätze; sind schon Werte da, erst nach Rückfrage alle neu. */
	function rollAll() {
		const rerolling = unrolled.length < step.slots.length;
		if (rerolling && !confirm(t.attributes.confirmRerollAll)) return;
		for (const slot of rerolling ? step.slots : unrolled) {
			dispatch({ type: 'rollAttributeSlot', slot: slot.index, roll: rollDice(gen.dice.count, gen.dice.sides) });
		}
	}
</script>

<p class="intro">{t.attributes.intro}</p>

<label class="method">
	{t.attributes.method}
	<select
		value={step.method ?? ''}
		onchange={(e) => dispatch({ type: 'setAttributeMethod', method: e.currentTarget.value as AttributeMethod })}
	>
		<option value="" disabled>–</option>
		<option value="roll">{t.attributes.methodRoll(gen.dice.count, gen.dice.sides, gen.dice.keep)}</option>
		<option value="array">{t.attributes.methodArray(gen.fixedArray)}</option>
	</select>
</label>
{#if step.method}<p class="hint">{t.attributes.methodHint}</p>{/if}

{#if step.method === 'roll'}
	<section>
		<h3>{t.attributes.slots}</h3>
		<button class="primary" onclick={rollAll}>{t.attributes.rollAll}</button>
		<ol class="slots">
			{#each step.slots as slot (slot.index)}
				<li>
					<span class="slot-name">{t.attributes.slot(slot.index)}</span>
					<strong class="value">{slot.value ?? '–'}</strong>
					<DiceInput
						locked
						count={gen.dice.count}
						sides={gen.dice.sides}
						roll={slot.roll}
						onroll={(roll) => dispatch({ type: 'rollAttributeSlot', slot: slot.index, roll })}
						onreset={() => dispatch({ type: 'rollAttributeSlot', slot: slot.index, roll: undefined })}
					/>
				</li>
			{/each}
		</ol>
	</section>
{/if}

{#if step.method}
	<section>
		<h3>{t.attributes.assign}</h3>
		<div class="assign">
			{#each ruleData.attributes as attr (attr.id)}
				{@const current = step.slots.find((s) => s.assignedTo === attr.id)}
				<div class="attr">
					<InfoButton title={`${attr.name} (${attr.id})`} text={attr.description}>
						<strong>{attr.id}</strong>
						{attr.name}
					</InfoButton>
					<select
						aria-label={attr.name}
						value={current?.index ?? ''}
						onchange={(e) => dispatch({ type: 'assignAttribute', attribute: attr.id, slot: Number(e.currentTarget.value) })}
					>
						<option value="" disabled>{t.attributes.notAssigned}</option>
						{#each sortedSlots as slot (slot.index)}
							<option value={slot.index} disabled={slot.value === undefined}>
								{slot.value ?? '?'}{slot.assignedTo && slot.assignedTo !== attr.id ? ` (${slot.assignedTo})` : ''}
							</option>
						{/each}
					</select>
				</div>
			{/each}
		</div>
	</section>
{/if}

<section>
	<h3>{t.secondary.luck}</h3>
	<p class="hint">{view.luck.advantage ? t.secondary.luckAdvantage : t.secondary.luckPlain}</p>
	<DiceInput
		locked={view.secondary.luck.value !== undefined}
		count={view.luck.dice}
		sides={ruleData.secondary.luckDie}
		roll={view.luck.roll}
		onroll={(roll) => dispatch({ type: 'rollLuck', roll })}
		onreset={() => dispatch({ type: 'rollLuck', roll: undefined })}
	/>
	{#if view.luck.roll && view.secondary.luck.value === undefined}
		<p class="hint">{t.secondary.luckNeedsSecondDie}</p>
	{/if}
	{#if view.secondary.luck.value !== undefined}<p>{t.attributes.luckValue(view.secondary.luck.value)}</p>{/if}
</section>

<style>
	.intro,
	.hint {
		color: var(--muted);
	}
	.method {
		max-width: 28rem;
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
	.attr {
		display: grid;
		gap: 0.25rem;
	}
</style>
