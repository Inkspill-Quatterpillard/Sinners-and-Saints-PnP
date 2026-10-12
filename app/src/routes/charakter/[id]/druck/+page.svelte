<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { currencyOf } from '$lib/engine';
	import { formatMoney } from '$lib/money';
	import { ruleData } from '$lib/ruleData';
	import { CharacterSession } from '$lib/session.svelte';
	import { t } from '$lib/texts';

	const session = new CharacterSession();
	const view = $derived(session.view);

	$effect(() => {
		session.load(page.params.id!);
	});

	const species = $derived(ruleData.species.find((s) => s.id === view?.speciesStep.selected));
	const religion = $derived(ruleData.religions.find((r) => r.id === view?.religionStep.selected));
	const origin = $derived(
		view?.originStep.choice === 'origin' ? ruleData.origins.find((o) => o.id === view?.originStep.selected) : undefined
	);
	const money = (n: number) => (view ? formatMoney(n, currencyOf(ruleData, view.options.setting)) : '');
	const languageName = (id: string) => ruleData.background.languages.find((l) => l.id === id)?.name ?? id;
	const techniques = $derived(
		view
			? view.combatStep.skills.flatMap((s) =>
					s.chosen.map((id) => ruleData.combat.techniques.find((x) => x.id === id)).filter(Boolean)
				)
			: []
	);
	const spells = $derived(
		view
			? view.magicStep.disciplines.flatMap((d) =>
					[...d.basics, ...d.chosen].map((id) => ruleData.magic.spells.find((s) => s.id === id)).filter(Boolean)
				)
			: []
	);
	const style = $derived(ruleData.combat.styles.find((s) => s.id === view?.combatStep.style));
	const general = $derived(
		view ? view.skills.filter((s) => s.category === 'general' && !(s.needsSpecialization && !s.specialization)) : []
	);
	const heroes = $derived(view ? view.skills.filter((s) => s.category !== 'general') : []);
	const b = $derived(view?.background);
</script>

<div class="no-print bar">
	<a href="{base}/charakter/{page.params.id}/bogen">← {t.print.back}</a>
	<button class="primary" onclick={() => window.print()}>{t.print.print}</button>
</div>

