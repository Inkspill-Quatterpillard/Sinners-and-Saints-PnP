/**
 * Lässt ein Textfeld mit seinem Inhalt nach unten wachsen. Der Parameter ist der aktuelle Wert,
 * damit die Höhe auch nach Änderungen von außen (Rückgängig, Würfeln) stimmt.
 */
export function autosize(node: HTMLTextAreaElement, _value?: string) {
	const resize = () => {
		node.style.height = 'auto';
		node.style.height = `${node.scrollHeight + node.offsetHeight - node.clientHeight}px`;
	};
	node.style.resize = 'none';
	node.style.overflow = 'hidden';
	node.addEventListener('input', resize);
	queueMicrotask(resize);
	return {
		update: () => queueMicrotask(resize),
		destroy: () => node.removeEventListener('input', resize)
	};
}
