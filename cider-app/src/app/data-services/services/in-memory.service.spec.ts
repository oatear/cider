import { TestBed } from '@angular/core/testing';
import { Game } from '../types/game.type';

import { InMemoryService } from './in-memory.service';

describe('InMemoryService', () => {
  let service: InMemoryService<Game, number>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InMemoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
