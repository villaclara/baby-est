import { TestBed } from '@angular/core/testing';

import { KidServiceService } from './kid-service.service';

describe('KidServiceService', () => {
  let service: KidServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KidServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
