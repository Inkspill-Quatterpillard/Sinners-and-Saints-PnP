<script lang="ts">
	import InfoButton from '$lib/components/InfoButton.svelte';
	import type { SkillView } from '$lib/engine';
	import { skillOrigin } from '$lib/format';
	import { ruleData } from '$lib/ruleData';

	/** Name einer Fertigkeit; antippen öffnet ihre Beschreibung. */
	let { skill }: { skill: SkillView } = $props();

	const def = $derived([...ruleData.skills, ...ruleData.heroSkills].find((d) => d.id === skill.skillId));
</script>

{#if def}
	<InfoButton title={skill.name} meta={skillOrigin(skill)} text={def.description}>{skill.name}</InfoButton>
{:else}
	{skill.name}
{/if}
