import { TestBed } from '@angular/core/testing';

import { PrintTemplatesService } from './print-templates.service';

describe('PrintTemplatesService', () => {
  let service: PrintTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
