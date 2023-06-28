import { TestBed } from '@angular/core/testing';

import { RenderCacheService } from './render-cache.service';

describe('RenderCacheService', () => {
  let service: RenderCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RenderCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
