import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentSign } from './document-sign';

describe('DocumentSign', () => {
  let component: DocumentSign;
  let fixture: ComponentFixture<DocumentSign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentSign],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentSign);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
