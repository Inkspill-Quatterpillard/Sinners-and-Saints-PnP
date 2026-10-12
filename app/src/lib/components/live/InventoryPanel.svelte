<script lang="ts">
	import { currencyOf, type Action, type CharacterView } from '$lib/engine';
	import { formatMoney, parseMoney } from '$lib/money';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const live = $derived(view.live);
	const currency = $derived(currencyOf(ruleData, view.options.setting));
	const money = (n: number) => formatMoney(n, currency);
	const periods = $derived(t.live.periods as Record<string, string>);

	let amount = $state('');
	function change(sign: 1 | -1) {
		const value = parseMoney(amount, currency);
		if (!value) return;
		dispatch({ type: 'changeMoney', delta: sign * value });
		amount = '';
	}

	let search = $state('');
	const matches = $derived(
		search.trim().length >= 2
			? ruleData.equipment
					.filter((i) => i.setting === view.options.setting && i.name.toLowerCase().includes(search.toLowerCase()))
					.slice(0, 8)
			: []
	);
	function addFree() {
		if (!search.trim()) return;
		dispatch({ type: 'addItem', name: search.trim(), price: 0 });
		search = '';
	}
</script>

<section class="panel">
	<h2>{t.live.moneyAndGear}</h2>
	<div class="money">
		<strong class:negative={live.money < 0}>{money(live.money)}</strong>
		<input bind:value={amount} placeholder={t.live.amount} aria-label={t.live.amount} size="10" />
		<button onclick={() => change(1)} disabled={!amount}>{t.live.income}</button>
		<button onclick={() => change(-1)} disabled={!amount}>{t.live.expense}</button>
	</div>

	<h3>{t.live.inventory} <small>{t.live.armor(live.armor)}</small></h3>
	<ul class="items">
		{#each view.equipmentStep.items as item (item.key)}
			<li>
				<label class="check">
					<input type="checkbox" checked={!!item.equipped} onchange={() => dispatch({ type: 'toggleEquipped', key: item.key })} />
					<span>
						<strong>{item.name}</strong>{item.quantity > 1 ? ` ×${item.quantity}` : ''}
						{#if Object.keys(item.stats).length}
							<small
								>{Object.entries(item.stats)
									.map(([k, v]) => `${k}: ${v}`)
									.join(' · ')}</small
							>
						{/if}
					</span>
				</label>
				<button aria-label={t.equipment.remove(item.name)} onclick={() => dispatch({ type: 'removeItem', key: item.key })}
					>×</button
				>
			</li>
		{/each}
	</ul>
	<p class="hint">{t.live.equippedHint}</p>
	<form
		class="add"
		onsubmit={(e) => {
			e.preventDefault();
			addFree();
		}}
	>
		<input bind:value={search} placeholder={t.live.addItem} aria-label={t.live.addItem} />
		<button type="submit" disabled={!search.trim()}>{t.live.addFree}</button>
	</form>
	{#if matches.length}
		<ul class="matches">
			{#each matches as m (m.id)}
				<li>
					<span>{m.name} <small>{m.priceText}</small></span>
					<button
						onclick={() => {
							dispatch({ type: 'addItem', catalogId: m.id });
							search = '';
						}}>{t.equipment.add}</button
					>
				</li>
			{/each}
		</ul>
	{/if}

	{#if live.resources.length || live.counters.length}
		<h3>{t.live.abilities}</h3>
		<ul class="resources">
			{#each live.resources as r (r.id)}
				<li>
					<span>
						<strong>{r.name}</strong>
						<small>{r.source} · {periods[r.per]} · {t.live.used(r.used, r.uses)}</small>
					</span>
					<span class="row">
						<button disabled={r.used >= r.uses} onclick={() => dispatch({ type: 'useResource', id: r.id })}>{t.live.use}</button>
						<button disabled={r.used === 0} onclick={() => dispatch({ type: 'resetResource', id: r.id })}>↺</button>
					</span>
				</li>
			{/each}
			{#each live.counters as c (c.id)}
				<li>
					<span><strong>{c.name}</strong> <small>{c.source}</small></span>
					<span class="row">
						<button
							aria-label={t.live.minus(c.name)}
							onclick={() => dispatch({ type: 'setCounter', id: c.id, value: c.value - 1 })}>−</button
						>
						<strong>{c.value}/{c.max}</strong>
						<button
							aria-label={t.live.plus(c.name)}
							onclick={() => dispatch({ type: 'setCounter', id: c.id, value: c.value + 1 })}>+</button
						>
					</span>
				</li>
			{/each}
		</ul>
		<button onclick={() => dispatch({ type: 'newDay' })}>{t.live.newDay}</button>
	{/if}
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
	h3 {
		margin: 0.9rem 0 0.3rem;
		font-size: 1rem;
	}
	h3 small,
	small,
	.hint {
		color: var(--muted);
		font-weight: 400;
	}
	small {
		display: block;
		font-size: 0.82rem;
	}
	.money,
	.add,
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}
	.money strong {
		font-size: 1.3rem;
		margin-right: 0.4rem;
	}
	.money .negative {
		color: var(--warn);
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.items li,
	.matches li,
	.resources li {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		align-items: center;
		padding: 0.35rem 0;
		border-bottom: 1px solid var(--line);
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
	}
	.check input {
		margin-top: 0.3rem;
	}
	.add input {
		flex: 1;
		min-width: 0;
	}
	.hint {
		font-size: 0.85rem;
	}
</style>
