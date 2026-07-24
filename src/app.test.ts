import { describe, it, expect } from 'vitest';
import { startSession } from './app.ts';

describe('startSession (stubbed future engine)', () => {
  it('throws because it is not implemented yet', () => {
    expect(() => startSession({ durationSeconds: 1500, endTimestamp: 0, isBreak: false })).toThrow(
      'TODO: implement.'
    );
  });
});
