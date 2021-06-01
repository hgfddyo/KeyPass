import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatekeyComponent } from './updatekey.component';

describe('UpdatekeyComponent', () => {
  let component: UpdatekeyComponent;
  let fixture: ComponentFixture<UpdatekeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatekeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatekeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
