import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { KeyringService } from "../keyring.service"
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
import { KeystableComponent } from './keystable.component';
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'

describe('KeystableComponent', () => {
  let fakeKeyringService; 
  let routerSpy;
  let keys: Key[];
  let component: KeystableComponent;
  let fixture: ComponentFixture<KeystableComponent>;
  let locationSpy;

  beforeEach(async () => {
    routerSpy = {navigate: jasmine.createSpy('navigate')};
    locationSpy = {back: jasmine.createSpy('back')};
    fakeKeyringService = {
      getChecked: jasmine.createSpy("getChecked"),
      setAccount: jasmine.createSpy("setAccount"),
      setSetup: jasmine.createSpy("setSetup"),
      getSetup: jasmine.createSpy("getSetup"),
      loadSetup: jasmine.createSpy("loadSetup"),
      getKeyRing: jasmine.createSpy("getKeyRing"),
      setUpdatedKey: jasmine.createSpy("setUpdatedKey"),
      deleteKey: jasmine.createSpy("deleteKey")
    }
    await TestBed.configureTestingModule({
      declarations: [ KeystableComponent ],
      imports: [ MatDialogModule, BrowserAnimationsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatAutocompleteModule,
        MatToolbarModule, MatIconModule, FormsModule, ClipboardModule, MatTableModule, MatPaginatorModule ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy},
        { provide: KeyringService, useValue: fakeKeyringService },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    keys =[{context:"1", login:"1", password:"12"}, {context:"2", login:"2", password:"123"}, {context:"2", login:"3", password:"1234"}]
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    fixture = TestBed.createComponent(KeystableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    let template = fixture.nativeElement as HTMLElement;
    template.remove()
    localStorage.removeItem('currentAccount');
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should logout, delete currentAccount from localstorage and go to Login component', () => {
    localStorage.setItem('currentAccount', JSON.stringify({login:1, password:1}))
    component.logout()
    fixture.detectChanges();
    let currentAccount = localStorage.getItem('currentAccount')
    expect(currentAccount).toEqual(null)
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/Login"])
  });

  it('should go to Updatekey component with with account data in the selected row', () => {
    keys = [{context:"1", login:"1", password:"1"}]
    component.goToUpdate(keys[0])
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/Updatekey"])
    expect(fakeKeyringService.setUpdatedKey).toHaveBeenCalledWith(keys[0])
  });

  it('should go to previous page on goBack() method', () => {
    component.goBack()
    expect(locationSpy.back).toHaveBeenCalled()
  });

  it('should go to Addkey component on goToAdd() method', () => {
    component.goToAddkey()
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/Addkey"])
  });

  it('should call deleteKey() method on deleteLogin() method', () => {
    keys =[{context:"1", login:"1", password:"1"}]
    fakeKeyringService.deleteKey.and.returnValue(of(true))
    component.deleteLogin(keys[0])
    expect(fakeKeyringService.getKeyRing).toHaveBeenCalled()
    expect(fakeKeyringService.deleteKey).toHaveBeenCalledWith(keys[0])
  });

  it('should change type of input on show() method', () => {
    keys =[{context:"1", login:"1", password:"12"}]
    component.show(keys[0])
    fixture.detectChanges()
    const input = document.getElementById(keys[0].context.concat(keys[0].login)) as HTMLInputElement
    expect(input.type).toEqual("text")
    component.show(keys[0])
    fixture.detectChanges()
    expect(input.type).toEqual("password")
  });

  it('should filter values in the table', () => {
    const input = document.getElementsByTagName("input")[0] as HTMLInputElement
    const table = document.getElementsByTagName("table")[0] as HTMLTableElement
    expect(table.rows.length).toEqual(4)
    input.value = "1"
    input.dispatchEvent(new Event("keyup"))
    fixture.detectChanges()
    expect(table.rows.length).toEqual(2)
    input.value = ""
    input.dispatchEvent(new Event("keyup"))
    fixture.detectChanges()
    expect(table.rows.length).toEqual(4)
    input.value = "2"
    input.dispatchEvent(new Event("keyup"))
    fixture.detectChanges()
    expect(table.rows.length).toEqual(3)
  });

   it('should display a message if data is missing', () => {
    keys = []
    fakeKeyringService.getKeyRing.and.returnValue(of(keys))
    fixture = TestBed.createComponent(KeystableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const table = document.getElementsByTagName("table")[0] as HTMLTableElement
    expect(table.rows.length).toEqual(2)
    expect(table.rows[1].cells[0].innerText).toEqual("No data")
  });
});
