import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTemplate } from './doctor-template';

describe('DoctorTemplate', () => {
  let component: DoctorTemplate;
  let fixture: ComponentFixture<DoctorTemplate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTemplate],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorTemplate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
