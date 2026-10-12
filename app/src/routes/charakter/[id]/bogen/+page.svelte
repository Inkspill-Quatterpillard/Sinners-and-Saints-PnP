<script lang="ts">
	import { page } from '$app/state';
	import DiceInput from '$lib/components/DiceInput.svelte';
	import Counter from '$lib/components/live/Counter.svelte';
	import Overridable from '$lib/components/live/Overridable.svelte';
	import RestPanel from '$lib/components/live/RestPanel.svelte';
	import InventoryPanel from '$lib/components/live/InventoryPanel.svelte';
	import Specials from '$lib/components/live/Specials.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import type { CurrentKey, OverrideKey } from '$lib/engine';
	import { parseCount } from '$lib/format';
	import { ruleData } from '$lib/ruleData';
	import { CharacterSession } from '$lib/session.svelte';
	import { t } from '$lib/texts';

	const session = new CharacterSession();
	const view = $derived(session.view);
	const live = $derived(view?.live);
	const dispatch = session.dispatch;

	$effect(() => {
		session.load(page.params.id!);
	});

	let damage = $state('');
	let lastHint = $state('');
	function takeDamage(e: SubmitEvent) {
		e.preventDefault();
		const amount = Math.floor(Number(damage));
		if (!live || !amount || amount < 0) return;
		const before = live.pendingWounds;
		dispatch({ type: 'takeDamage', amount });
		const after = session.view!.live;
		const wounds = after.pendingWounds - before;
		lastHint = after.conditions.includes('tot')
			? t.live.hintDead
			: wounds
				? t.live.hintWound(wounds)
				: after.tp === 0
					? t.live.hintDown
					: '';
		damage = '';
	}

	let healPoints = $state('');
	function heal(e: SubmitEvent) {
		e.preventDefault();
		const amount = parseCount(healPoints);
		if (!amount) return;
		dispatch({ type: 'healWounds', amount });
		healPoints = '';
	}

	const setCurrent = (key: CurrentKey, value: number) => dispatch({ type: 'setCurrent', key, value });
	const override = (key: OverrideKey, value: number | undefined) => dispatch({ type: 'overrideValue', key, value });

	const species = $derived(ruleData.species.find((s) => s.id === view?.speciesStep.selected));
	const mainSkills = $derived(
		view
			? view.skills.filter(
					(s) =>
						s.setValue ||
						view.professionStep.skills.includes(s.key) ||
						s.bonuses.some((b) => b.value > 0) ||
						(s.category !== 'general' && (s.value ?? 0) >= 10)
				)
			: []
	);
	const conditionGroups = ['body', 'mind', 'other'] as const;
	const short = (key: string) => ruleData.secondary.secondaryAttributes.find((s) => s.key === key)?.short ?? key;
	const secondaryKeys = ['movement', 'dodge', 'damageBonus', 'woundThreshold'] as const;
</script>

<p class="top">
	<a href="/">← {t.backToList}</a>
	<span class="history">
		<button onclick={session.undo} disabled={!session.canUndo}>{t.undo}</button>
		<button onclick={session.redo} disabled={!session.canRedo}>{t.redo}</button>
	</span>
</p>

