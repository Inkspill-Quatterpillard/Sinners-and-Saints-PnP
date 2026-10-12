import { describe, expect, it } from 'vitest';
import { applyAction, computeView, type Action, type Character } from './index';
import { ruleData } from '$lib/ruleData';
import { arrayAttributes, playWith } from './testing/fixtures';

const play = (...actions: Action[]): Character => playWith(ruleData, ...actions);
const view = (c: Character) => computeView(c, ruleData);
const stepStatus = (c: Character, id: string) => view(c).steps.find((s) => s.id === id)?.status;

// STR 16, KON 14, GES 12, WAH 12, KLU 10, INT 10, CHA 10, WIL 8
const ATTRS = arrayAttributes();
const ON: Action = { type: 'setOptionalRule', rule: 'besondereHerkunft', enabled: true };

describe('Besondere Herkunft', () => {
	it('ist eine optionale Regel; ohne sie gibt es den Schritt nicht', () => {
		expect(view(play(...ATTRS)).steps.some((s) => s.id === 'origin')).toBe(false);
		expect(stepStatus(play(...ATTRS, ON), 'origin')).toBe('open');
	});

	it('es gibt 16 Herkünfte, frei wählbar', () => {
		expect(ruleData.origins).toHaveLength(16);
		const c = play(
			...ATTRS,
			ON,
			{ type: 'chooseOriginOrStunt', choice: 'origin' },
			{ type: 'chooseOrigin', origin: 'blutmagier' }
		);
		expect(view(c).attributes.KON.effective).toBe(12);
		expect(view(c).originStep.abilities.map((a) => a.name)).toEqual(['Geschwächt', 'Blutritual']);
		expect(stepStatus(c, 'origin')).toBe('valid');
	});

	it('mit Herkunft-Entscheidung, aber ohne gewählte Herkunft bleibt der Schritt offen', () => {
		expect(stepStatus(play(...ATTRS, ON, { type: 'chooseOriginOrStunt', choice: 'origin' }), 'origin')).toBe('open');
	});

	it('statt einer Herkunft ein zweites Kunststück: der Schritt ist gültig, zwei Kunststücke sind erlaubt', () => {
		const c = play(...ATTRS, ON, { type: 'chooseOriginOrStunt', choice: 'stunt' });
		expect(stepStatus(c, 'origin')).toBe('valid');
		expect(view(c).stuntStep.allowed).toBe(2);
	});

	it('Unterwahl: Blut der Elemente', () => {
		const c = play(
			...ATTRS,
			ON,
			{ type: 'chooseOriginOrStunt', choice: 'origin' },
			{ type: 'chooseOrigin', origin: 'blutDerElemente' }
		);
		expect(stepStatus(c, 'origin')).toBe('open');
		const fire = applyAction(c, { type: 'chooseTraitOption', trait: 'blutDerElemente', option: 'feuer' }, ruleData);
		expect(view(fire).attributes.KLU.effective).toBe(8);
		expect(stepStatus(fire, 'origin')).toBe('valid');
	});

	it('Unterwahl: Artefakt; dazu ein Zähler für Seelen (Start 1, höchstens 3)', () => {
		const c = play(
			...ATTRS,
			ON,
			{ type: 'chooseOriginOrStunt', choice: 'origin' },
			{ type: 'chooseOrigin', origin: 'bundDesArtefakts' },
			{ type: 'chooseTraitOption', trait: 'bundDesArtefakts', option: 'waffe' }
		);
		expect(stepStatus(c, 'origin')).toBe('valid');
		expect(view(c).attributes.WIL.effective).toBe(6);
		expect(view(c).counters).toContainEqual(expect.objectContaining({ id: 'seelen', start: 1, max: 3 }));
	});

	it('Drachenblut verlangt die Wahl eines Drachen und gibt eine Fähigkeit je Ruhephase', () => {
		const c = play(
			...ATTRS,
			ON,
			{ type: 'chooseOriginOrStunt', choice: 'origin' },
			{ type: 'chooseOrigin', origin: 'drachenblut' },
			{ type: 'chooseTraitOption', trait: 'drachenblut', option: 'roterDrache' }
		);
		expect(view(c).originStep.trait?.options).toHaveLength(9);
		expect(view(c).resources).toContainEqual(expect.objectContaining({ id: 'drachenodem', per: 'rest' }));
	});

	it('Atronach: 50 % mehr maximale MP', () => {
		// MP: WIL 8 / 2 = 4 + max(CHA, INT, KLU) 10 / 5 = 2 → 6; × 1,5 = 9
		const c = play(...ATTRS, ON, { type: 'chooseOriginOrStunt', choice: 'origin' }, { type: 'chooseOrigin', origin: 'atronach' });
		expect(view(c).secondary.magicPoints.value).toBe(9);
	});

	it('Wechselbalg: −3 Status', () => {
		const c = play(
			...ATTRS,
			ON,
			{ type: 'chooseOriginOrStunt', choice: 'origin' },
			{ type: 'chooseOrigin', origin: 'wechselbalg' }
		);
		expect(view(c).socialStatus.value).toBe(2);
	});

	it('schaltet man die Regel ab, wirkt die gewählte Herkunft nicht mehr, bleibt aber gespeichert', () => {
		const c = play(
			...ATTRS,
			ON,
			{ type: 'chooseOriginOrStunt', choice: 'origin' },
			{ type: 'chooseOrigin', origin: 'blutmagier' }
		);
		const off = applyAction(c, { type: 'setOptionalRule', rule: 'besondereHerkunft', enabled: false }, ruleData);
		expect(view(off).attributes.KON.effective).toBe(14);
		expect(view(off).stuntStep.allowed).toBe(1);
		const on = applyAction(off, ON, ruleData);
		expect(view(on).attributes.KON.effective).toBe(12);
	});
});

