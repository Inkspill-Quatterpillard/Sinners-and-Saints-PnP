<script lang="ts">
	import { goto } from '$app/navigation';
	import { createCharacter, computeView, type CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { listCharacters, saveCharacter } from '$lib/storage/characterStore';
	import { t } from '$lib/texts';

	let characters = $state.raw<CharacterView[] | undefined>();

	$effect(() => {
		listCharacters().then((all) => {
			characters = all.map((c) => computeView(c, ruleData));
		});
	});

	async function newCharacter() {
		const character = createCharacter(crypto.randomUUID(), ruleData.version);
		await saveCharacter(character);
		await goto(`/charakter/${character.id}`);
	}
</script>

<h1>{t.characters}</h1>

{#if characters === undefined}
	<p>{t.loading}</p>
{:else if characters.length === 0}
	<p>{t.noCharacters}</p>
{:else}
	<ul class="list">
		{#each characters as c (c.id)}
			<li>
				<a href="/charakter/{c.id}">{c.name || t.unnamed}</a>
				<span class="status">{t.status[c.status]}</span>
			</li>
		{/each}
	</ul>
{/if}

<button class="primary" onclick={newCharacter}>{t.newCharacter}</button>

<style>
	.list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}
	.list li {
		display: flex;
		justify-content: space-between;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
	}
	.status {
		color: var(--muted);
	}
</style>
