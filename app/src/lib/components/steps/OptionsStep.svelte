<script lang="ts">
	import type { Action, CharacterView } from '$lib/engine';
	import { ruleData } from '$lib/ruleData';
	import { t } from '$lib/texts';

	let { view, dispatch }: { view: CharacterView; dispatch: (a: Action) => void } = $props();
</script>

<p class="intro">{t.options.intro}</p>

<fieldset>
	<legend>{t.options.optionalRules}</legend>
	{#each ruleData.optionalRules as rule (rule.id)}
		<label class="check">
			<input
				type="checkbox"
				checked={view.options.optionalRules[rule.id]}
				onchange={(e) => dispatch({ type: 'setOptionalRule', rule: rule.id, enabled: e.currentTarget.checked })}
			/>
			{rule.name}
		</label>
	{/each}
</fieldset>

<fieldset>
	<legend>{t.options.setting}</legend>
	{#each ruleData.settings as setting (setting.id)}
		<label class="check">
			<input
				type="radio"
				name="setting"
				checked={view.options.setting === setting.id}
				onchange={() => dispatch({ type: 'setSetting', setting: setting.id })}
			/>
			{setting.name}
		</label>
	{/each}
</fieldset>

<style>
	fieldset {
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		margin: 0 0 1rem;
		display: grid;
		gap: 0.4rem;
	}
	.check {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.intro {
		color: var(--muted);
	}
</style>
