import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrHome } from './hr-home';

describe('HrHome', () => {
  let component: HrHome;
  let fixture: ComponentFixture<HrHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrHome],
    }).compileComponents();

    fixture = TestBed.createComponent(HrHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
