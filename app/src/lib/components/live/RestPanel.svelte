<script lang="ts">
	import DiceInput from '$lib/components/DiceInput.svelte';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';
	import { parseCount } from '$lib/format';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const live = $derived(view.live);
	let staLoss = $state('');
	let inCombat = $state(true);
	let mpCost = $state('');
	let hours = $state(1);
	let bonus = $state(0);
	let message = $state('');

	function loseStability(e: SubmitEvent) {
		e.preventDefault();
		const amount = parseCount(staLoss);
		if (!amount) return;
		const before = live.conditions;
		dispatch({ type: 'loseStability', amount, inCombat });
		const added = view.live.conditions.filter((c) => !before.includes(c));
		message = added.map((id) => ruleData.conditions.find((c) => c.id === id)?.name ?? id).join(', ');
		message = message ? t.live.newConditions(message) : '';
		staLoss = '';
	}

	function spendMp(e: SubmitEvent) {
		e.preventDefault();
		const amount = parseCount(mpCost);
		if (!amount) return;
		const tpBefore = live.tp;
		const mpBefore = live.mp;
		dispatch({ type: 'spendMp', amount });
		const lost = tpBefore - view.live.tp;
		message = view.live.mp < 0 ? t.live.overdrawn(lost, mpBefore >= 0) : '';
		mpCost = '';
	}

	function rest(h: number) {
		const r = ruleData.play.rest;
		dispatch({ type: 'rest', hours: h });
		message = t.live.rested(h >= r.fullMpAfterHours ? 'sleep' : h >= r.restPhaseHours ? 'rest' : 'pause');
	}
</script>

<section class="panel">
	<h2>{t.live.mindAndMagic}</h2>
	{#if message}<p class="message">{message}</p>{/if}

	<form onsubmit={loseStability}>
		<label>{t.live.staLoss}<input bind:value={staLoss} type="number" min="1" inputmode="numeric" /></label>
		<label class="check"><input type="checkbox" bind:checked={inCombat} /> {t.live.inCombat}</label>
		<button type="submit" disabled={!staLoss}>{t.live.apply}</button>
	</form>
	{#if live.stabilityStart !== undefined}
		<p class="hint">{t.live.staStart(live.stabilityStart)}</p>
	{/if}

	<form onsubmit={spendMp}>
		<label>{t.live.mpCost}<input bind:value={mpCost} type="number" min="1" inputmode="numeric" /></label>
		<button type="submit" disabled={!mpCost}>{t.live.spend}</button>
	</form>

	<h3>{t.live.rest}</h3>
	<div class="row">
		<button onclick={() => rest(ruleData.play.rest.fullTpAfterHours)}>{t.live.pause}</button>
		<button onclick={() => rest(ruleData.play.rest.restPhaseHours)}>{t.live.restPhase}</button>
		<button onclick={() => rest(ruleData.play.rest.fullMpAfterHours)}>{t.live.sleep}</button>
	</div>

	<h3>{t.live.meditation}</h3>
	<div class="row">
		<label>{t.live.hours}<input type="number" min="1" max="12" bind:value={hours} /></label>
		<label>{t.live.bonus}<input type="number" bind:value={bonus} /></label>
		<DiceInput
			count={Math.max(1, Math.floor(hours) || 1)}
			sides={view.meditationDie}
			onroll={(roll) => {
				dispatch({
					type: 'meditate',
					rolls: roll.dice.map((d) => ({ dice: [d], source: roll.source })),
					bonus: Number(bonus) || 0
				});
				message = t.live.meditated;
			}}
		/>
	</div>
</section>

<style>
	.panel {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.6rem;
		padding: 0.7rem 0.9rem;
		margin-top: 1rem;
	}
	.panel h2 {
		margin-top: 0;
	}
	form,
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: end;
		margin-bottom: 0.6rem;
	}
	input[type='number'] {
		width: 4.5rem;
	}
	.check {
		display: flex;
		gap: 0.4rem;
		align-items: center;
	}
	.hint {
		color: var(--muted);
		font-size: 0.9rem;
	}
	.message {
		border-left: 4px solid var(--warn);
		padding-left: 0.6rem;
	}
	h3 {
		margin: 0.8rem 0 0.3rem;
		font-size: 1rem;
	}
</style>
