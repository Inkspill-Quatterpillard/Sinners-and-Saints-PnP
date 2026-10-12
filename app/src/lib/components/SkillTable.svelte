<script lang="ts">
	import type { Action, SkillView } from '$lib/engine';
	import SkillName from '$lib/components/SkillName.svelte';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	interface Props {
		skills: SkillView[];
		dispatch?: (a: Action) => void;
	}

	let { skills, dispatch }: Props = $props();

	const categories = ['general', 'combat', 'arcane'] as const;
	let newSpec = $state<Record<string, string>>({});
	const attrName = (id: string) => ruleData.attributes.find((a) => a.id === id)?.name ?? id;
	/** Zwischenüberschrift: das Grundattribut, aus dem die Fertigkeit ihren Wert bezieht. */
	const groupOf = (s: SkillView) => s.group ?? s.attributes.map(attrName).join(' / ');
	const fraction = (s: SkillView) => `${s.fraction === 'half' ? '½' : '⅕'} ${s.attributes.join('/')}`;

	function addSpec(skillId: string) {
		const name = (newSpec[skillId] ?? '').trim();
		if (!name || !dispatch) return;
		dispatch({ type: 'addSpecialization', skill: skillId, specialization: name });
		newSpec[skillId] = '';
	}
</script>

{#each categories as category (category)}
	{@const list = skills
		.filter((s) => s.category === category)
		.sort((a, b) => groupOf(a).localeCompare(groupOf(b), 'de') || a.name.localeCompare(b.name, 'de'))}
	{#if list.length}
		<h3>{t.skills.categories[category]}</h3>
		<table>
			<thead>
				<tr>
					<th>{t.skills.skill}</th>
					<th class="num" title={t.skills.valueHint}>{t.skills.value}</th>
					<th class="num">½</th>
					<th class="num">⅕</th>
				</tr>
			</thead>
			<tbody>
				{#each list as s, i (s.key)}
					{#if i === 0 || groupOf(list[i - 1]) !== groupOf(s)}
						<tr class="group"><th colspan="4">{groupOf(s)}</th></tr>
					{/if}
					<tr class:spec={!!s.specialization}>
						<td>
							<span class="name"><SkillName skill={s} /></span>
							<small>{fraction(s)}{s.needsSpecialization && !s.specialization ? ` · ${t.skills.anySpecialization}` : ''}</small>
							{#if s.specialization && dispatch}
								<button
									class="link"
									aria-label={t.skills.removeSpecialization(s.name)}
									onclick={() => dispatch({ type: 'removeSpecialization', skill: s.skillId, specialization: s.specialization! })}
									>×</button
								>
							{/if}
							{#if s.needsSpecialization && !s.specialization && dispatch}
								<form class="add" onsubmit={(e) => (e.preventDefault(), addSpec(s.skillId))}>
									<input
										bind:value={newSpec[s.skillId]}
										placeholder={t.skills.specializationPlaceholder}
										aria-label={t.skills.addSpecialization(s.name)}
									/>
									<button type="submit">+</button>
								</form>
							{/if}
						</td>
						<td class="num"><strong>{s.value ?? '–'}</strong></td>
						<td class="num">{s.half ?? '–'}</td>
						<td class="num">{s.fifth ?? '–'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/each}

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.3rem 0.4rem;
		border-bottom: 1px solid var(--line);
		vertical-align: top;
	}
	tr.group th {
		color: var(--muted);
		font-size: 0.85rem;
		font-weight: 600;
		padding-top: 0.7rem;
	}
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		width: 3rem;
	}
	small {
		display: block;
		color: var(--muted);
	}
	tr.spec .name {
		padding-left: 0.8rem;
	}
	.add {
		display: flex;
		gap: 0.3rem;
		margin-top: 0.3rem;
	}
	.add input {
		flex: 1;
		min-width: 0;
		padding: 0.2rem 0.4rem;
	}
	.add button,
	.link {
		padding: 0.1rem 0.5rem;
	}
	.link {
		background: none;
		border: none;
		color: var(--muted);
	}
</style>
