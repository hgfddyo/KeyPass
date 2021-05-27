import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeystableComponent } from './keystable.component';

describe('KeystableComponent', () => {
  let component: KeystableComponent;
  let fixture: ComponentFixture<KeystableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeystableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeystableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
