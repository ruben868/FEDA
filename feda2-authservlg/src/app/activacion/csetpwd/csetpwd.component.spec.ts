import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsetpwdComponent } from './csetpwd.component';

describe('CsetpwdComponent', () => {
  let component: CsetpwdComponent;
  let fixture: ComponentFixture<CsetpwdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsetpwdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsetpwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
