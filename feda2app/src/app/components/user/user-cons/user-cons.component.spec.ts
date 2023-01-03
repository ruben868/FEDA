import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConsComponent } from './user-cons.component';

describe('UserConsComponent', () => {
  let component: UserConsComponent;
  let fixture: ComponentFixture<UserConsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserConsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserConsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
