<script lang="ts">
	import InfoButton from '$lib/components/InfoButton.svelte';
	import ValueBreakdown from '$lib/components/ValueBreakdown.svelte';
	import type { CharacterView } from '$lib/engine';
	import { ruleData, type AttributeId } from '$lib/ruleData';
	import { t } from '$lib/texts';
	import type { Snippet } from 'svelte';

	/** Ein Grundattribut; antippen zeigt Beschreibung und Zusammensetzung des Werts. */
	let { id, view, children }: { id: AttributeId; view: CharacterView; children?: Snippet } = $props();

	const def = $derived(ruleData.attributes.find((a) => a.id === id)!);
	const a = $derived(view.attributes[id]);
</script>

<InfoButton title={`${def.name} (${def.id})`} text={def.description}>
	{#if children}{@render children()}{:else}{id}{/if}
	{#snippet details()}
		<ValueBreakdown label={def.name} baseLabel={t.valueBase} base={a.base} modifiers={a.modifiers} value={a.effective} />
	{/snippet}
</InfoButton>
