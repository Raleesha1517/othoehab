import { TestBed } from '@angular/core/testing';

import { RequestTracker } from './request-tracker';

describe('RequestTracker', () => {
  let service: RequestTracker;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestTracker);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
