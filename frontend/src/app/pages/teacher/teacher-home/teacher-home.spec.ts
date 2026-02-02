import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherHome } from './teacher-home';

describe('TeacherHome', () => {
  let component: TeacherHome;
  let fixture: ComponentFixture<TeacherHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
