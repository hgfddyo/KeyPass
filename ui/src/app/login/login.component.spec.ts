import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import {KeyringService} from "../keyring.service"
import { LoginComponent } from './login.component';
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
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let routerSpy;
  let fixture: ComponentFixture<LoginComponent>;
  let fakeKeyringService; 

  beforeEach(async () => {
    routerSpy = {navigate: jasmine.createSpy('navigate')};
    fakeKeyringService = {
    getChecked: jasmine.createSpy("getChecked"),
    setAccount: jasmine.createSpy("setAccount"),
    setSetup: jasmine.createSpy("setSetup"),
    getSetup: jasmine.createSpy("getSetup"),
    loadSetup: jasmine.createSpy("loadSetup")
  }
    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
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
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.dialog.closeAll()
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem("currentAccount")
    let template = fixture.nativeElement as HTMLElement;
    template.remove()
    component.dialog.closeAll()
  })

  it('should create component', () => {
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
    fakeKeyringService.setAccount.and.returnValue(of(true))
    component.ngOnInit()
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/keys"])
  });

  it('should not navigate to keys if CurrentAccount is not set', () => {
    component.ngOnInit()
    expect(routerSpy.navigate).not.toHaveBeenCalledWith(["/keys"])
  });

  it('should navigate to registration on GoToRegistration method', () => {
    component.goToRegistration()
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/Registration"])
  });

  it('should be passed to login and password variables from LoginControl and PasswordControl', () => {
    component.loginControl.setValue("1")
    component.passwordControl.setValue("2")
    component.selectLogin()
    component.selectPassword()
    expect(component.account.login).toBe("1")
    expect(component.account.password).toBe("2")
  });

  it('should not Login if loginControl and passwordControl are not set', () => {
    component.loginControl.setValue(undefined)
    component.passwordControl.setValue(undefined)
    component.Login()
    fixture.detectChanges();
    expect(fakeKeyringService.setAccount).not.toHaveBeenCalled()
  });

  it('should Login and redirect to keys component if credentials are correct', () => {
    component.loginControl.setValue("1")
    component.passwordControl.setValue("2")
    component.account.login = component.loginControl.value
    component.account.password = component.passwordControl.value
    fakeKeyringService.setAccount.and.returnValue(of(true))
    component.Login()
    expect(fakeKeyringService.setAccount).toHaveBeenCalledWith({login:"1", password:"2"})
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/keys"])  
  });

  it('should not Login and call dialog if credentials are incorrect', () => {
    component.loginControl.setValue("1")
    component.passwordControl.setValue("2")
    component.account.login = component.loginControl.value
    component.account.password = component.passwordControl.value
    fakeKeyringService.setAccount.and.returnValue(of(false))
    component.Login()
    expect(fakeKeyringService.setAccount).toHaveBeenCalledWith({login:"1", password:"2"})
    fixture.detectChanges();
    const dialogHeader = document.getElementsByTagName("h3")[0] as HTMLHeadElement
    expect(dialogHeader.innerText).toEqual("Error")
    expect(routerSpy.navigate).not.toHaveBeenCalledWith(["/keys"])  
  });

  it('should change template Login and Registration on click', () => {
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
  });
  
});
