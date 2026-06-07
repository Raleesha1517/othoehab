import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorRequest } from './doctor-request';

describe('DoctorRequest', () => {
  let component: DoctorRequest;
  let fixture: ComponentFixture<DoctorRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
