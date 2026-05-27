import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Logging } from './logging';

describe('Logging', () => {
  let component: Logging;
  let fixture: ComponentFixture<Logging>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logging],
    }).compileComponents();

    fixture = TestBed.createComponent(Logging);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
