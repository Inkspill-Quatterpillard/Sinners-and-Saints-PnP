import type { Basis } from '../character';
import type { Derivation } from '../derivation';

export type BackgroundField =
	| 'gender'
	| 'appearance'
	| 'description'
	| 'belief'
	| 'worldview'
	| 'places'
	| 'possession'
	| 'traits'
	| 'birthplace'
	| 'residence';

export interface ImportantPerson {
	name?: string;
	relation?: string;
	reason?: string;
}

export interface Background {
	fields: Partial<Record<BackgroundField, string>>;
	people: ImportantPerson[];
	languages: { id: string; writing: boolean }[];
}

export type BackgroundAction =
	| { type: 'setBackground'; field: BackgroundField; value: string }
	| { type: 'addPerson' }
	| { type: 'updatePerson'; index: number; person: ImportantPerson }
	| { type: 'removePerson'; index: number }
	| { type: 'toggleLanguage'; language: string }
	| { type: 'setLanguageWriting'; language: string; writing: boolean };

export type BackgroundView = Partial<Record<BackgroundField, string>> & {
	people: ImportantPerson[];
	languages: { id: string; writing: boolean }[];
};

export function applyBackgroundAction(basis: Basis, action: BackgroundAction): void {
	const b = basis.background;
	switch (action.type) {
		case 'setBackground':
			if (action.value) b.fields[action.field] = action.value;
			else delete b.fields[action.field];
			break;
		case 'addPerson':
			b.people.push({});
			break;
		case 'updatePerson':
			if (b.people[action.index]) b.people[action.index] = { ...b.people[action.index], ...action.person };
			break;
		case 'removePerson':
			b.people.splice(action.index, 1);
			break;
		case 'toggleLanguage':
			if (b.languages.some((l) => l.id === action.language)) b.languages = b.languages.filter((l) => l.id !== action.language);
			else b.languages.push({ id: action.language, writing: false });
			break;
		case 'setLanguageWriting': {
			const lang = b.languages.find((l) => l.id === action.language);
			if (lang) lang.writing = action.writing;
			break;
		}
	}
}

/** Vorgeschichte und Name: rein erzählerisch; gültig, sobald der Charakter einen Namen hat. */
export function evaluateBackground(d: Derivation): BackgroundView {
	const b = d.character.basis.background;
	d.steps.push({ id: 'background', status: d.character.basis.name.trim() ? 'valid' : 'open' });
	return { ...b.fields, people: b.people, languages: b.languages };
}
