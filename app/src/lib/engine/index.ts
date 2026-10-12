// Der Regelkern: reines TypeScript ohne Bezug zu Svelte, Browser oder Zufall.
export { createCharacter, FORMAT_VERSION } from './character';
export type { Character, CharacterStatus } from './character';
export { applyAction } from './actions';
export type { Action } from './actions';
export { computeView } from './view';
export type { CharacterView } from './view';
