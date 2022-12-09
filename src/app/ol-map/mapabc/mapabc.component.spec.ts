import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapabcComponent } from './mapabc.component';

describe('MapabcComponent', () => {
  let component: MapabcComponent;
  let fixture: ComponentFixture<MapabcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapabcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapabcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