{#if session.character === undefined}
	<p>{t.loading}</p>
{:else if session.character === null || !view || !live}
	<p>{t.notFound}</p>
{:else}
	<header>
		<h1>{view.name || t.unnamed}</h1>
		<p class="sub">
			{[species?.name, view.professionStep.name, view.ageStep.years !== undefined ? t.live.years(view.ageStep.years) : '']
				.filter(Boolean)
				.join(' · ')}
		</p>
		<p class="links">
			<a href="/charakter/{view.id}">{view.status === 'finished' ? t.live.editCreation : t.live.toCreation}</a>
			· <a href="/charakter/{view.id}/druck">{t.print.open}</a>
		</p>
		{#if view.ruleDataChanged}<p class="hint">{t.live.ruleDataChanged}</p>{/if}
		{#if view.status !== 'finished'}
			<p class="hint">{t.live.notFinished}</p>
		{/if}
	</header>

	<section class="counters">
		<Counter
			label={t.live.tp}
			short={short('tp')}
			value={live.tp}
			max={live.maxTp}
			warn={live.tp <= live.woundThreshold}
			onchange={(d) => setCurrent('tp', live.tp + d)}
			onset={(v) => setCurrent('tp', v)}
		/>
		<Counter
			label={t.live.stability}
			short={short('stability')}
			value={live.stability}
			max={live.maxStability}
			warn={live.stabilityWarning}
			onchange={(d) => setCurrent('stability', live.stability + d)}
			onset={(v) => setCurrent('stability', v)}
		/>
		<Counter
			label={t.live.mp}
			short={short('magicPoints')}
			value={live.mp}
			max={live.maxMp}
			warn={live.mp < 0}
			onchange={(d) => setCurrent('mp', live.mp + d)}
			onset={(v) => setCurrent('mp', v)}
		/>
		<Counter
			label={t.live.luck}
			short={short('luck')}
			value={live.luck ?? 0}
			onchange={(d) => setCurrent('luck', (live.luck ?? 0) + d)}
			onset={(v) => setCurrent('luck', v)}
		/>
	</section>

	<section class="combat">
		<form class="damage" onsubmit={takeDamage}>
			<label>
				{t.live.damage}
				<input bind:value={damage} type="number" min="1" inputmode="numeric" />
			</label>
			<button class="primary" type="submit" disabled={!damage}>{t.live.applyDamage}</button>
			<small>{t.live.threshold(live.woundThreshold)}</small>
		</form>
		{#if lastHint}<p class="hint-box">{lastHint}</p>{/if}
		{#if live.pendingWounds > 0}
			<div class="end-combat">
				<p>{t.live.pending(live.pendingWounds)}</p>
				<DiceInput
					count={live.pendingWounds}
					sides={6}
					onroll={(roll) => {
						dispatch({ type: 'endCombat', rolls: roll.dice.map((d) => ({ dice: [d], source: roll.source })) });
						lastHint = '';
					}}
				/>
			</div>
		{/if}
		{#if live.woundMalus}
			<p class="hint">{t.live.woundMalus(live.woundMalus)}</p>
			<h3>{t.live.heal}</h3>
			<form class="damage" onsubmit={heal}>
				<label>
					{t.live.healPoints}
					<input bind:value={healPoints} inputmode="numeric" size="4" />
				</label>
				<button type="submit" disabled={!healPoints.trim()}>{t.live.healApply}</button>
				<button type="button" onclick={() => dispatch({ type: 'healWounds', amount: 1, tp: 1 })}>{t.live.firstAid}</button>
			</form>
			<p class="hint">{t.live.healHint}</p>
		{/if}
	</section>

	<section class="luck">
		<h2>{t.live.luckSection}</h2>
		<div class="row">
			<DiceInput
				count={view.luck.dice}
				sides={ruleData.secondary.luckDie}
				onroll={(roll) => dispatch({ type: 'rerollLuck', roll })}
			/>
			<button class="small" onclick={() => dispatch({ type: 'fumble' })}>{t.live.fumble}</button>
		</div>
	</section>

	<RestPanel {view} {dispatch} />
	<InventoryPanel {view} {dispatch} />

	<section>
		<h2>{t.live.conditions}</h2>
		{#each conditionGroups as group (group)}
			<div class="chips">
				{#each ruleData.conditions.filter((c) => c.group === group) as c (c.id)}
					{@const active = live.conditions.includes(c.id)}
					<button
						class="chip"
						class:active
						aria-pressed={active}
						title={c.text}
						onclick={() => dispatch({ type: 'setCondition', condition: c.id, active: !active })}>{c.name}</button
					>
				{/each}
			</div>
		{/each}
	</section>

	<section>
		<h2>{t.live.values}</h2>
		<dl class="grid">
			{#each ruleData.attributes as a (a.id)}
				<div class="item">
					<dt>{a.id}</dt>
					<dd>{view.attributes[a.id].effective ?? '–'}</dd>
				</div>
			{/each}
		</dl>
		<dl class="grid">
			{#each secondaryKeys as key (key)}
				{@const def = ruleData.secondary.secondaryAttributes.find((s) => s.key === key)!}
				<Overridable
					label={def.short}
					value={view.secondary[key].value}
					overridden={live.overrides[key] !== undefined}
					onset={(v) => override(key, v)}
				/>
			{/each}
			<Overridable
				label={t.live.maxTpShort}
				value={live.maxTp}
				overridden={live.overrides.maxTp !== undefined}
				onset={(v) => override('maxTp', v)}
			/>
			<Overridable
				label={t.live.maxStaShort}
				value={live.maxStability}
				overridden={live.overrides.maxStability !== undefined}
				onset={(v) => override('maxStability', v)}
			/>
			<Overridable
				label={t.live.maxMpShort}
				value={live.maxMp}
				overridden={live.overrides.maxMp !== undefined}
				onset={(v) => override('maxMp', v)}
			/>
		</dl>
		<p class="hint">{t.live.overrideHint}</p>
	</section>

	<Specials {view} />

	<section>
		<h2>{t.live.skills}</h2>
		<SkillTable skills={mainSkills} />
		<details>
			<summary>{t.skills.all}</summary>
			<SkillTable skills={view.skills} />
		</details>
	</section>
{/if}

<style>
	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	header h1 {
		margin-bottom: 0;
	}
	.sub,
	.hint {
		color: var(--muted);
	}
	.links {
		margin: 0.2rem 0 0.8rem;
	}
	.counters {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	@media (min-width: 40rem) {
		.counters {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	.combat,
	.luck {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.6rem;
		padding: 0.7rem 0.9rem;
	}
	.damage {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: end;
	}
	.damage input {
		width: 5rem;
	}
	.damage small {
		color: var(--muted);
		flex-basis: 100%;
	}
	.hint-box {
		border-left: 4px solid var(--warn);
		padding-left: 0.6rem;
	}
	.end-combat {
		margin-top: 0.6rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-bottom: 0.4rem;
	}
	.chip {
		border-radius: 1rem;
		padding: 0.25rem 0.7rem;
		font-size: 0.9rem;
	}
	.chip.active {
		background: var(--danger);
		border-color: var(--danger);
		color: #fff;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.6rem;
		padding: 0.6rem;
		margin: 0 0 0.5rem;
	}
	.grid .item {
		text-align: center;
	}
	.grid dt {
		color: var(--muted);
		font-size: 0.8rem;
	}
	.grid dd {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 600;
	}
	.history {
		display: flex;
		gap: 0.4rem;
	}
	.history button:disabled {
		opacity: 0.4;
	}
	.luck {
		margin-top: 1rem;
	}
	.luck h2 {
		margin-top: 0;
	}
	.luck .row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}
	/* Gleich groß wie die Knöpfe der Würfeleingabe. */
	button.small {
		padding: 0.2rem 0.55rem;
		font-size: 0.9em;
	}
</style>
