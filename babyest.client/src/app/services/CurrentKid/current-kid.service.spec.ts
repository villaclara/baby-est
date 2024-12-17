import { TestBed } from '@angular/core/testing';

import { CurrentKidService } from './current-kid.service';

describe('CurrentKidService', () => {
  let service: CurrentKidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentKidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
