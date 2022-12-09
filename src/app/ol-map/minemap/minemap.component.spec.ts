import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinemapComponent } from './minemap.component';

describe('MinemapComponent', () => {
  let component: MinemapComponent;
  let fixture: ComponentFixture<MinemapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinemapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinemapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
