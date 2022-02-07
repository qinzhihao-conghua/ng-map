import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurfMapComponent } from './turf-map.component';

describe('TurfMapComponent', () => {
  let component: TurfMapComponent;
  let fixture: ComponentFixture<TurfMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurfMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurfMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
