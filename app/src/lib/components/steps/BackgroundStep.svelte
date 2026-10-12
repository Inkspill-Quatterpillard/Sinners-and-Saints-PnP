<script lang="ts">
	import { rollDice } from '$lib/dice';
	import type { Action, BackgroundField, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();

	const tables = ruleData.background;
	const b = $derived(view.background);
	const set = (field: BackgroundField, value: string) => dispatch({ type: 'setBackground', field, value });
	const pick = <T,>(list: T[]): T => list[rollDice(1, list.length).dice[0] - 1];
	/** Nur der Leitsatz eines Tabelleneintrags, z. B. „Skeptiker. Religion … suspekt.“ → „Skeptiker“. */
	const headline = (entry: string) => entry.split('.')[0];

	let culture = $state(tables.names[0].id);
	let gender = $state<'male' | 'female'>('female');
	const names = $derived(tables.names.find((n) => n.id === culture)!);
	let suggestions = $state<string[]>([]);
	function suggest() {
		const list = names[gender];
		suggestions = Array.from({ length: 5 }, () => pick(list)).filter((n, i, all) => all.indexOf(n) === i);
	}
</script>

{#snippet tableField(field: BackgroundField, label: string, list: string[])}
	<label class="field">
		<span>{label}</span>
		<span class="row">
			<select
				value=""
				aria-label={t.background.fromTable(label)}
				onchange={(e) => e.currentTarget.value && set(field, e.currentTarget.value)}
			>
				<option value="">{t.background.choose}</option>
				{#each list as entry, i (i)}<option value={entry}>{i + 1}. {headline(entry)}</option>{/each}
			</select>
			<button type="button" onclick={() => set(field, pick(list))}>{t.background.rollW10(list.length)}</button>
		</span>
		<textarea rows="2" value={b[field] ?? ''} oninput={(e) => set(field, e.currentTarget.value)}></textarea>
	</label>
{/snippet}

<p class="intro">{t.background.intro}</p>

<section>
	<h3>{t.background.identity}</h3>
	<label class="field">
		<span>{t.name}</span>
		<input value={view.name} oninput={(e) => dispatch({ type: 'setName', name: e.currentTarget.value })} />
	</label>
	<div class="row names">
		<select bind:value={culture} aria-label={t.background.culture}>
			{#each tables.names as n (n.id)}<option value={n.id}>{n.culture}</option>{/each}
		</select>
		<select bind:value={gender} aria-label={t.background.nameGender}>
			<option value="female">{t.background.female}</option>
			<option value="male">{t.background.male}</option>
		</select>
		<button type="button" onclick={suggest}>{t.background.suggest}</button>
	</div>
	{#if suggestions.length}
		<p class="row">
			{#each suggestions as s (s)}<button type="button" class="chip" onclick={() => dispatch({ type: 'setName', name: s })}
					>{s}</button
				>{/each}
		</p>
		<p class="hint">{names.notes}</p>
	{/if}
	<label class="field">
		<span>{t.background.gender}</span>
		<input value={b.gender ?? ''} oninput={(e) => set('gender', e.currentTarget.value)} />
	</label>
	<label class="field">
		<span>{t.background.appearance}</span>
		<span class="row">
			<input value={b.appearance ?? ''} oninput={(e) => set('appearance', e.currentTarget.value)} />
			<button
				type="button"
				onclick={() => set('appearance', [pick(tables.appearanceAdjectives), pick(tables.appearanceAdjectives)].join(', '))}
			>
				{t.background.rollAdjectives}
			</button>
		</span>
	</label>
	<label class="field">
		<span>{t.background.description}</span>
		<textarea rows="3" value={b.description ?? ''} oninput={(e) => set('description', e.currentTarget.value)}></textarea>
	</label>
</section>

<section>
	<h3>{t.background.beliefs}</h3>
	{@render tableField('belief', t.background.belief, tables.beliefs)}
	{@render tableField('worldview', t.background.worldview, tables.worldviews)}
</section>

<section>
	<h3>{t.background.people}</h3>
	{#each b.people as person, index (index)}
		<div class="person">
			<input
				value={person.name ?? ''}
				placeholder={t.name}
				aria-label={t.background.personName(index)}
				oninput={(e) => dispatch({ type: 'updatePerson', index, person: { name: e.currentTarget.value } })}
			/>
			<span class="row">
				<input
					value={person.relation ?? ''}
					placeholder={t.background.relation}
					aria-label={t.background.relation}
					oninput={(e) => dispatch({ type: 'updatePerson', index, person: { relation: e.currentTarget.value } })}
				/>
				<button
					type="button"
					onclick={() => dispatch({ type: 'updatePerson', index, person: { relation: pick(tables.personRelations) } })}
					>{t.background.rollW10(10)}</button
				>
			</span>
			<span class="row">
				<textarea
					rows="2"
					placeholder={t.background.reason}
					aria-label={t.background.reason}
					value={person.reason ?? ''}
					oninput={(e) => dispatch({ type: 'updatePerson', index, person: { reason: e.currentTarget.value } })}></textarea>
				<button
					type="button"
					onclick={() => dispatch({ type: 'updatePerson', index, person: { reason: pick(tables.personReasons) } })}
					>{t.background.rollW10(10)}</button
				>
			</span>
			<button type="button" class="remove" onclick={() => dispatch({ type: 'removePerson', index })}
				>{t.background.removePerson}</button
			>
		</div>
	{/each}
	<button type="button" onclick={() => dispatch({ type: 'addPerson' })}>{t.background.addPerson}</button>
</section>

<section>
	<h3>{t.background.more}</h3>
	{@render tableField('places', t.background.places, tables.places)}
	{@render tableField('possession', t.background.possession, tables.possessions)}
	<label class="field">
		<span>{t.background.traits}</span>
		<textarea rows="3" value={b.traits ?? ''} oninput={(e) => set('traits', e.currentTarget.value)}></textarea>
	</label>
	<label class="field">
		<span>{t.background.birthplace}</span>
		<input value={b.birthplace ?? ''} oninput={(e) => set('birthplace', e.currentTarget.value)} />
	</label>
	<label class="field">
		<span>{t.background.residence}</span>
		<input value={b.residence ?? ''} oninput={(e) => set('residence', e.currentTarget.value)} />
	</label>
</section>

<section>
	<h3>{t.background.languages}</h3>
	<ul class="langs">
		{#each tables.languages as lang (lang.id)}
			{@const known = b.languages.find((l) => l.id === lang.id)}
			<li>
				<label class="check" title={lang.text}>
					<input type="checkbox" checked={!!known} onchange={() => dispatch({ type: 'toggleLanguage', language: lang.id })} />
					{lang.name}
				</label>
				{#if known}
					<label class="check small">
						<input
							type="checkbox"
							checked={known.writing}
							onchange={(e) => dispatch({ type: 'setLanguageWriting', language: lang.id, writing: e.currentTarget.checked })}
						/>
						{t.background.writing(lang.script)}
					</label>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.intro,
	.hint {
		color: var(--muted);
	}
	.field {
		margin-bottom: 0.7rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}
	.row input,
	.row textarea {
		flex: 1;
		min-width: 0;
	}
	textarea {
		width: 100%;
		box-sizing: border-box;
	}
	.names {
		margin-bottom: 0.5rem;
	}
	.chip {
		border-radius: 1rem;
	}
	.person {
		display: grid;
		gap: 0.4rem;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.6rem;
		margin-bottom: 0.6rem;
	}
	.remove {
		justify-self: start;
	}
	.langs {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
		gap: 0.4rem;
	}
	.check {
		display: flex;
		gap: 0.4rem;
		align-items: center;
	}
	.check.small {
		font-size: 0.85rem;
		color: var(--muted);
		margin-left: 1.4rem;
	}
</style>
