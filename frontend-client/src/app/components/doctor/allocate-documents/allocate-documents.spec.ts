import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocateDocuments } from './allocate-documents';

describe('AllocateDocuments', () => {
  let component: AllocateDocuments;
  let fixture: ComponentFixture<AllocateDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocateDocuments],
    }).compileComponents();

    fixture = TestBed.createComponent(AllocateDocuments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
