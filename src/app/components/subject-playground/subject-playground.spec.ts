import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectPlayground } from './subject-playground';

describe('SubjectPlayground', () => {
  let component: SubjectPlayground;
  let fixture: ComponentFixture<SubjectPlayground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectPlayground]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectPlayground);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
