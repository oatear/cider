import { TestBed } from '@angular/core/testing';

import { DecksService } from './decks.service';

describe('DecksService', () => {
  let service: DecksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
