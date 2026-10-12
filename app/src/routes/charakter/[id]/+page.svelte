<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Summary from '$lib/components/Summary.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import AttributesStep from '$lib/components/steps/AttributesStep.svelte';
	import OptionsStep from '$lib/components/steps/OptionsStep.svelte';
	import SpeciesStep from '$lib/components/steps/SpeciesStep.svelte';
	import SecondaryStep from '$lib/components/steps/SecondaryStep.svelte';
	import AgeStep from '$lib/components/steps/AgeStep.svelte';
	import SenilityStep from '$lib/components/steps/SenilityStep.svelte';
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
	import { CharacterSession } from '$lib/session.svelte';
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
		secondary: SecondaryStep,
		senility: SenilityStep,
		stunts: StuntsStep,
		combat: CombatStep,
		magic: MagicStep,
		equipment: EquipmentStep,
		background: BackgroundStep
	};

	let current = $state<StepId>('options');
	const currentIndex = $derived(view ? view.steps.findIndex((s) => s.id === current) : -1);
	const openSteps = $derived(view ? view.steps.filter((s) => s.status !== 'valid') : []);

	$effect(() => {
		session.load(page.params.id!);
	});

	function go(offset: number) {
		if (!view) return;
		const next = view.steps[currentIndex + offset];
		if (next) current = next.id;
	}

	async function finish() {
		dispatch({ type: 'finishCreation' });
		await goto(`/charakter/${page.params.id}/bogen`);
	}
</script>

<p class="top">
	<a href="/">← {t.backToList}</a>
	{#if session.canUndo}<button onclick={session.undo}>{t.undo}</button>{/if}
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
			<a class="button primary" href="/charakter/{view.id}/bogen">{t.live.open}</a>
			<span>{t.live.editingFinished}</span>
		{:else if view.canFinish}
			<button class="primary" onclick={finish}>{t.live.finish}</button>
			<span>{t.live.finishHint}</span>
		{:else}
			<span class="hint">{t.live.notYet(openSteps.map((s) => t.steps[s.id]).join(', '))}</span>
		{/if}
	</div>

	<nav class="steps" aria-label="Schritte der Erstellung">
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
				<button class="primary" onclick={() => go(1)} disabled={currentIndex >= view.steps.length - 1}>{t.nextStep}</button>
			</div>
		</section>
		<Summary {view} />
	</div>

	<details class="all-skills">
		<summary>{t.skills.all}</summary>
		<SkillTable skills={view.skills} {dispatch} />
	</details>
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
			grid-template-columns: 1fr 16rem;
			align-items: start;
		}
	}
	.step-body h2 {
		margin-top: 0;
	}
	.pager {
		display: flex;
		justify-content: space-between;
		margin-top: 1.5rem;
	}
	.all-skills {
		margin-top: 1.5rem;
	}
	.all-skills summary {
		cursor: pointer;
		font-weight: 600;
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
