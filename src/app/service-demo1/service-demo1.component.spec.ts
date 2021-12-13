import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDemo1Component } from './service-demo1.component';

describe('ServiceDemo1Component', () => {
  let component: ServiceDemo1Component;
  let fixture: ComponentFixture<ServiceDemo1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceDemo1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceDemo1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
