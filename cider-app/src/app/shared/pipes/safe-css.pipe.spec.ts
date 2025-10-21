import { SafeCssPipe } from './safe-css.pipe';

describe('SafeCssPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeCssPipe();
    expect(pipe).toBeTruthy();
  });
});
