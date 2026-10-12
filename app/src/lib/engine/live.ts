import type { RuleData, SecondaryKey } from '$lib/ruleData';
import type { Character, PlayState, Roll } from './character';
import type { SecondaryValue } from './steps/secondary';
import type { SkillView } from './steps/skills';

/** Werte, die sich im lebenden Bogen von Hand überschreiben lassen (Vorrang vor dem berechneten Wert). */
export type OverrideKey = SecondaryKey | 'maxTp' | 'maxStability' | 'maxMp' | `skill:${string}`;

/** Aktuelle Werte, die sich direkt setzen lassen. */
export type CurrentKey = 'tp' | 'stability' | 'mp' | 'luck';

export type LiveAction =
	| { type: 'finishCreation' }
	| { type: 'reopenCreation' }
	| { type: 'takeDamage'; amount: number }
	| { type: 'endCombat'; rolls: Roll[] }
	| { type: 'setCondition'; condition: string; active: boolean }
	| { type: 'overrideValue'; key: OverrideKey; value: number | undefined }
	| { type: 'setCurrent'; key: CurrentKey; value: number };

export interface LiveView {
	tp: number;
	maxTp: number;
	woundThreshold: number;
	/** Summe der Wundenmali auf die maximalen TP. */
	woundMalus: number;
	/** Wunden aus dem laufenden Kampf, deren Malus am Kampfende ausgewürfelt wird. */
	pendingWounds: number;
	stability: number;
	maxStability: number;
	/** Stabilität beim Abschließen der Erstellung (für den schleichenden Wahnsinn). */
	stabilityStart?: number;
	mp: number;
	maxMp: number;
	luck?: number;
	conditions: string[];
	overrides: Partial<Record<OverrideKey, number>>;
}

export function createPlayState(): PlayState {
	return { woundMalus: 0, pendingWounds: 0, conditions: [], overrides: {} };
}

/** Wendet von Hand gesetzte Werte auf Sekundärattribute und Fertigkeiten an. */
export function applyOverrides(play: PlayState, secondary: Record<SecondaryKey, SecondaryValue>, skills: SkillView[]): void {
	for (const [key, value] of Object.entries(play.overrides)) {
		if (value === undefined) continue;
		if (key in secondary) secondary[key as SecondaryKey].value = value;
		if (key.startsWith('skill:')) {
			const skill = skills.find((s) => s.key === key.slice(6));
			if (skill) {
				skill.value = value;
				skill.half = Math.floor(value / 2);
				skill.fifth = Math.floor(value / 5);
			}
		}
	}
}

export function computeLive(play: PlayState, secondary: Record<SecondaryKey, SecondaryValue>): LiveView {
	const o = play.overrides;
	const maxTp = o.maxTp ?? Math.max(0, (secondary.tp.value ?? 0) - play.woundMalus);
	const maxStability = o.maxStability ?? secondary.stability.value ?? 0;
	const maxMp = o.maxMp ?? secondary.magicPoints.value ?? 0;
	return {
		tp: Math.min(play.tp ?? maxTp, maxTp),
		maxTp,
		woundThreshold: secondary.woundThreshold.value ?? 0,
		woundMalus: play.woundMalus,
		pendingWounds: play.pendingWounds,
		stability: Math.min(play.stability ?? maxStability, maxStability),
		maxStability,
		stabilityStart: play.stabilityStart,
		mp: Math.min(play.mp ?? maxMp, maxMp),
		maxMp,
		luck: play.luck ?? secondary.luck.value,
		conditions: play.conditions,
		overrides: o
	};
}

function addCondition(play: PlayState, id: string): void {
	if (!play.conditions.includes(id)) play.conditions.push(id);
}

/**
 * Aktionen am Spieltisch. `live` ist der aktuelle Stand vor der Aktion,
 * `canFinish` gibt an, ob alle Schritte der Erstellung gültig sind.
 */
export function applyLiveAction(
	character: Character,
	action: LiveAction,
	live: LiveView,
	canFinish: boolean,
	_rd: RuleData
): void {
	const play = character.play;
	switch (action.type) {
		case 'finishCreation':
			if (!canFinish) return;
			character.status = 'finished';
			play.stabilityStart ??= live.maxStability;
			break;
		case 'reopenCreation':
			character.status = 'inCreation';
			break;
		case 'takeDamage': {
			const amount = Math.max(0, Math.floor(action.amount));
			if (!amount) return;
			const tp = Math.max(0, live.tp - amount);
			play.tp = tp;
			// Mindestens die Hälfte der maximalen TP auf einen Schlag gibt zwei Wunden, über der Wundschwelle eine.
			const wounds = amount >= live.maxTp / 2 ? 2 : amount > live.woundThreshold ? 1 : 0;
			play.pendingWounds += wounds;
			if (wounds) addCondition(play, 'wunde');
			if (amount > live.maxTp) addCondition(play, 'tot');
			else if (tp === 0) addCondition(play, play.conditions.includes('wunde') ? 'sterbend' : 'kampfunfaehig');
			break;
		}
		case 'endCombat': {
			const malus = action.rolls.reduce((sum, r) => sum + r.dice.reduce((s, d) => s + d, 0), 0);
			play.woundMalus += malus;
			play.pendingWounds = Math.max(0, play.pendingWounds - action.rolls.length);
			break;
		}
		case 'setCondition':
			if (action.active) addCondition(play, action.condition);
			else play.conditions = play.conditions.filter((c) => c !== action.condition);
			break;
		case 'overrideValue':
			if (action.value === undefined) delete play.overrides[action.key];
			else play.overrides[action.key] = action.value;
			break;
		case 'setCurrent':
			play[action.key] = action.value;
			break;
	}
}
