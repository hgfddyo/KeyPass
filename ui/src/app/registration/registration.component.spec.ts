import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import {KeyringService} from "../keyring.service"
import { RegistrationComponent } from './registration.component';
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

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let routerSpy;
  let fixture: ComponentFixture<RegistrationComponent>;
  let fakeKeyringService;

  beforeEach(async () => {
    routerSpy = {navigate: jasmine.createSpy('navigate')};
    fakeKeyringService = {
    getChecked: jasmine.createSpy("getChecked"),
    setAccount: jasmine.createSpy("setAccount"),
    setSetup: jasmine.createSpy("setSetup"),
    registerAccount: jasmine.createSpy("registerAccount"),
    getSetup: jasmine.createSpy("getSetup"),
    loadSetup: jasmine.createSpy("loadSetup")
  }
    await TestBed.configureTestingModule({
      declarations: [ RegistrationComponent ],
      imports: [ MatDialogModule, BrowserAnimationsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: KeyringService, useValue: fakeKeyringService },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]

    })
    .compileComponents();

  });

  beforeEach(() => {
    localStorage.removeItem("currentAccount")
    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem("currentAccount")
    let template = fixture.nativeElement as HTMLElement;
    template.remove()
    component.dialog.closeAll()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change value of Change', () => {
    expect(component.change).toBe(true)
    component.changeTemplate()
    expect(component.change).toBe(false)
    component.changeTemplate()
    expect(component.change).toBe(true)
  });

  it('should navigate to keys if CurrentAccount is set', () => {
    localStorage.setItem('currentAccount', JSON.stringify({login:1, password:1}))
    component.ngOnInit()
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/keys"])
  });

  it('should not navigate to keys if CurrentAccount is not set', () => {
    component.ngOnInit()
    expect(routerSpy.navigate).not.toHaveBeenCalledWith(["/keys"])
  });

  it('should navigate to login on GoToLogin method', () => {
    component.goToLogin()
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/Login"])
  });

  it('should be passed to login and password variables from LoginControl and PasswordControl', () => {
    component.loginControl.setValue("1")
    component.passwordControl.setValue("2")
    component.selectLogin()
    component.selectPassword()
    expect(component.account.login).toBe("1")
    expect(component.account.password).toBe("2")
  });

  it('should not Register and call Dialog if loginControl and passwordControl are not set', fakeAsync(() => {
    component.registration()
    fixture.detectChanges();
    tick(2000)
    fixture.detectChanges();
    const dialogHeader = document.getElementsByTagName("h3")[0] as HTMLHeadElement
    expect(dialogHeader.innerText).toEqual("Error")
    expect(fakeKeyringService.setAccount).not.toHaveBeenCalled()
  }));

  it('should Register and redirect to keys component if credentials are correct', fakeAsync(() => {
    component.loginControl.setValue("11")
    component.passwordControl.setValue("12")
    component.account.login = component.loginControl.value
    component.account.password = component.passwordControl.value
    fakeKeyringService.getChecked.and.returnValue(true)
    component.registration()
    expect(fakeKeyringService.registerAccount).toHaveBeenCalledWith({login:"11", password:"12"})
    fixture.detectChanges();
    tick(2000)
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/keys"])
  }));

  it('should create correct uuid', () => {
    let uuid = uuidv4()
    expect(uuid.length).toEqual(36)
  });

  it('should set Setup if Setup is not set', fakeAsync(() => {
    component.loginControl.setValue("1")
    component.passwordControl.setValue("2")
    component.account.login = component.loginControl.value
    component.account.password = component.passwordControl.value
    fakeKeyringService.getChecked.and.returnValue(true)
    component.registration()
    expect(fakeKeyringService.registerAccount).toHaveBeenCalledWith({login:"1", password:"2"})
    fixture.detectChanges();
    tick(2000)
    expect(fakeKeyringService.setSetup).toHaveBeenCalled()
  }));

   it('should not set Setup if Setup exists', fakeAsync(() => {
    component.loginControl.setValue("1")
    component.passwordControl.setValue("2")
    component.account.login = component.loginControl.value
    component.account.password = component.passwordControl.value
    fakeKeyringService.getChecked.and.returnValue(true)
    component.registration()
    fakeKeyringService.getSetup.and.returnValue({partition:"min", device:uuidv4()})
    expect(fakeKeyringService.registerAccount).toHaveBeenCalledWith({login:"1", password:"2"})
    fixture.detectChanges();
    tick(2000)
    expect(fakeKeyringService.getSetup).toHaveBeenCalled()
    expect(fakeKeyringService.setSetup).not.toHaveBeenCalled()
  }));

  it('should change template Login and Registration on click', fakeAsync(() => {
    let title = document.getElementsByClassName("enter")[0] as HTMLHeadElement
    expect(title.innerText).toEqual("Enter your login")
    let nextButton = document.getElementsByClassName("buttonnext")[0] as HTMLHeadElement
    nextButton.click()
    fixture.detectChanges();
    title = document.getElementsByClassName("enter")[0] as HTMLHeadElement
    expect(title.innerText).toEqual("Enter your password")
    let backButton = document.getElementsByClassName("buttonback")[0] as HTMLHeadElement
    backButton.click()
    fixture.detectChanges();
    title = document.getElementsByClassName("enter")[0] as HTMLHeadElement
    expect(title.innerText).toEqual("Enter your login")
  }));
});
