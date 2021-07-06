import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeysComponent } from './keys.component';

xdescribe('KeysComponent', () => {
  let component: KeysComponent;
  let fixture: ComponentFixture<KeysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
