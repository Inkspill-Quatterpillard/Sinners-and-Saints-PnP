<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Summary from '$lib/components/Summary.svelte';
	import AttributesStep from '$lib/components/steps/AttributesStep.svelte';
	import OptionsStep from '$lib/components/steps/OptionsStep.svelte';
	import SpeciesStep from '$lib/components/steps/SpeciesStep.svelte';
	import AgeStep from '$lib/components/steps/AgeStep.svelte';
	import ProfessionStep from '$lib/components/steps/ProfessionStep.svelte';
	import InterestsStep from '$lib/components/steps/InterestsStep.svelte';
	import ReligionStep from '$lib/components/steps/ReligionStep.svelte';
	import CharacteristicStep from '$lib/components/steps/CharacteristicStep.svelte';
	import OriginStep from '$lib/components/steps/OriginStep.svelte';
	import StuntsStep from '$lib/components/steps/StuntsStep.svelte';
	import CombatStep from '$lib/components/steps/CombatStep.svelte';
	import MagicStep from '$lib/components/steps/MagicStep.svelte';
	import EquipmentStep from '$lib/components/steps/EquipmentStep.svelte';
	import BackgroundStep from '$lib/components/steps/BackgroundStep.svelte';
	import type { StepId } from '$lib/engine';
	import { downloadCharacter } from '$lib/download';
	import { CharacterSession } from '$lib/session.svelte';
	import { saveCharacter } from '$lib/storage/characterStore';
	import { t } from '$lib/texts';
	import type { Component } from 'svelte';

	const session = new CharacterSession();
	const view = $derived(session.view);
	const dispatch = session.dispatch;

	const stepComponents: Partial<Record<StepId, Component<any>>> = {
		options: OptionsStep,
		attributes: AttributesStep,
		species: SpeciesStep,
		age: AgeStep,
		religion: ReligionStep,
		characteristic: CharacteristicStep,
		origin: OriginStep,
		profession: ProfessionStep,
		interests: InterestsStep,
		stunts: StuntsStep,
		combat: CombatStep,
		magic: MagicStep,
		equipment: EquipmentStep,
		background: BackgroundStep
	};

	let current = $state<StepId>('options');
	const currentIndex = $derived(view ? view.steps.findIndex((s) => s.id === current) : -1);
	// Der am weitesten erreichte Schritt dieser Sitzung, damit man nach einem Blick zurück wieder hinspringen kann.
	let furthest = $state(0);
	$effect(() => {
		if (currentIndex > furthest) furthest = currentIndex;
	});
	/** Der nächste offene Schritt nach dem aktuellen; sonst der am weitesten erreichte, wenn man zurückgegangen ist. */
	const jumpTarget = $derived.by(() => {
		if (!view) return undefined;
		const open = view.steps.find((s, i) => i > currentIndex && s.status !== 'valid');
		if (open) return { step: open, label: t.jumpToOpen(t.steps[open.id]) };
		if (currentIndex < furthest) return { step: view.steps[furthest], label: t.jumpTo(t.steps[view.steps[furthest].id]) };
		return undefined;
	});
	const isLast = $derived(view ? currentIndex === view.steps.length - 1 : false);
	let saved = $state(false);
	const openSteps = $derived(view ? view.steps.filter((s) => s.status !== 'valid') : []);

	$effect(() => {
		session.load(page.params.id!);
	});

	function go(offset: number) {
		if (!view) return;
		const next = view.steps[currentIndex + offset];
		if (next) current = next.id;
	}

	async function save() {
		if (!session.character) return;
		await saveCharacter(session.character);
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}

	async function finish() {
		dispatch({ type: 'finishCreation' });
		await goto(`${base}/charakter/${page.params.id}/bogen`);
	}
</script>

<p class="top">
	<a href="{base}/">← {t.backToList}</a>
	<span class="history">
		<button onclick={session.undo} disabled={!session.canUndo}>{t.undo}</button>
		<button onclick={session.redo} disabled={!session.canRedo}>{t.redo}</button>
	</span>
</p>

