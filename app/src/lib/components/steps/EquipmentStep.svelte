<script lang="ts">
	import ValueBreakdown from '$lib/components/ValueBreakdown.svelte';
	import { currencyOf, type Action, type CharacterView } from '$lib/engine';
	import { formatMoney, parseMoney } from '$lib/money';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const eq = $derived(view.equipmentStep);
	const currency = $derived(currencyOf(ruleData, eq.currency));
	const money = (n: number) => formatMoney(n, currency);

	const groups = ['melee', 'ranged', 'armor', 'shield', 'gear'] as const;
	let group = $state<(typeof groups)[number]>('melee');
	let search = $state('');
	const catalog = $derived(
		ruleData.equipment.filter(
			(i) =>
				i.setting === view.options.setting &&
				(search ? `${i.name} ${i.category}`.toLowerCase().includes(search.toLowerCase()) : i.group === group)
		)
	);
	const categories = $derived([...new Set(catalog.map((i) => i.category))]);

	let freeName = $state('');
	let freePrice = $state('');
	function addFree(found: boolean) {
		if (!freeName.trim()) return;
		dispatch({ type: 'addItem', name: freeName.trim(), price: parseMoney(freePrice, currency) ?? 0, found });
		freeName = '';
		freePrice = '';
	}
	// Wischen über den Katalog wechselt die Kategorie (am Handy).
	let touch: { x: number; y: number } | undefined;
	function swipe(e: TouchEvent) {
		const start = touch;
		touch = undefined;
		const end = e.changedTouches[0];
		if (!start || search) return;
		const dx = end.clientX - start.x;
		if (Math.abs(dx) < 60 || Math.abs(dx) < 2 * Math.abs(end.clientY - start.y)) return;
		const i = groups.indexOf(group) + (dx < 0 ? 1 : -1);
		if (i >= 0 && i < groups.length) group = groups[i];
	}

	const statsText = (stats: Record<string, string>) =>
		Object.entries(stats)
			.map(([k, v]) => `${k}: ${v}`)
			.join(' · ');
</script>

<p class="intro">{t.equipment.intro}</p>

<dl class="money">
	<div>
		<dt>{t.equipment.stage}</dt>
		<dd>{eq.stageName} ({t.equipment.status(view.socialStatus.value)})</dd>
	</div>
	<div>
		<dt>{t.equipment.purse}</dt>
		<dd>{money(eq.purse)}</dd>
	</div>
	<div>
		<dt>{t.equipment.daily}</dt>
		<dd>{money(eq.daily)}</dd>
	</div>
	<div>
		<dt>{t.equipment.possessions}</dt>
		<dd>{money(eq.possessions.amount)}{eq.possessions.open ? '+' : ''}</dd>
	</div>
	<div class:over={eq.remaining < 0}>
		<dt>{t.equipment.remaining}</dt>
		<dd>{money(eq.remaining)}</dd>
	</div>
</dl>
<details class="status">
	<summary>{t.equipment.statusOrigin}</summary>
	<ValueBreakdown
		label={t.statusLabel}
		baseLabel={t.statusStart}
		base={view.socialStatus.base}
		modifiers={view.socialStatus.modifiers}
		value={view.socialStatus.value}
	/>
</details>

