import { TestBed } from '@angular/core/testing';

import { ProjectGuard } from './project.guard';

describe('ProjectGuard', () => {
  let guard: ProjectGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ProjectGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
