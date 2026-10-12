<script lang="ts">
	import InfoButton from '$lib/components/InfoButton.svelte';
	import ValueBreakdown from '$lib/components/ValueBreakdown.svelte';
	import type { CharacterView } from '$lib/engine';
	import type { SecondaryDef } from '$lib/ruleData';
	import { t } from '$lib/texts';

	/** Ein Sekundärattribut; antippen zeigt Formel und Zusammensetzung des Werts. */
	let { def, view }: { def: SecondaryDef; view: CharacterView } = $props();

	const v = $derived(view.secondary[def.key]);
</script>

<InfoButton title={def.name} meta={t.formula(def.formula)} text={def.note ?? ''}>
	{def.short}
	{#snippet details()}
		<ValueBreakdown label={def.name} baseLabel={t.fromFormula} base={v.base} modifiers={v.modifiers} value={v.value} />
	{/snippet}
</InfoButton>
