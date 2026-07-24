import { vi } from 'vitest';

/**
 * A stand-in for `HTMLAudioElement`. jsdom does not implement audio playback,
 * so tests replace the global `Audio` constructor with this. Every constructed
 * instance is pushed onto `audioInstances` so assertions can inspect it.
 */
export class MockAudio {
  static instances: MockAudio[] = [];

  src: string;
  loop = false;
  volume = 1;
  currentTime = 0;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();

  constructor(src: string) {
    this.src = src;
    MockAudio.instances.push(this);
  }
}

/** Installs {@link MockAudio} as the global `Audio` and resets its instance log. */
export function stubAudio(): typeof MockAudio {
  MockAudio.instances = [];
  vi.stubGlobal('Audio', MockAudio);
  return MockAudio;
}

/**
 * Installs a controllable `window.matchMedia`. `matches` is the value returned
 * for `(prefers-color-scheme: light)`. The returned handle exposes
 * `emitChange` to simulate the OS theme flipping at runtime.
 */
export function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();

  const matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
    addListener: (cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
    removeListener: (cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
    dispatchEvent: () => true,
  }));

  vi.stubGlobal('matchMedia', matchMedia);

  return {
    emitChange(nowMatches: boolean) {
      listeners.forEach((cb) => cb({ matches: nowMatches } as MediaQueryListEvent));
    },
  };
}
