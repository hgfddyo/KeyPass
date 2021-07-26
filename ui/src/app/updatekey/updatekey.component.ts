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
import { Router } from '@angular/router';
import { KeyringService } from '../keyring.service'

@Component({
  selector: 'app-updatekey',
  templateUrl: './updatekey.component.html',
  styleUrls: ['./updatekey.component.css']
})
export class UpdatekeyComponent implements OnInit {

  loginControl: FormControl = new FormControl();
  contextControl: FormControl = new FormControl();
  password:string = ''
  context:string = ''
  login:string = ''

  constructor(private keyringService: KeyringService, private location: Location, private router: Router) { }

  ngOnInit() {
    let key = this.keyringService.getUpdatedKey()
    this.loginControl.setValue(key.login)
    this.contextControl.setValue(key.context)
    this.password = key.password
  }

  ngAfterViewInit() {

  }

  logout(){
    localStorage.removeItem('currentAccount');
    this.router.navigate(["/Login"])
  }

  selectContext() {
    this.context = this.contextControl.value
  }

  selectLogin() {
    this.login = this.loginControl.value
  }

  save() {
    if(this.loginControl.value && this.contextControl.value && this.password) {
      this.keyringService.updateKey({
        login: this.loginControl.value,
        context: this.contextControl.value,
        password: this.password
      }, this.keyringService.getUpdatedKey()).subscribe(result => {
        this.location.back()
      })
    }
  }

  back(){
    this.location.back()
  }

  generate() {
    this.password = this.keyringService.generate()
  }
}
