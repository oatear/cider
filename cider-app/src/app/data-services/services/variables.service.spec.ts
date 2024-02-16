import { TestBed } from '@angular/core/testing';

import { VariablesService } from './variables.service';

describe('VariablesService', () => {
  let service: VariablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VariablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
