import { ShortTimerCounterPipe } from './short-timer-counter.pipe';

describe('ShortTimerCounterPipe', () => {
  it('create an instance', () => {
    const pipe = new ShortTimerCounterPipe();
    expect(pipe).toBeTruthy();
  });
});
