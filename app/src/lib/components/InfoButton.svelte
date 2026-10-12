<script lang="ts">
	import RuleText from '$lib/components/RuleText.svelte';
	import { t } from '$lib/texts';
	import type { Snippet } from 'svelte';

	/** Ein antippbarer Begriff, der eine kurze Erklärung als Pop-up öffnet. */
	interface Props {
		title: string;
		text: string;
		meta?: string;
		children: Snippet;
	}

	let { title, text, meta, children }: Props = $props();
	let dialog: HTMLDialogElement;
</script>

<button type="button" class="term" onclick={() => dialog.showModal()}>{@render children()}</button>

<dialog bind:this={dialog} onclick={(e) => e.target === dialog && dialog.close()}>
	<article>
		<header>
			<h3>{title}</h3>
			<button type="button" class="close" aria-label={t.close} onclick={() => dialog.close()}>×</button>
		</header>
		{#if meta}<p class="meta">{meta}</p>{/if}
		<RuleText {text} />
	</article>
</dialog>

<style>
	.term {
		background: none;
		border: none;
		padding: 0;
		text-align: left;
		color: inherit;
		text-decoration: underline dotted var(--muted);
		text-underline-offset: 0.2em;
	}
	dialog {
		max-width: min(32rem, calc(100vw - 2rem));
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--line);
		border-radius: 0.6rem;
		padding: 0;
	}
	dialog::backdrop {
		background: rgb(0 0 0 / 0.5);
	}
	article {
		padding: 0.8rem 1rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
	}
	h3 {
		margin: 0;
	}
	.close {
		background: none;
		border: none;
		font-size: 1.4rem;
		line-height: 1;
		padding: 0 0.2rem;
	}
	.meta {
		color: var(--muted);
		margin: 0.2rem 0 0.4rem;
	}
</style>
