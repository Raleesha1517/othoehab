import { TestBed } from '@angular/core/testing';

import { Exercise } from './exercise';

describe('Exercise', () => {
  let service: Exercise;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Exercise);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
