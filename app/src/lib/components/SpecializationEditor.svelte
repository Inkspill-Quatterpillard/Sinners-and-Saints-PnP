<script lang="ts">
	import type { Action, SkillView } from '$lib/engine';
	import { t } from '$lib/texts';

	/** Spezialisierungen für Fertigkeiten anlegen und entfernen, die eine brauchen (z. B. Handwerk). */
	let { skills, dispatch }: { skills: SkillView[]; dispatch: (a: Action) => void } = $props();

	const bases = $derived(skills.filter((s) => s.needsSpecialization && !s.specialization));
	let newSpec = $state<Record<string, string>>({});

	function add(skillId: string) {
		const name = (newSpec[skillId] ?? '').trim();
		if (!name) return;
		dispatch({ type: 'addSpecialization', skill: skillId, specialization: name });
		newSpec[skillId] = '';
	}
</script>

<div class="specs">
	{#each bases as base (base.key)}
		{@const existing = skills.filter((s) => s.skillId === base.skillId && s.specialization)}
		<div class="spec">
			<strong>{base.name}</strong>
			{#each existing as s (s.key)}
				<span class="chip">
					{s.specialization}
					<button
						type="button"
						class="link"
						aria-label={t.skills.removeSpecialization(s.name)}
						onclick={() => dispatch({ type: 'removeSpecialization', skill: s.skillId, specialization: s.specialization! })}
						>×</button
					>
				</span>
			{/each}
			<form class="add" onsubmit={(e) => (e.preventDefault(), add(base.skillId))}>
				<input
					bind:value={newSpec[base.skillId]}
					placeholder={t.skills.specializationPlaceholder}
					aria-label={t.skills.addSpecialization(base.name)}
				/>
				<button type="submit" disabled={!(newSpec[base.skillId] ?? '').trim()}>+</button>
			</form>
		</div>
	{/each}
</div>

<style>
	.specs {
		display: grid;
		gap: 0.5rem;
	}
	.spec {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}
	.chip {
		border: 1px solid var(--line);
		border-radius: 1rem;
		padding: 0.1rem 0.5rem;
	}
	.add {
		display: inline-flex;
		gap: 0.3rem;
	}
	.add input {
		width: 12rem;
	}
</style>