{#if session.character === undefined}
	<p>{t.loading}</p>
{:else if session.character === null || !view}
	<p>{t.notFound}</p>
{:else}
	<h1>{view.name || t.unnamed}</h1>
	<label class="name">
		{t.name}
		<input value={view.name} oninput={(e) => dispatch({ type: 'setName', name: e.currentTarget.value })} />
	</label>

	{#if view.ruleDataChanged}<p class="issue invalid">{t.live.ruleDataChanged}</p>{/if}

	<div class="finish">
		{#if view.status === 'finished'}
			<a class="button primary" href="{base}/charakter/{view.id}/bogen">{t.live.open}</a>
			<span>{t.live.editingFinished}</span>
		{:else if view.canFinish}
			<button class="primary" onclick={finish}>{t.live.finish}</button>
			<span>{t.live.finishHint}</span>
		{:else}
			<span class="hint">{t.live.notYet(openSteps.map((s) => t.steps[s.id]).join(', '))}</span>
		{/if}
	</div>

	<nav class="steps" aria-label={t.stepsLabel}>
		{#each view.steps as step (step.id)}
			<button
				class="step {step.status}"
				class:current={step.id === current}
				aria-current={step.id === current ? 'step' : undefined}
				onclick={() => (current = step.id)}
			>
				<span>{t.steps[step.id]}</span>
				<small>{t.stepStatus[step.status]}</small>
			</button>
		{/each}
	</nav>
	{#if jumpTarget}
		<p class="jump"><button onclick={() => (current = jumpTarget.step.id)}>{jumpTarget.label}</button></p>
	{/if}

	<div class="layout">
		<section class="step-body">
			<h2>{t.steps[current]}</h2>
			{#each view.issues.filter((i) => i.step === current) as issue, n (n)}
				<p class="issue {issue.severity}">{issue.message}</p>
			{/each}
			{#if stepComponents[current]}
				{@const StepComponent = stepComponents[current]}
				<StepComponent {view} {dispatch} />
			{/if}
			<div class="pager">
				<button onclick={() => go(-1)} disabled={currentIndex <= 0}>{t.previousStep}</button>
				{#if isLast}
					<span class="history">
						<button onclick={() => session.character && downloadCharacter(session.character)}>{t.export}</button>
						<button class:primary={!view.canFinish || view.status === 'finished'} onclick={save}
							>{saved ? `${t.saved} ✓` : t.save}</button
						>
						{#if view.canFinish && view.status !== 'finished'}
							<button class="primary" onclick={finish}>{t.live.finish}</button>
						{/if}
					</span>
				{:else}
					<button class="primary" onclick={() => go(1)}>{t.nextStep}</button>
				{/if}
			</div>
		</section>
		<Summary {view} />
	</div>
{/if}

<style>
	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.name {
		max-width: 24rem;
		margin-bottom: 1rem;
	}
	.finish {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-items: center;
		margin-bottom: 1rem;
	}
	.finish span,
	.hint {
		color: var(--muted);
		font-size: 0.9rem;
	}
	.steps {
		display: flex;
		gap: 0.4rem;
		overflow-x: auto;
		padding-bottom: 0.4rem;
		margin-bottom: 1rem;
	}
	.step {
		display: grid;
		text-align: left;
		min-width: 7rem;
		border-left: 4px solid var(--line);
	}
	.step small {
		color: var(--muted);
	}
	.step.valid {
		border-left-color: var(--ok);
	}
	.step.invalid {
		border-left-color: var(--danger);
	}
	.step.current {
		outline: 2px solid var(--accent);
	}
	.layout {
		display: grid;
		gap: 1rem;
	}
	@media (min-width: 52rem) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 16rem;
			align-items: start;
		}
	}
	/* Ohne das wächst die Spalte mit ihrem breitesten Inhalt (z. B. den Katalog-Reitern) über den Bildschirm. */
	.step-body {
		min-width: 0;
	}
	.step-body h2 {
		margin-top: 0;
	}
	.pager {
		display: flex;
		justify-content: space-between;
		margin-top: 1.5rem;
	}
	.history {
		display: flex;
		gap: 0.4rem;
	}
	.history button:disabled {
		opacity: 0.4;
	}
	.jump {
		margin: -0.4rem 0 1rem;
	}
	.issue {
		padding: 0.4rem 0.7rem;
		border-radius: 0.4rem;
		border-left: 4px solid var(--warn);
		background: var(--surface);
	}
	.issue.invalid {
		border-left-color: var(--danger);
	}
</style>
