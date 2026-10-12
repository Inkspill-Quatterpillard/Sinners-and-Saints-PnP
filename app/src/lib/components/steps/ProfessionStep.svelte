<script lang="ts">
	import DiceInput from '$lib/components/DiceInput.svelte';
	import SpecializationEditor from '$lib/components/SpecializationEditor.svelte';
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const p = $derived(view.professionStep);
	const general = $derived(view.skills.filter((s) => s.category === 'general' && !(s.needsSpecialization && !s.specialization)));
	const needsSpec = $derived(view.skills.filter((s) => s.category === 'general' && s.needsSpecialization && !s.specialization));
	const heroSkills = $derived(view.skills.filter((s) => s.category !== 'general'));
	const full = $derived(p.skills.length >= p.required);
	const sign = (v: number) => (v > 0 ? `+${v}` : `${v}`);
</script>

<p class="intro">{t.profession.intro}</p>

<label class="name">
	{t.profession.name}
	<input
		value={p.name}
		placeholder={t.profession.namePlaceholder}
		oninput={(e) => dispatch({ type: 'setProfessionName', name: e.currentTarget.value })}
	/>
</label>

<section>
	<h3>{t.profession.skills(p.skills.length, p.required)}</h3>
	<p class="hint">{t.profession.skillsHint(ruleData.profession.professionSkillBonus)}</p>
	<div class="grid">
		{#each general as s (s.key)}
			{@const chosen = p.skills.includes(s.key)}
			<label class="check" class:chosen>
				<input
					type="checkbox"
					checked={chosen}
					disabled={!chosen && full}
					onchange={() => dispatch({ type: 'toggleProfessionSkill', skill: s.key })}
				/>
				<span>{s.name} <small>{s.value ?? '–'}</small></span>
			</label>
		{/each}
	</div>
</section>

{#if needsSpec.length}
	<section>
		<h3>{t.profession.specTitle}</h3>
		<p class="hint">{t.profession.specHint}</p>
		<SpecializationEditor skills={view.skills} {dispatch} />
	</section>
{/if}

<section>
	<h3>{t.profession.status}</h3>
	<p class="hint">{t.profession.statusHint(ruleData.profession.statusStart)}</p>
	<DiceInput
		locked
		count={1}
		sides={ruleData.profession.statusDie}
		roll={p.statusRoll}
		onroll={(roll) => dispatch({ type: 'rollStatus', roll })}
		onreset={() => dispatch({ type: 'rollStatus', roll: undefined })}
	/>
	{#if p.statusModifier !== undefined}
		<p>{t.profession.statusResult(sign(p.statusModifier), view.socialStatus.value)}</p>
	{/if}
</section>

<section>
	<h3>{t.profession.heroSkills}</h3>
	<p class="hint">{t.profession.heroHint}</p>
	<div class="heroes">
		{#each p.heroSlots as slot (slot.index)}
			<label>
				<span>{t.profession.heroSlot(slot.value)}</span>
				<select
					value={slot.skill ?? ''}
					onchange={(e) => dispatch({ type: 'assignHeroSkill', slot: slot.index, skill: e.currentTarget.value || undefined })}
				>
					<option value="">–</option>
					{#each heroSkills as h (h.key)}
						{@const elsewhere = p.heroSlots.find((o) => o.skill === h.skillId && o.index !== slot.index)}
						<option value={h.skillId}>{h.name} ({t.profession.start(h.start)}){elsewhere ? ` · ${elsewhere.value}` : ''}</option>
					{/each}
				</select>
			</label>
		{/each}
	</div>
</section>

<style>
	.intro,
	.hint {
		color: var(--muted);
	}
	.name {
		max-width: 24rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: 0.3rem 0.8rem;
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.check small {
		color: var(--muted);
	}
	.check.chosen span {
		color: var(--accent);
	}
	.heroes {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
		gap: 0.6rem;
	}
</style>
