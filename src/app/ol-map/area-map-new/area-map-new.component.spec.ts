import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaMapNewComponent } from './area-map-new.component';

describe('AreaMapNewComponent', () => {
  let component: AreaMapNewComponent;
  let fixture: ComponentFixture<AreaMapNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaMapNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaMapNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
