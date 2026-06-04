import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPatient } from './view-patient';

describe('ViewPatient', () => {
  let component: ViewPatient;
  let fixture: ComponentFixture<ViewPatient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPatient],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewPatient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
