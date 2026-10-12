<script lang="ts">
	import { page } from '$app/state';
	import { applyAction, computeView, type Action, type Character } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { loadCharacter, saveCharacter } from '$lib/storage/characterStore';
	import { t } from '$lib/texts';

	// Der Regelkern liefert bei jeder Aktion einen neuen Charakter, daher genügt $state.raw.
	let character = $state.raw<Character | undefined | null>();
	const view = $derived(character ? computeView(character, ruleData) : undefined);

	$effect(() => {
		loadCharacter(page.params.id!).then((c) => (character = c ?? null));
	});

	function dispatch(action: Action) {
		if (!character) return;
		character = applyAction(character, action, ruleData);
		saveCharacter(character);
	}
</script>

<p><a href="/">← {t.backToList}</a></p>

{#if character === undefined}
	<p>{t.loading}</p>
{:else if character === null || !view}
	<p>{t.notFound}</p>
{:else}
	<h1>{view.name || t.unnamed}</h1>
	<label>
		{t.name}
		<input value={view.name} oninput={(e) => dispatch({ type: 'setName', name: e.currentTarget.value })} />
	</label>
{/if}
