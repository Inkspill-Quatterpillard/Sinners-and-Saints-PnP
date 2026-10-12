<script lang="ts">
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
	import { applyAction, computeView, type Action, type Character, type StepId } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { loadCharacter, saveCharacter } from '$lib/storage/characterStore';
	import { t } from '$lib/texts';
	import type { Component } from 'svelte';

	// Der Regelkern liefert bei jeder Aktion einen neuen Charakter, daher genügt $state.raw.
	let character = $state.raw<Character | undefined | null>();
	const view = $derived(character ? computeView(character, ruleData) : undefined);

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
		equipment: EquipmentStep
	};

	let current = $state<StepId>('options');
	const currentIndex = $derived(view ? view.steps.findIndex((s) => s.id === current) : -1);

	$effect(() => {
		loadCharacter(page.params.id!).then((c) => (character = c ?? null));
	});

	function dispatch(action: Action) {
		if (!character) return;
		character = applyAction(character, action, ruleData);
		saveCharacter(character);
	}

	function go(offset: number) {
		if (!view) return;
		const next = view.steps[currentIndex + offset];
		if (next) current = next.id;
	}
</script>

<p><a href="/">← {t.backToList}</a></p>

{#if character === undefined}
	<p>{t.loading}</p>
{:else if character === null || !view}
	<p>{t.notFound}</p>
{:else}
	<h1>{view.name || t.unnamed}</h1>
	<label class="name">
		{t.name}
		<input value={view.name} oninput={(e) => dispatch({ type: 'setName', name: e.currentTarget.value })} />
	</label>

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
	.name {
		max-width: 24rem;
		margin-bottom: 1rem;
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
