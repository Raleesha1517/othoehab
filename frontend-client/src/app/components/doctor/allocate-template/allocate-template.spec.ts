import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocateTemplate } from './allocate-template';

describe('AllocateTemplate', () => {
  let component: AllocateTemplate;
  let fixture: ComponentFixture<AllocateTemplate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocateTemplate],
    }).compileComponents();

    fixture = TestBed.createComponent(AllocateTemplate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
