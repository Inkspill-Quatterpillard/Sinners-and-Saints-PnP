<script lang="ts">
	import InfoButton from '$lib/components/InfoButton.svelte';
	import type { CharacterView } from '$lib/engine';
	import { buildLookup } from '$lib/lookup';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	/** Alle Besonderheiten des Charakters; antippen öffnet den Regeltext als Pop-up. */
	let { view }: { view: CharacterView } = $props();

	const entries = new Map(buildLookup(ruleData).map((e) => [e.key, e]));
	const items = $derived.by(() => {
		const list: { group: string; name: string; key: string }[] = [];
		for (const tr of view.speciesStep.traits) list.push({ group: t.specials.traits, name: tr.name, key: `trait:${tr.id}` });
		const religion = ruleData.religions.find((r) => r.id === view.religionStep.selected);
		if (religion)
			list.push({ group: t.specials.religion, name: `${religion.name} (${religion.blessing})`, key: `religion:${religion.id}` });
		for (const s of view.characteristicStep.slots) {
			if (s.id && !s.duplicate) list.push({ group: t.specials.characteristic, name: s.name!, key: `characteristic:${s.id}` });
		}
		const origin = ruleData.origins.find((o) => o.id === view.originStep.selected);
		if (origin && view.originStep.choice === 'origin')
			list.push({ group: t.specials.origin, name: origin.name, key: `origin:${origin.id}` });
		for (const s of view.stuntStep.stunts.filter((x) => x.chosen))
			list.push({ group: t.specials.stunts, name: s.name, key: `stunt:${s.id}` });
		for (const skill of view.combatStep.skills) {
			for (const id of skill.chosen) {
				const tech = ruleData.combat.techniques.find((x) => x.id === id);
				if (tech) list.push({ group: t.specials.techniques, name: `${tech.name} (${skill.name})`, key: `technique:${id}` });
			}
		}
		const style = ruleData.combat.styles.find((s) => s.id === view.combatStep.style);
		if (style) list.push({ group: t.specials.style, name: style.name, key: `style:${style.id}` });
		for (const d of view.magicStep.disciplines) {
			for (const id of [...d.basics, ...d.chosen]) {
				const spell = ruleData.magic.spells.find((s) => s.id === id);
				if (spell) list.push({ group: t.specials.spells, name: `${spell.name} (${d.name})`, key: `spell:${id}` });
			}
		}
		return list;
	});
	const groups = $derived([...new Set(items.map((i) => i.group))]);
</script>

{#if items.length}
	<section>
		<h2>{t.specials.title}</h2>
		{#each groups as group (group)}
			<h3>{group}</h3>
			<ul>
				{#each items.filter((i) => i.group === group) as item (item.key)}
					{@const entry = entries.get(item.key)}
					<li>
						{#if entry}
							<InfoButton title={entry.name} meta={entry.meta} text={entry.text}>{item.name}</InfoButton>
						{:else}
							{item.name}
						{/if}
					</li>
				{/each}
			</ul>
		{/each}
	</section>
{/if}

<style>
	h3 {
		margin: 0.7rem 0 0.2rem;
		font-size: 0.95rem;
		color: var(--muted);
	}
	ul {
		margin: 0;
		padding-left: 1.1rem;
	}
</style>
