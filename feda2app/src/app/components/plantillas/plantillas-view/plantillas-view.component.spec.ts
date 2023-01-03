import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillasViewComponent } from './plantillas-view.component';

describe('PlantillasViewComponent', () => {
  let component: PlantillasViewComponent;
  let fixture: ComponentFixture<PlantillasViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantillasViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantillasViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
