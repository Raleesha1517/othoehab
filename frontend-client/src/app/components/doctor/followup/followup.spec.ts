import { ComponentFixture, TestBed } from '@angular/core/testing';

import {  FollowupComponent } from './followup';

describe('FollowupComponent', () => {
  let component: FollowupComponent;
  let fixture: ComponentFixture<FollowupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
