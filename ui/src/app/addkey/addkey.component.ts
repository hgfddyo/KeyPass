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

  constructor(private keyringService: KeyringService, private location: Location) { }

  private passwordVocabulary = [
    '!', '#', '$', '%', '&', '(', ')', '*', '+', '-',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    ':', ';', '<' ,'=', '>', '?', '@',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

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
    }
  }

  back(){
    this.location.back()
  }

  generate() {
    let res = new Uint32Array(21)
    window.crypto.getRandomValues(res)
    let password = ''
    for (var i = 0; i < res.length; i++) {
      let code = res[i]
      let index = code % this.passwordVocabulary.length
      password = password + this.passwordVocabulary[index]
    }
    this.password = password
  }
}
