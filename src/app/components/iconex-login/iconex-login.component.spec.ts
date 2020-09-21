import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconexLoginComponent } from './iconex-login.component';

describe('IconexLoginComponent', () => {
  let component: IconexLoginComponent;
  let fixture: ComponentFixture<IconexLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconexLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconexLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
