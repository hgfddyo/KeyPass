import { ComponentFixture, TestBed } from '@angular/core/testing';
import {KeyringService} from "../keyring.service"
import { AddkeyComponent } from './addkey.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import {v4 as uuidv4} from 'uuid';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { destroyPlatform } from '@angular/core';
import { Location } from '@angular/common'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('AddkeyComponent', () => {
  let component: AddkeyComponent;
  let fixture: ComponentFixture<AddkeyComponent>;
  let routerSpy;
  let locationSpy;
  let fakeKeyringService;

  beforeEach(async () => {
    routerSpy = {navigate: jasmine.createSpy('navigate')};
    locationSpy = {back: jasmine.createSpy('back')};
    fakeKeyringService = {
      getChecked: jasmine.createSpy("getChecked"),
      setAccount: jasmine.createSpy("setAccount"),
      setSetup: jasmine.createSpy("setSetup"),
      getSetup: jasmine.createSpy("getSetup"),
      loadSetup: jasmine.createSpy("loadSetup"),
      generate: jasmine.createSpy("generate"),
      addKey: jasmine.createSpy("addKey")
    }
    await TestBed.configureTestingModule({
      declarations: [ AddkeyComponent ],
      imports: [ MatDialogModule, BrowserAnimationsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, FormsModule,
       MatToolbarModule, MatIconModule ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy },
        { provide: KeyringService, useValue: fakeKeyringService },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    let template = fixture.nativeElement as HTMLElement;
    template.remove()
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to previous component on goToBack method', () => {
    component.back()
    expect(locationSpy.back).toHaveBeenCalled()
  });

  it('should set login and context values from LoginControl and ContextControl', () => {
    component.loginControl.setValue("1")
    component.contextControl.setValue("2")
    component.selectContext()
    component.selectLogin()
    expect(component.login).toEqual('1')
    expect(component.context).toEqual('2')
  });

  it('should set password on Generate method', () => {
    fakeKeyringService.generate.and.returnValue("qwer1234")
    component.generate()
    expect(component.password).toEqual('qwer1234')
  });

  it('should logout, delete currentAccount from localstorage and go to Login component', () => {
    localStorage.setItem('currentAccount', JSON.stringify({login:1, password:1}))
    component.logout()
    fixture.detectChanges();
    let currentAccount = localStorage.getItem('currentAccount')
    expect(currentAccount).toEqual(null)
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/Login"])
  });

  it('should not call addKey method and not go to previous location if controls dont set', () => {
    component.save()
    expect(fakeKeyringService.addKey).not.toHaveBeenCalled()
    expect(locationSpy.back).not.toHaveBeenCalled()
  });

  it('should call addKey method and go to previous location', () => {
    component.loginControl.setValue("1")
    component.contextControl.setValue("2")
    fakeKeyringService.addKey.and.returnValue(of(true))
    component.password = "3"
    component.save()
    expect(fakeKeyringService.addKey).toHaveBeenCalledWith({login:"1", context:"2", password:"3"})
    expect(locationSpy.back).toHaveBeenCalled()
  });

});
