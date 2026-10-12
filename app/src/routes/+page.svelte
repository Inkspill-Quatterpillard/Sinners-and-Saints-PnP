<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import {
		computeView,
		createCharacter,
		duplicateCharacter,
		parseCharacterFile,
		type Character,
		type CharacterView
	} from '$lib/engine';
	import { downloadCharacter } from '$lib/download';
	import { ruleData } from '$lib/ruleData';
	import { deleteCharacter, listCharacters, loadCharacter, saveCharacter } from '$lib/storage/characterStore';
	import { t } from '$lib/texts';

	let characters = $state.raw<{ character: Character; view: CharacterView }[] | undefined>();
	let message = $state('');

	async function refresh() {
		const all = await listCharacters();
		characters = all.map((character) => ({ character, view: computeView(character, ruleData) }));
	}

	$effect(() => {
		refresh();
	});

	async function newCharacter() {
		const character = createCharacter(crypto.randomUUID(), ruleData.version);
		await saveCharacter(character);
		await goto(`${base}/charakter/${character.id}`);
	}

	async function duplicate(c: Character) {
		await saveCharacter(duplicateCharacter(c, crypto.randomUUID()));
		await refresh();
	}

	async function remove(c: CharacterView) {
		if (!confirm(t.list.confirmDelete(c.name || t.unnamed))) return;
		await deleteCharacter(c.id);
		await refresh();
	}

	async function importFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		const result = parseCharacterFile(await file.text());
		if (!result.ok) {
			message = result.error;
			return;
		}
		let character = result.character;
		// Ist die ID schon vergeben, wird der Import als eigener Charakter gespeichert.
		if (await loadCharacter(character.id)) character = { ...character, id: crypto.randomUUID() };
		await saveCharacter(character);
		message = t.list.imported(character.basis.name || t.unnamed);
		await refresh();
	}
</script>

<h1>{t.characters}</h1>

{#if message}<p class="message">{message}</p>{/if}

{#if characters === undefined}
	<p>{t.loading}</p>
{:else if characters.length === 0}
	<p>{t.noCharacters}</p>
{:else}
	<ul class="list">
		{#each characters as { character, view } (view.id)}
			<li>
				<div class="main">
					<a href={view.status === 'finished' ? `${base}/charakter/${view.id}/bogen` : `${base}/charakter/${view.id}`}
						>{view.name || t.unnamed}</a
					>
					<span class="status">{t.status[view.status]}</span>
					{#if view.ruleDataChanged}<span class="warn">{t.list.ruleDataChanged}</span>{/if}
				</div>
				<div class="actions">
					<button onclick={() => downloadCharacter(character)}>{t.list.export}</button>
					<button onclick={() => duplicate(character)}>{t.list.duplicate}</button>
					<button class="danger" onclick={() => remove(view)}>{t.list.delete}</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<div class="bottom">
	<button class="primary" onclick={newCharacter}>{t.newCharacter}</button>
	<label class="button">
		{t.list.import}
		<input type="file" accept=".json,application/json" onchange={importFile} />
	</label>
</div>

<style>
	.list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}
	/* Die ganze Karte öffnet den Charakter; die Knöpfe liegen darüber. */
	.list li {
		position: relative;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		display: grid;
		gap: 0.5rem;
	}
	.main {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-items: baseline;
	}
	.main a {
		font-weight: 600;
		font-size: 1.1rem;
	}
	.main a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 0.5rem;
	}
	.list li:hover {
		border-color: var(--accent);
	}
	.status {
		color: var(--muted);
	}
	.warn {
		color: var(--warn);
		font-size: 0.9rem;
	}
	.actions {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.actions button {
		padding: 0.25rem 0.6rem;
		font-size: 0.9rem;
	}
	.danger {
		color: var(--danger);
	}
	.bottom {
		display: flex;
		gap: 0.6rem;
		align-items: center;
	}
	.button {
		display: inline-block;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.4rem;
		padding: 0.45rem 0.7rem;
		cursor: pointer;
	}
	.button input {
		display: none;
	}
	.message {
		border-left: 4px solid var(--accent);
		padding-left: 0.6rem;
	}
</style>
