import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OlBdMapComponent } from './ol-bd-map.component';

describe('OlBdMapComponent', () => {
  let component: OlBdMapComponent;
  let fixture: ComponentFixture<OlBdMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OlBdMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OlBdMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
