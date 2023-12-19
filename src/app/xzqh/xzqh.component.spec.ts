import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XzqhComponent } from './xzqh.component';

describe('XzqhComponent', () => {
  let component: XzqhComponent;
  let fixture: ComponentFixture<XzqhComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XzqhComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XzqhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
