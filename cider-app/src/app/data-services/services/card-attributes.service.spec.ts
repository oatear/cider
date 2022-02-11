import { TestBed } from '@angular/core/testing';

import { CardAttributesService } from './card-attributes.service';

describe('CardAttributesService', () => {
  let service: CardAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
