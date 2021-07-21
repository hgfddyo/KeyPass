import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core'
import { Location } from '@angular/common'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { Subject } from 'rxjs';
import { startWith } from 'rxjs/operators'
import { combineLatest } from 'rxjs/operators'
import { merge } from 'rxjs/operators'
import { map } from 'rxjs/operators'
import { mergeMap } from 'rxjs/operators'
import { Key } from '../key'
import { MatAutocompleteTrigger } from '@angular/material/autocomplete'
import { KeyringService } from '../keyring.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-addkey',
  templateUrl: './addkey.component.html',
  styleUrls: ['./addkey.component.css']
})
export class AddkeyComponent implements OnInit, AfterViewInit {

  loginControl: FormControl = new FormControl();
  contextControl: FormControl = new FormControl();
  password:string = ''
  context:string = ''
  login:string = ''

  constructor(private keyringService: KeyringService, private location: Location, private router:Router) { }

  ngOnInit() {

  }

  ngAfterViewInit() {

  }

  selectContext() {
    this.context = this.contextControl.value
  }

  selectLogin() {
    this.login = this.loginControl.value
  }

  save() {
    if(this.loginControl.value && this.contextControl.value && this.password) {
      this.keyringService.addKey({
        login: this.loginControl.value,
        context: this.contextControl.value,
        password: this.password
      })
      this.location.back()
    }
  }

  logout(){
    localStorage.removeItem('currentAccount');
    this.router.navigate(["/Login"])
  }

  back(){
    this.location.back()
  }

  generate() {
    this.password = this.keyringService.generate()
  }
}
