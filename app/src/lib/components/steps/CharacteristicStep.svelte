<script lang="ts">
	import DiceInput from '$lib/components/DiceInput.svelte';
	import { rollDice } from '$lib/dice';
	import {
		characteristicForRoll,
		type Action,
		type CharacteristicMode,
		type CharacterView,
		type CharacteristicSlotView,
		type Roll
	} from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const step = $derived(view.characteristicStep);
	const rules = ruleData.characteristics;
	const modes: CharacteristicMode[] = ['none', 'free', 'roll'];

	/** Würfelt die App und trifft eine schon vorhandene Charakteristik, wird automatisch neu gewürfelt. */
	function unique(roll: Roll, slot: number): Roll {
		if (roll.source !== 'app') return roll;
		const taken = new Set(step.slots.filter((s) => s.index !== slot && s.id).map((s) => s.id));
		let r = roll;
		for (let i = 0; i < 50 && taken.has(characteristicForRoll(ruleData, r.dice[0])?.id); i++) r = rollDice(1, rules.die);
		return r;
	}
</script>

{#snippet picker(slot: CharacteristicSlotView, placeholder: string)}
	<select
		value={slot.picked || slot.kind === 'free' ? (slot.id ?? '') : ''}
		aria-label={t.characteristic.slot(slot.index, slot.extra)}
		onchange={(e) =>
			dispatch({ type: 'pickCharacteristic', slot: slot.index, characteristic: e.currentTarget.value || undefined })}
	>
		<option value="">{placeholder}</option>
		{#each rules.entries as entry (entry.id)}
			<option value={entry.id}
				>{String(entry.range[0]).padStart(2, '0')}–{String(entry.range[1]).padStart(2, '0')} {entry.name}</option
			>
		{/each}
	</select>
{/snippet}

<p class="intro">{t.characteristic.intro}</p>

{#if !view.options.optionalRules.charakteristik}
	<p>{t.characteristic.disabled}</p>
{:else}
	<fieldset>
		<legend>{t.characteristic.mode}</legend>
		{#each modes as mode (mode)}
			<label class="check">
				<input
					type="radio"
					name="char-mode"
					checked={step.mode === mode}
					onchange={() => dispatch({ type: 'setCharacteristicMode', mode })}
				/>
				{t.characteristic.modes[mode]}
			</label>
		{/each}
	</fieldset>

	{#each step.slots as slot (slot.index)}
		<article class:duplicate={slot.duplicate}>
			<h4>{t.characteristic.slot(slot.index, slot.extra)}</h4>
			{#if slot.kind === 'roll'}
				<div class="controls">
					<DiceInput
						locked={!slot.duplicate}
						manual={false}
						count={1}
						sides={rules.die}
						roll={slot.roll}
						onroll={(roll) => dispatch({ type: 'rollCharacteristic', slot: slot.index, roll: unique(roll, slot.index) })}
						onreset={() => dispatch({ type: 'rollCharacteristic', slot: slot.index, roll: undefined })}
					/>
					{#if slot.roll && step.rerollAvailable && !slot.duplicate}
						<button
							onclick={() =>
								dispatch({ type: 'rerollCharacteristic', slot: slot.index, roll: unique(rollDice(1, rules.die), slot.index) })}
						>
							{t.characteristic.reroll}
						</button>
					{/if}
					{@render picker(slot, slot.roll || slot.id ? t.dice.overwrite : t.dice.enter)}
				</div>
			{:else}
				{@render picker(slot, '–')}
			{/if}
			{#if slot.name}
				<p class="name"><strong>{slot.name}</strong>{slot.rerolled ? ` · ${t.characteristic.rerolled}` : ''}</p>
				<p class="text">{slot.text}</p>
				{#if slot.note}<p class="note">{slot.note}</p>{/if}
			{/if}
		</article>
	{/each}
{/if}

<style>
	.intro,
	.note {
		color: var(--muted);
	}
	fieldset {
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		display: grid;
		gap: 0.3rem;
		margin-bottom: 1rem;
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	article {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.6rem 0.9rem;
		margin-bottom: 0.7rem;
	}
	article.duplicate {
		border-color: var(--warn);
	}
	h4 {
		margin: 0 0 0.4rem;
	}
	.name {
		margin: 0.5rem 0 0.2rem;
	}
	.text {
		margin: 0;
		font-size: 0.92rem;
	}
	select {
		max-width: 100%;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}
</style>
