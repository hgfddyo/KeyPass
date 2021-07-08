import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { KeyringService } from "../keyring.service"
import { copyToClipboard, KeysComponent } from './keys.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import { v4 as uuidv4 } from 'uuid';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs'
import { Subject } from 'rxjs';
import { startWith } from 'rxjs/operators'
import { combineLatest } from 'rxjs/operators'
import { merge } from 'rxjs/operators'
import { map } from 'rxjs/operators'
import { mergeMap } from 'rxjs/operators'
import { Key } from '../key'
import { pipe } from 'rxjs'
import { ClipboardModule, ClipboardService } from "ngx-clipboard"
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('KeysComponent', () => {
  let component: KeysComponent;
  let fixture: ComponentFixture<KeysComponent>;
  let fakeKeyringService; 
  let routerSpy;
  let keys: Key[];

  beforeEach(async () => {
    routerSpy = {navigate: jasmine.createSpy('navigate')};
    fakeKeyringService = {
    getChecked: jasmine.createSpy("getChecked"),
    setAccount: jasmine.createSpy("setAccount"),
    setSetup: jasmine.createSpy("setSetup"),
    getSetup: jasmine.createSpy("getSetup"),
    loadSetup: jasmine.createSpy("loadSetup"),
    getKeyRing: jasmine.createSpy("getKeyRing")
  }
    await TestBed.configureTestingModule({
      declarations: [ KeysComponent ],
      imports: [ MatDialogModule, BrowserAnimationsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatAutocompleteModule,
        MatToolbarModule, MatIconModule, FormsModule, ClipboardModule, ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: KeyringService, useValue: fakeKeyringService },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    keys =[{context:"1", login:"1", password:"1"}]
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    fixture = TestBed.createComponent(KeysComponent);
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

  it('should navigate to keystable component on goToAllKeys method', () => {
    component.goToAllKeys()
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/All_keys"])
  });

  it('should navigate to addkey component on goToAddkey method', () => {
    component.goToAddKey()
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/Addkey"])
  });

  it('should logout, delete currentAccount from localstorage and go to Login component', () => {
    localStorage.setItem('currentAccount', JSON.stringify({login:1, password:1}))
    component.logout()
    fixture.detectChanges();
    let currentAccount = localStorage.getItem('currentAccount')
    expect(currentAccount).toEqual(null)
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/Login"])
  });

  it('should autocomplete login and password for one credential in one context', () => {
    keys =[{context:"1", login:"2", password:"3"}]
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    component.contextControl.setValue("1")
    component.selectContext()
    fixture.detectChanges();
    let login = component.loginControl.value.toString()
    let password = component.password
    expect(password).toEqual("3")
    expect(login).toEqual("2")
  });

  it('should not autocomplete login and password for two or more credentials in one context', () => {
    keys = [{context:"1", login:"2", password:"3"}, {context:"1", login:"5", password:"6"}]
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    component.contextControl.setValue("4")
    component.selectContext()
    fixture.detectChanges()
    let login = component.loginControl.value.toString()
    let password = component.password
    expect(password).toEqual("")
    expect(login).toEqual("")
  });

  it('should autocomplete password for login and context', () => {
    keys =[{context:"1", login:"2", password:"3"}]
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    component.contextControl.setValue("1")
    component.loginControl.setValue("2")
    component.selectLogin()
    fixture.detectChanges()
    let password = component.password
    expect(password).toEqual("3")
  });

  it('should not autocomplete password for empty login and context fields', () => {
    keys =[{context:"1", login:"2", password:"3"}]
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    component.contextControl.setValue("")
    component.loginControl.setValue("")
    component.selectLogin()
    fixture.detectChanges()
    let password = component.password
    expect(password).toEqual("")
  });

  it('should return login option values for keys on OptionValues method', () => {
    keys = [{context:"1", login:"2", password:"3"}, {context:"1", login:"5", password:"6"}]
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    component.optionValues(keys, 'login')
    let loginOptions = component.optionValues(keys, 'login')
    expect(loginOptions).toEqual(["2", "5"])
  });

  it('should return context option values for keys on OptionValues method', () => {
    keys = [{context:"1", login:"2", password:"3"}, {context:"3", login:"5", password:"6"}]
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    component.optionValues(keys, 'login')
    let loginOptions = component.optionValues(keys, 'context')
    expect(loginOptions).toEqual(["1", "3"])
  });

  it('should render autocomplete for context', () => {
    keys = [{context:"1", login:"2", password:"3"}, {context:"3", login:"5", password:"6"}]
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    fixture.detectChanges()
    const inputs = fixture.debugElement.nativeElement.getElementsByTagName("input");
    inputs[0].value = "";
    inputs[0].dispatchEvent(new Event('input'));
    inputs[0].dispatchEvent(new Event('focus'));
    inputs[0].dispatchEvent(new Event('focusin'));
    inputs[0].dispatchEvent(new Event('keydown'));
    fixture.detectChanges()
    const mat1 = document.getElementsByClassName("mat-option-text")[0] as HTMLHeadElement
    const mat2 = document.getElementsByClassName("mat-option-text")[1] as HTMLHeadElement
    expect(mat1.innerText).toEqual("1")
    expect(mat2.innerText).toEqual("3")
    inputs[0].value = "1";
    inputs[0].dispatchEvent(new Event('input'));
    inputs[0].dispatchEvent(new Event('focus'));
    inputs[0].dispatchEvent(new Event('focusin'));
    inputs[0].dispatchEvent(new Event('keydown'));
    fixture.detectChanges()
    const mat3 = document.getElementsByClassName("mat-option-text")[0] as HTMLHeadElement
    document.getElementsByClassName("mat-option-text")[0] as HTMLHeadElement
    expect(mat3.innerText).toEqual("1")
  });

});
