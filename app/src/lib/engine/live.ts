import type { ResourcePeriod, RuleData, SecondaryKey } from '$lib/ruleData';
import type { Character, PlayState, Roll } from './character';
import type { CounterDef, ResourceDef } from './derivation';
import type { OwnedItemView } from './steps/equipment';
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
	/** Wundenpunkte heilen (Erste Hilfe, Medizin, Ruhephase); optional zugleich TP regenerieren. */
	| { type: 'healWounds'; amount: number; tp?: number }
	| { type: 'setCondition'; condition: string; active: boolean }
	| { type: 'overrideValue'; key: OverrideKey; value: number | undefined }
	| { type: 'setCurrent'; key: CurrentKey; value: number }
	| { type: 'setStabilityStart'; value: number }
	| { type: 'loseStability'; amount: number; inCombat: boolean }
	| { type: 'spendMp'; amount: number }
	/** Pause bzw. Ruhephase: ab 1 Stunde volle TP, ab 4 Stunden halbe MP, ab 8 Stunden volle MP; optional neues Glück. */
	| { type: 'rest'; hours: number; luck?: Roll }
	/** Meditation: je Stunde ein Würfel (W6, bei Wächter der Ströme W10) plus Bonus. */
	| { type: 'meditate'; rolls: Roll[]; bonus: number }
	| { type: 'rerollLuck'; roll: Roll }
	| { type: 'fumble' }
	| { type: 'changeMoney'; delta: number }
	| { type: 'useResource'; id: string }
	| { type: 'resetResource'; id: string }
	/** Ein neuer Tag: setzt Fähigkeiten „einmal am Tag“ zurück. */
	| { type: 'newDay' }
	| { type: 'setCounter'; id: string; value: number };

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
	/** Stabilität unter der Hälfte des Startwerts: schleichender Wahnsinn droht. */
	stabilityWarning: boolean;
	/** Fester Bonus auf jeden Glückswurf (z. B. +2 für Kinder). */
	luckBonus: number;
	conditions: string[];
	overrides: Partial<Record<OverrideKey, number>>;
	/** Geld in der kleinsten Einheit des Settings. */
	money: number;
	/** Rüstungsschutz der angelegten Rüstungen. */
	armor: number;
	resources: (ResourceDef & { used: number })[];
	counters: (CounterDef & { value: number })[];
}

/** Was der lebende Bogen aus der übrigen Ansicht braucht. */
export interface LiveContext {
	remainingMoney: number;
	/** Fester Bonus auf Glück (z. B. +2 für Kinder), der auch beim Neuwürfeln im Spiel gilt. */
	luckBonus: number;
	items: OwnedItemView[];
	resources: ResourceDef[];
	counters: CounterDef[];
}

