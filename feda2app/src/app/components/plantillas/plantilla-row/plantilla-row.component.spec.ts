import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillaRowComponent } from './plantilla-row.component';

describe('PlantillaRowComponent', () => {
  let component: PlantillaRowComponent;
  let fixture: ComponentFixture<PlantillaRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantillaRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantillaRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
