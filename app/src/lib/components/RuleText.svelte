<script lang="ts">
	/**
	 * Zeigt Regeltext aus den Regeldaten an: Absätze, Aufzählungen sowie **fett** und _kursiv_.
	 * Es wird kein HTML aus den Daten übernommen, nur diese wenigen Auszeichnungen.
	 */
	let { text }: { text: string } = $props();

	type Block = { kind: 'p'; lines: string[] } | { kind: 'ul'; items: string[] };
	type Span = { text: string; bold?: boolean; italic?: boolean };

	const blocks = $derived.by(() => {
		const result: Block[] = [];
		for (const raw of text.replace(/\r/g, '').split('\n')) {
			const line = raw.trim();
			const last = result.at(-1);
			if (!line) {
				result.push({ kind: 'p', lines: [] });
			} else if (/^[-*] /.test(line)) {
				if (last?.kind === 'ul') last.items.push(line.slice(2));
				else result.push({ kind: 'ul', items: [line.slice(2)] });
			} else if (last?.kind === 'p') {
				last.lines.push(line);
			} else {
				result.push({ kind: 'p', lines: [line] });
			}
		}
		return result.filter((b) => (b.kind === 'p' ? b.lines.length > 0 : true));
	});

	function spans(s: string): Span[] {
		const out: Span[] = [];
		const re = /\*\*(.+?)\*\*|_(.+?)_/g;
		let last = 0;
		for (const m of s.matchAll(re)) {
			if (m.index! > last) out.push({ text: s.slice(last, m.index) });
			out.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2], italic: true });
			last = m.index! + m[0].length;
		}
		if (last < s.length) out.push({ text: s.slice(last) });
		return out;
	}
</script>

{#snippet inline(s: string)}
	{#each spans(s) as span, i (i)}
		{#if span.bold}<strong>{span.text}</strong>{:else if span.italic}<em>{span.text}</em>{:else}{span.text}{/if}
	{/each}
{/snippet}

<div class="rule-text">
	{#each blocks as block, i (i)}
		{#if block.kind === 'ul'}
			<ul>
				{#each block.items as item, j (j)}<li>{@render inline(item)}</li>{/each}
			</ul>
		{:else}
			<p>{@render inline(block.lines.join(' '))}</p>
		{/if}
	{/each}
</div>

<style>
	.rule-text {
		font-size: 0.92rem;
	}
	.rule-text p {
		margin: 0.3rem 0;
	}
	.rule-text ul {
		margin: 0.3rem 0;
		padding-left: 1.2rem;
	}
</style>