function armorOf(items: OwnedItemView[], column: string): number {
	return items.filter((i) => i.equipped && i.stats[column]).reduce((sum, i) => sum + (parseInt(i.stats[column], 10) || 0), 0);
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

export function computeLive(
	play: PlayState,
	secondary: Record<SecondaryKey, SecondaryValue>,
	ctx: LiveContext,
	rd: RuleData
): LiveView {
	const o = play.overrides;
	const maxTp = o.maxTp ?? Math.max(0, (secondary.tp.value ?? 0) - play.woundMalus);
	const maxStability = o.maxStability ?? secondary.stability.value ?? 0;
	const maxMp = o.maxMp ?? secondary.magicPoints.value ?? 0;
	const stability = Math.min(play.stability ?? maxStability, maxStability);
	const start = play.stabilityStart;
	return {
		tp: Math.min(play.tp ?? maxTp, maxTp),
		maxTp,
		woundThreshold: secondary.woundThreshold.value ?? 0,
		woundMalus: play.woundMalus,
		pendingWounds: play.pendingWounds,
		stability,
		maxStability,
		stabilityStart: play.stabilityStart,
		mp: Math.min(play.mp ?? maxMp, maxMp),
		maxMp,
		luck: play.luck ?? secondary.luck.value,
		stabilityWarning: start !== undefined && stability < start * rd.play.stability.madnessBelowStartFraction,
		luckBonus: ctx.luckBonus,
		conditions: play.conditions,
		overrides: o,
		money: play.money ?? ctx.remainingMoney,
		armor: armorOf(ctx.items, rd.play.armorColumn),
		resources: ctx.resources.map((r) => ({ ...r, used: Math.min(r.uses, play.resourceUses?.[r.id] ?? 0) })),
		counters: ctx.counters.map((c) => ({ ...c, value: Math.max(0, Math.min(c.max, play.counters?.[c.id] ?? c.start)) }))
	};
}

function resetResources(play: PlayState, live: LiveView, periods: ResourcePeriod[]): void {
	const uses = { ...play.resourceUses };
	for (const r of live.resources) if (periods.includes(r.per)) uses[r.id] = 0;
	play.resourceUses = uses;
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
	rd: RuleData
): void {
	const play = character.play;
	const rules = rd.play;
	switch (action.type) {
		case 'finishCreation':
			if (!canFinish) return;
			character.status = 'finished';
			play.stabilityStart ??= live.maxStability;
			// Das Restgeld der Erstellung wird zum Geld im Spiel.
			play.money ??= live.money;
			break;
		case 'reopenCreation':
			character.status = 'inCreation';
			break;
		case 'takeDamage': {
			const amount = Math.max(0, Math.floor(action.amount));
			if (!amount) return;
			const tp = Math.max(0, live.tp - amount);
			play.tp = tp;
			const hadWound = play.conditions.includes('wunde') || play.pendingWounds > 0;
			// Mindestens die Hälfte der maximalen TP auf einen Schlag gibt zwei Wunden, über der Wundschwelle eine.
			let wounds = amount >= live.maxTp * rules.wounds.twoWoundsFromFractionOfTp ? 2 : amount > live.woundThreshold ? 1 : 0;
			if (amount > live.maxTp) addCondition(play, 'tot');
			else if (tp === 0 && hadWound) addCondition(play, 'sterbend');
			else if (tp === 0) {
				// Ohne vorherige Wunde kampfunfähig; nach dem Kampf folgt ebenfalls eine schwere Wunde.
				addCondition(play, 'kampfunfaehig');
				wounds = Math.max(wounds, 1);
			}
			play.pendingWounds += wounds;
			if (wounds) addCondition(play, 'wunde');
			break;
		}
		case 'endCombat': {
			const malus = action.rolls.reduce((sum, r) => sum + r.dice.reduce((s, d) => s + d, 0), 0);
			play.woundMalus += malus;
			play.pendingWounds = Math.max(0, play.pendingWounds - action.rolls.length);
			break;
		}
		case 'healWounds': {
			const amount = Math.max(0, Math.floor(action.amount));
			play.woundMalus = Math.max(0, play.woundMalus - amount);
			if (action.tp) play.tp = Math.min(live.maxTp + amount, live.tp + Math.floor(action.tp));
			if (play.woundMalus === 0 && play.pendingWounds === 0) play.conditions = play.conditions.filter((c) => c !== 'wunde');
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
		case 'setCurrent': {
			// TP zwischen 0 und Maximum, Stabilität und MP höchstens beim Maximum (MP dürfen negativ werden).
			const v = Math.round(action.value);
			if (action.key === 'tp') play.tp = Math.max(0, Math.min(live.maxTp, v));
			else if (action.key === 'stability') play.stability = Math.min(live.maxStability, v);
			else if (action.key === 'mp') play.mp = Math.min(live.maxMp, v);
			else play.luck = v;
			break;
		}
		case 'setStabilityStart':
			play.stabilityStart = action.value;
			break;
		case 'loseStability': {
			const amount = Math.max(0, Math.floor(action.amount));
			const stability = live.stability - amount;
			play.stability = stability;
			if (action.inCombat && amount > rules.stability.panicAbove) addCondition(play, 'panik');
			if (amount > rules.stability.breakdownAbove) addCondition(play, 'mentalerZusammenbruch');
			const start = play.stabilityStart;
			if (start !== undefined && stability < start * rules.stability.madnessBelowStartFraction)
				addCondition(play, 'schleichenderWahnsinn');
			break;
		}
		case 'spendMp': {
			const amount = Math.max(0, Math.floor(action.amount));
			const before = Math.max(0, -live.mp);
			const mp = live.mp - amount;
			const after = Math.max(0, -mp);
			// Jeder überzogene Punkt kostet 1 TP, ab dem fünften überzogenen Punkt 2 TP.
			let damage = 0;
			for (let point = before + 1; point <= after; point++) damage += point >= rules.magicOverdraw.doubleFromPoint ? 2 : 1;
			play.mp = mp;
			if (damage) play.tp = Math.max(0, live.tp - damage);
			break;
		}
		case 'rest': {
			const r = rules.rest;
			if (action.hours >= r.restPhaseHours) resetResources(play, live, ['rest']);
			if (action.hours >= r.fullTpAfterHours) delete play.tp;
			if (action.hours >= r.fullMpAfterHours) delete play.mp;
			else if (action.hours >= r.halfMpAfterHours) play.mp = Math.min(live.maxMp, live.mp + Math.floor(live.maxMp / 2));
			if (action.luck) play.luck = Math.max(...action.luck.dice) + live.luckBonus;
			break;
		}
		case 'meditate': {
			const gained = action.rolls.reduce((sum, r) => sum + r.dice[0] + action.bonus, 0);
			play.mp = Math.min(live.maxMp, live.mp + gained);
			break;
		}
		case 'rerollLuck':
			play.luck = Math.max(...action.roll.dice) + live.luckBonus;
			break;
		case 'fumble':
			play.luck = (live.luck ?? 0) + 1;
			break;
		case 'changeMoney':
			play.money = live.money + Math.round(action.delta);
			break;
		case 'useResource': {
			const res = live.resources.find((r) => r.id === action.id);
			if (!res || res.used >= res.uses) return;
			play.resourceUses = { ...play.resourceUses, [action.id]: res.used + 1 };
			break;
		}
		case 'resetResource':
			play.resourceUses = { ...play.resourceUses, [action.id]: 0 };
			break;
		case 'newDay':
			resetResources(play, live, ['day', 'rest']);
			break;
		case 'setCounter': {
			const counter = live.counters.find((c) => c.id === action.id);
			if (!counter) return;
			play.counters = { ...play.counters, [action.id]: Math.max(0, Math.min(counter.max, Math.round(action.value))) };
			break;
		}
	}
}
