import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientRequest } from './patient-request';

describe('PatientRequest', () => {
  let component: PatientRequest;
  let fixture: ComponentFixture<PatientRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