{#if session.character === undefined}
	<p>{t.loading}</p>
{:else if session.character === null || !view || !b}
	<p>{t.notFound}</p>
{:else}
	<article class="sheet">
		<header class="title">
			<h1>{view.name || t.unnamed}</h1>
			<p>
				{[
					species?.name,
					view.ageStep.years !== undefined ? t.live.years(view.ageStep.years) : '',
					b.gender,
					view.professionStep.name ? `${t.print.profession}: ${view.professionStep.name}` : '',
					religion?.name,
					origin?.name
				]
					.filter(Boolean)
					.join(' · ')}
			</p>
		</header>

		<section class="block attrs">
			<h2>{t.print.attributes}</h2>
			<table>
				<tbody>
					{#each ruleData.attributes as a (a.id)}
						{@const v = view.attributes[a.id].effective}
						<tr
							><th>{a.id}</th><td>{a.name}</td><td class="num">{v ?? ''}</td><td class="num small"
								>{view.attributes[a.id].half ?? ''}</td
							><td class="num small">{view.attributes[a.id].fifth ?? ''}</td></tr
						>
					{/each}
				</tbody>
			</table>
		</section>

		<section class="block">
			<h2>{t.print.values}</h2>
			<table>
				<tbody>
					<tr
						><th>TP</th><td class="num">{view.live.tp} / {view.live.maxTp}</td><th>{t.print.woundThreshold}</th><td class="num"
							>{view.live.woundThreshold}</td
						></tr
					>
					<tr
						><th>STA</th><td class="num">{view.live.stability} / {view.live.maxStability}</td><th>{t.print.staStart}</th><td
							class="num">{view.live.stabilityStart ?? ''}</td
						></tr
					>
					<tr
						><th>MP</th><td class="num">{view.live.mp} / {view.live.maxMp}</td><th>{t.live.luck}</th><td class="num"
							>{view.live.luck ?? ''}</td
						></tr
					>
					<tr
						><th>BEW</th><td class="num">{view.secondary.movement.value ?? ''}</td><th>{t.print.dodge}</th><td class="num"
							>{view.secondary.dodge.value ?? ''}</td
						></tr
					>
					<tr
						><th>SB</th><td class="num">{view.secondary.damageBonus.value ?? ''}</td><th>Status</th><td class="num"
							>{view.socialStatus.value}</td
						></tr
					>
					<tr
						><th>RS</th><td class="num">{view.live.armor}</td><th>{t.print.woundMalus}</th><td class="num"
							>{view.live.woundMalus || ''}</td
						></tr
					>
				</tbody>
			</table>
			{#if view.live.conditions.length}
				<p>
					<strong>{t.live.conditions}:</strong>
					{view.live.conditions.map((c) => ruleData.conditions.find((x) => x.id === c)?.name ?? c).join(', ')}
				</p>
			{/if}
		</section>

		<section class="block wide">
			<h2>{t.print.skills}</h2>
			<div class="columns">
				<table>
					<thead><tr><th></th><th class="num">{t.skills.value}</th><th class="num">½</th><th class="num">⅕</th></tr></thead>
					<tbody>
						{#each general as s (s.key)}
							<tr class:marked={view.professionStep.skills.includes(s.key)}>
								<td>{s.name}</td><td class="num">{s.value ?? ''}</td><td class="num small">{s.half ?? ''}</td><td
									class="num small">{s.fifth ?? ''}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="small">{t.print.professionMarked}</p>
		</section>

		<section class="block">
			<h2>{t.print.heroSkills}</h2>
			<table>
				<tbody>
					{#each heroes as s (s.key)}
						<tr class:marked={!!s.setValue}
							><td>{s.name}</td><td class="num">{s.value ?? ''}</td><td class="num small">{s.half ?? ''}</td><td class="num small"
								>{s.fifth ?? ''}</td
							></tr
						>
					{/each}
				</tbody>
			</table>
		</section>

		<section class="block">
			<h2>{t.print.specials}</h2>
			<ul>
				{#each view.speciesStep.traits as tr (tr.id)}<li><strong>{tr.name}</strong> ({species?.name})</li>{/each}
				{#if religion}<li><strong>{religion.blessing}</strong> ({religion.name})</li>{/if}
				{#each view.characteristicStep.slots.filter((s) => s.id && !s.duplicate) as s (s.index)}<li>
						<strong>{s.name}</strong> ({t.steps.characteristic})
					</li>{/each}
				{#if origin}<li><strong>{origin.name}</strong>: {origin.abilities.map((a) => a.name).join(', ')}</li>{/if}
				{#each view.stuntStep.stunts.filter((s) => s.chosen) as s (s.id)}<li>
						<strong>{s.name}</strong> ({t.steps.stunts})
					</li>{/each}
				{#each techniques as tech (tech!.id)}<li><strong>{tech!.name}</strong> ({t.steps.combat}, {tech!.kind})</li>{/each}
				{#if style}<li><strong>{style.name}</strong></li>{/if}
				{#each spells as spell (spell!.id)}<li>
						<strong>{spell!.name}</strong> ({t.steps.magic}, {spell!.tier === 0 ? t.print.basic : `Stufe ${spell!.tier}`})
					</li>{/each}
				{#each view.live.resources as r (r.id)}<li>☐ {r.name}</li>{/each}
				{#each view.live.counters as c (c.id)}<li>{c.name}: {c.value}/{c.max}</li>{/each}
			</ul>
		</section>

		<section class="block">
			<h2>{t.print.equipment}</h2>
			<p>
				<strong>{t.equipment.purse}:</strong>
				{money(view.live.money)} · <strong>{t.equipment.daily}:</strong>
				{money(view.equipmentStep.daily)}
			</p>
			<ul>
				{#each view.equipmentStep.items as item (item.key)}
					<li>
						{item.equipped ? '◼' : '◻'} <strong>{item.name}</strong>{item.quantity > 1 ? ` ×${item.quantity}` : ''}
						{#if Object.keys(item.stats).length}<span class="small"
								>({Object.entries(item.stats)
									.map(([k, v]) => `${k} ${v}`)
									.join(', ')})</span
							>{/if}
					</li>
				{/each}
			</ul>
		</section>

		<section class="block wide">
			<h2>{t.steps.background}</h2>
			<dl>
				{#each [['appearance', t.background.appearance], ['description', t.background.description], ['belief', t.background.belief], ['worldview', t.background.worldview], ['places', t.background.places], ['possession', t.background.possession], ['traits', t.background.traits], ['birthplace', t.background.birthplace], ['residence', t.background.residence]] as const as [field, label] (field)}
					{#if b[field]}<dt>{label}</dt>
						<dd>{b[field]}</dd>{/if}
				{/each}
				{#if b.people.length}
					<dt>{t.background.people}</dt>
					<dd>{b.people.map((p) => [p.name, p.relation, p.reason].filter(Boolean).join(' – ')).join('; ')}</dd>
				{/if}
				{#if b.languages.length}
					<dt>{t.background.languages}</dt>
					<dd>{b.languages.map((l) => `${languageName(l.id)}${l.writing ? ` (${t.print.writing})` : ''}`).join(', ')}</dd>
				{/if}
			</dl>
		</section>
	</article>
{/if}

<style>
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	.sheet {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem 1rem;
		font-size: 0.88rem;
	}
	.title,
	.wide {
		grid-column: 1 / -1;
	}
	.title h1 {
		margin: 0;
	}
	.title p {
		margin: 0.1rem 0 0;
	}
	.block {
		border: 1px solid var(--line);
		border-radius: 0.4rem;
		padding: 0.4rem 0.6rem;
		break-inside: avoid;
	}
	h2 {
		font-size: 1rem;
		margin: 0 0 0.3rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		text-align: left;
		padding: 0.08rem 0.25rem;
		border-bottom: 1px solid var(--line);
	}
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.small {
		font-size: 0.8em;
		color: var(--muted);
	}
	.marked td:first-child {
		font-weight: 700;
	}
	.columns {
		columns: 2;
		column-gap: 1rem;
	}
	.columns table {
		break-inside: auto;
	}
	ul {
		margin: 0;
		padding-left: 1rem;
	}
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.15rem 0.6rem;
		margin: 0;
	}
	dt {
		font-weight: 600;
	}
	dd {
		margin: 0;
	}
	@media (max-width: 40rem) {
		.sheet {
			grid-template-columns: 1fr;
		}
		.columns {
			columns: 1;
		}
	}
	@media print {
		.sheet {
			grid-template-columns: 1fr 1fr;
			font-size: 9pt;
		}
		.columns {
			columns: 2;
		}
		.block {
			border-color: #999;
		}
		th,
		td {
			border-color: #ccc;
		}
		.small {
			color: #555;
		}
	}
</style>
