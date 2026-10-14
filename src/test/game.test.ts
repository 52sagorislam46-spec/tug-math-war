import { describe, expect, it } from 'vitest';
import { makeProblem, matchReducer, newMatch, PULL_TARGET, type Settings } from '@/lib/game';
const settings: Settings = { duration: 30, operation: 'multiplication', difficulty: 'easy', mode: 'duo' };
describe('math rules', () => {
  it('creates exact integer division and nonnegative subtraction at every level', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) for (let i = 0; i < 100; i++) {
      const division = makeProblem('division', difficulty);
      expect(division.a / division.b).toBe(division.answer);
      const subtraction = makeProblem('subtraction', difficulty);
      expect(subtraction.answer).toBeGreaterThanOrEqual(0);
      expect(subtraction.a - subtraction.b).toBe(subtraction.answer);
    }
  });
  it('does not accept input before a match and pauses time', () => {
    const ready = newMatch(settings);
    expect(matchReducer(ready, { type: 'input', team: 0, key: '1', settings })).toEqual(ready);
    const paused = { ...ready, status: 'paused' as const };
    expect(matchReducer(paused, { type: 'tick' })).toEqual(paused);
  });
  it('scores answers, tracks misses, and ends at an eight-point advantage', () => {
    let state = { ...newMatch(settings), status: 'playing' as const } as ReturnType<typeof newMatch>;
    state = matchReducer(state, { type: 'input', team: 0, key: '0', settings });
    state = matchReducer(state, { type: 'input', team: 0, key: 'enter', settings });
    expect(state.players[0].score).toBe(0);
    expect(state.players[0].attempts).toBe(1);
    for (let i = 0; i < 8; i++) {
      for (const key of String(state.players[0].problem.answer)) state = matchReducer(state, { type: 'input', team: 0, key, settings });
      state = matchReducer(state, { type: 'input', team: 0, key: 'enter', settings });
    }
    expect(state.status).toBe('finished'); expect(state.winner).toBe(0); expect(state.reason).toBe('pull');
    expect(state.players[0].attempts).toBe(9);
  });
  it('expires as a tie and prevents further scoring', () => {
    const state = matchReducer({ ...newMatch(settings), remaining: 1, status: 'playing' }, { type: 'tick' });
    expect(state.status).toBe('finished'); expect(state.winner).toBeNull(); expect(state.remaining).toBe(0);
    expect(matchReducer(state, { type: 'input', team: 1, key: '1', settings })).toEqual(state);
  });

  it('lets a solo player keep scoring past the pull target until time runs out', () => {
    const solo: Settings = { ...settings, mode: 'solo' };
    let state = { ...newMatch(solo), status: 'playing' as const } as ReturnType<typeof newMatch>;
    for (let i = 0; i < PULL_TARGET + 2; i++) {
      for (const key of String(state.players[0].problem.answer)) state = matchReducer(state, { type: 'input', team: 0, key, settings: solo });
      state = matchReducer(state, { type: 'input', team: 0, key: 'enter', settings: solo });
    }
    expect(state.players[0].score).toBe(PULL_TARGET + 2);
    expect(state.players[1].score).toBe(0);
    expect(state.status).toBe('playing');
    state = matchReducer({ ...state, remaining: 1 }, { type: 'tick' });
    expect(state.status).toBe('finished');
    expect(state.winner).toBe(0);
    expect(state.reason).toBe('time');
  });
});
