import { TestBed } from '@angular/core/testing';

import { ThemeCheckerService } from './theme-checker.service';

describe('ThemeCheckerService', () => {
  let service: ThemeCheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeCheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
