import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocateExercieses } from './allocate-exercieses';

describe('AllocateExercieses', () => {
  let component: AllocateExercieses;
  let fixture: ComponentFixture<AllocateExercieses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocateExercieses],
    }).compileComponents();

    fixture = TestBed.createComponent(AllocateExercieses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
