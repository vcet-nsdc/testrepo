/**
 * Session-based in-memory state tracking for the Cosmic Node Ignition intro animation.
 * 
 * - Resets to false on EVERY browser page refresh / reload.
 * - Remains true during client-side Next.js route navigation (e.g. Navigating to /events and back to /).
 */

let hasPlayedIntro = false;

export function getHasPlayedIntro(): boolean {
  return hasPlayedIntro;
}

export function setHasPlayedIntro(value: boolean): void {
  hasPlayedIntro = value;
}
