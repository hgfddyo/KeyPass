import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddkeyComponent } from './addkey.component';

describe('AddkeyComponent', () => {
  let component: AddkeyComponent;
  let fixture: ComponentFixture<AddkeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddkeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