<section>
	<h3>{t.equipment.owned}</h3>
	{#if eq.items.length === 0}
		<p class="hint">{t.equipment.nothing}</p>
	{/if}
	<ul class="owned">
		{#each eq.items as item (item.key)}
			<li>
				<div class="name">
					<strong>{item.name}</strong>
					{#if item.found}<small>{t.equipment.found}</small>{/if}
					{#if Object.keys(item.stats).length}<small>{statsText(item.stats)}</small>{/if}
					{#if item.foreignCurrency}<small>{t.equipment.converted}</small>{/if}
					{#if item.priceMax}<small>{t.equipment.range(money(item.price), money(item.priceMax))}</small>{/if}
				</div>
				<label class="qty">
					<span class="sr">{t.equipment.quantity}</span>
					<input
						type="number"
						min="1"
						value={item.quantity}
						aria-label={t.equipment.quantityOf(item.name)}
						oninput={(e) => dispatch({ type: 'updateItem', key: item.key, quantity: Number(e.currentTarget.value) || 1 })}
					/>
				</label>
				<input
					class="price"
					value={money(item.price)}
					aria-label={t.equipment.priceOf(item.name)}
					onchange={(e) => {
						const p = parseMoney(e.currentTarget.value, currency);
						if (p !== undefined) dispatch({ type: 'updateItem', key: item.key, price: p });
					}}
				/>
				<span class="actions">
					<button aria-label={t.equipment.sellOf(item.name)} onclick={() => dispatch({ type: 'sellItem', key: item.key })}
						>{t.equipment.sell}</button
					>
					<button aria-label={t.equipment.loseOf(item.name)} onclick={() => dispatch({ type: 'loseItem', key: item.key })}
						>{t.equipment.lose}</button
					>
				</span>
			</li>
		{/each}
	</ul>
	<form class="free" onsubmit={(e) => (e.preventDefault(), addFree(false))}>
		<input bind:value={freeName} placeholder={t.equipment.freeName} aria-label={t.equipment.freeName} />
		<input bind:value={freePrice} placeholder={t.equipment.freePrice} aria-label={t.equipment.freePrice} size="8" />
		<button type="submit" disabled={!freeName.trim()}>{t.equipment.buy}</button>
		<button type="button" disabled={!freeName.trim()} onclick={() => addFree(true)}>{t.equipment.find}</button>
	</form>
	<p class="hint">{t.equipment.tradeHint}</p>
</section>

<section
	aria-label={t.equipment.catalog}
	ontouchstart={(e) => (touch = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
	ontouchend={swipe}
>
	<h3>{t.equipment.catalog}</h3>
	<div class="sticky">
		<div class="tabs" role="tablist">
			{#each groups as g (g)}
				<button
					role="tab"
					aria-selected={group === g && !search}
					class:active={group === g && !search}
					onclick={() => ((group = g), (search = ''))}
				>
					{t.equipment.groups[g]}
				</button>
			{/each}
		</div>
		<input type="search" placeholder={t.equipment.search} aria-label={t.equipment.search} bind:value={search} />
	</div>
	<p class="hint swipe">{t.equipment.swipeHint}</p>
	{#each categories as category (category)}
		<h4>{category}</h4>
		<ul class="catalog">
			{#each catalog.filter((i) => i.category === category) as entry (entry.id)}
				<li>
					<div class="name">
						<strong>{entry.name}</strong>
						{#if Object.keys(entry.stats).length}<small>{statsText(entry.stats)}</small>{/if}
					</div>
					<span class="cost">{entry.priceText || '–'}</span>
					<span class="actions">
						<button aria-label={t.equipment.buyOf(entry.name)} onclick={() => dispatch({ type: 'addItem', catalogId: entry.id })}
							>{t.equipment.buy}</button
						>
						<button
							aria-label={t.equipment.findOf(entry.name)}
							onclick={() => dispatch({ type: 'addItem', catalogId: entry.id, found: true })}>{t.equipment.find}</button
						>
					</span>
				</li>
			{/each}
		</ul>
	{/each}
</section>

<style>
	.intro,
	.hint,
	small {
		color: var(--muted);
	}
	small {
		display: block;
		font-size: 0.82rem;
	}
	.money {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
		gap: 0.5rem;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.6rem 0.9rem;
	}
	.money dt {
		color: var(--muted);
		font-size: 0.82rem;
	}
	.money dd {
		margin: 0;
		font-weight: 600;
	}
	.money .over dd {
		color: var(--warn);
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.owned li,
	.catalog li {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding: 0.35rem 0;
		border-bottom: 1px solid var(--line);
	}
	.name {
		flex: 1;
		min-width: 0;
	}
	/* Eigene Gegenstände: am Handy stehen Menge, Preis und Knöpfe unter dem Namen. */
	.owned li {
		flex-wrap: wrap;
	}
	.owned .name {
		flex: 1 1 12rem;
	}
	.free input {
		min-width: 0;
	}
	.qty input {
		width: 3.4rem;
	}
	.price {
		width: 6.5rem;
	}
	.cost {
		white-space: nowrap;
		color: var(--muted);
		font-size: 0.88rem;
	}
	.free {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.6rem;
	}
	.free input:first-child {
		flex: 1 1 10rem;
	}
	/* Damit beim Fokussieren nichts unter den klebenden Kategorien verschwindet. */
	.catalog li {
		scroll-margin-top: 7rem;
	}
	.sticky {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--bg);
		padding: 0.4rem 0;
	}
	.tabs {
		display: flex;
		gap: 0.3rem;
		margin-bottom: 0.5rem;
		overflow-x: auto;
	}
	.tabs button {
		white-space: nowrap;
	}
	.actions {
		display: flex;
		gap: 0.3rem;
	}
	.actions button {
		padding: 0.2rem 0.5rem;
		font-size: 0.88rem;
	}
	.swipe {
		display: none;
		font-size: 0.82rem;
	}
	@media (pointer: coarse) {
		.swipe {
			display: block;
		}
	}
	.tabs .active {
		border-color: var(--accent);
		color: var(--accent);
	}
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
	h4 {
		margin: 0.8rem 0 0.2rem;
	}
</style>
