import { TestBed } from '@angular/core/testing';

import { DeckGuard } from './deck.guard';

describe('DeckGuard', () => {
  let guard: DeckGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DeckGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
