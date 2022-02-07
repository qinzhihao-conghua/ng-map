import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OlPlotMapComponent } from './ol-plot-map.component';

describe('OlPlotMapComponent', () => {
  let component: OlPlotMapComponent;
  let fixture: ComponentFixture<OlPlotMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OlPlotMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OlPlotMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
