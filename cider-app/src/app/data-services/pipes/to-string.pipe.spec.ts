import { ToStringPipe } from './to-string.pipe';

describe('ToStringPipe', () => {
  it('create an instance', () => {
    const pipe = new ToStringPipe();
    expect(pipe).toBeTruthy();
  });
});
