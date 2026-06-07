import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMassage } from './doctor-massage';

describe('DoctorMassage', () => {
  let component: DoctorMassage;
  let fixture: ComponentFixture<DoctorMassage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorMassage],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorMassage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