describe('Kunststücke', () => {
	// Abrollen: Akrobatik 12, Klettern 8
	const stuntReady: Action[] = [
		...ATTRS,
		{ type: 'setInterestPoints', target: 'akrobatik', points: 6 },
		{ type: 'setInterestPoints', target: 'klettern', points: 2 }
	];

	it('jeder Charakter wählt ein Kunststück; ohne Wahl ist der Schritt offen', () => {
		const c = play(...stuntReady);
		expect(view(c).stuntStep.allowed).toBe(1);
		expect(stepStatus(c, 'stunts')).toBe('open');
	});

	it('ein Kunststück mit erfüllten Voraussetzungen ist gültig', () => {
		const c = play(...stuntReady, { type: 'toggleStunt', stunt: 'abrollen' });
		expect(stepStatus(c, 'stunts')).toBe('valid');
		expect(view(c).stuntStep.stunts.find((s) => s.id === 'abrollen')).toMatchObject({ available: true, chosen: true });
	});

	it('Kunststücke mit unerfüllten Voraussetzungen sind nicht verfügbar und machen die Wahl ungültig', () => {
		const c = play(...ATTRS, { type: 'toggleStunt', stunt: 'abrollen' });
		const stunt = view(c).stuntStep.stunts.find((s) => s.id === 'abrollen')!;
		expect(stunt.available).toBe(false);
		expect(stunt.unmet).toEqual(['Akrobatik 12', 'Klettern 8']);
		expect(stepStatus(c, 'stunts')).toBe('invalid');
	});

	it('fällt eine Voraussetzung später weg, wird das Kunststück ungültig', () => {
		const c = play(
			...stuntReady,
			{ type: 'toggleStunt', stunt: 'abrollen' },
			{ type: 'setInterestPoints', target: 'akrobatik', points: 5 }
		);
		expect(stepStatus(c, 'stunts')).toBe('invalid');
	});

	it('mehr Kunststücke als erlaubt lassen sich nicht wählen', () => {
		const c = play(
			...stuntReady,
			{ type: 'setInterestPoints', target: 'medizin', points: 10 },
			{ type: 'toggleStunt', stunt: 'abrollen' },
			{ type: 'toggleStunt', stunt: 'aderlass' }
		);
		expect(view(c).stuntStep.chosen).toEqual(['abrollen']);
	});

	it('„Steuern“ wird von Fahrzeug steuern oder Steuern (Boot) erfüllt', () => {
		const feuerfass = ruleData.stunts.find((s) => s.id === 'feuerfass')!;
		expect(feuerfass.prerequisites[0].skills).toEqual(['fahrzeugSteuern', 'steuernBoot']);
	});
});
