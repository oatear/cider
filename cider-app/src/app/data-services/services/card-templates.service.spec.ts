import { TestBed } from '@angular/core/testing';

import { CardTemplatesService } from './card-templates.service';

describe('CardTemplatesService', () => {
  let service: CardTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
