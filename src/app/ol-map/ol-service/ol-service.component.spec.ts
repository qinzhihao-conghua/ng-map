import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OlServiceComponent } from './ol-service.component';

describe('OlServiceComponent', () => {
  let component: OlServiceComponent;
  let fixture: ComponentFixture<OlServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OlServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OlServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
