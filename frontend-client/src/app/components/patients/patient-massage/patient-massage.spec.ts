import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMassage } from './patient-massage';

describe('PatientMassage', () => {
  let component: PatientMassage;
  let fixture: ComponentFixture<PatientMassage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientMassage],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientMassage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
