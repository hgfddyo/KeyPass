import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core'
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

export const copyToClipboard = (url: string) => {
  document.addEventListener('copy', (e: ClipboardEvent) => {
    e.clipboardData.setData('text/plain', url);
    e.preventDefault();
    document.removeEventListener('copy',null);
  });
  document.execCommand('copy');
};

@Component({
  selector: 'app-keys',
  templateUrl: './keys.component.html',
  styleUrls: ['./keys.component.css']
})
export class KeysComponent implements OnInit, AfterViewInit {
  private subject = new Subject<string>();

  loginControl: FormControl = new FormControl();
  contextControl: FormControl = new FormControl();
  password:string = ''
  context:string = ''
  login:string = ''
  textToCopy:string = ''

  @ViewChild('contextAutoComplete', { read: MatAutocompleteTrigger })
    contextAutoComplete: MatAutocompleteTrigger

  @ViewChild('loginAutoComplete', { read: MatAutocompleteTrigger })
    loginAutoComplete: MatAutocompleteTrigger

  constructor(private keyringService: KeyringService, private router: Router) { }

  loginOptions: Observable<string[]>
  contextOptions: Observable<string[]>

  ngOnInit() {
    this.contextOptions = this.contextControl.valueChanges
      .pipe(
        startWith(''),
        mergeMap(val => this.keyringService.getKeyRing().pipe(map(keyRing =>
          this.optionValues(!val[0] ?
            keyRing :
            keyRing.filter(key =>
              key.context ? key.context.indexOf(val) === 0 : true)
      ,'context')
    ))))
    this.loginOptions = this.loginControl.valueChanges
      .pipe(
        startWith(''),
        combineLatest(this.subject.asObservable()))
        .pipe(
          mergeMap(val => this.keyringService.getKeyRing().pipe(map(keyRing =>
            this.optionValues(keyRing
              .filter(key => (key.login.indexOf(val[0]) === 0)
                && (key.context === val[1])),'login')
        ))))
  }

  ngAfterViewInit() {
  }

  optionValues(keys:Key[], property:string):string[] {
    let result:string[] = []
    for(let key of keys) {
      if(result.indexOf(key[property]) < 0) {
        result.push(key[property])
      }
    }
    return result
  }

  selectContext() {
    this.subject.next(this.contextControl.value)
    this.password = ''
    this.loginControl.setValue('')
    this.context = this.contextControl.value
    this.loginControl.setValue('')
    if(this.contextControl.value) {
      this.keyringService.getKeyRing().subscribe(keyRing => {
        let filtered = keyRing.filter(key =>
          key.context === this.contextControl.value)
        this.loginControl.setValue(filtered.length === 1 ? filtered[0].login : '');
        this.password = filtered.length === 1 ? filtered[0].password : ''
      })
    }
  }

  selectLogin() {
    if(this.loginControl.value && this.contextControl.value) {
      this.keyringService.getKeyRing().subscribe(keyRing => {
        let filtered = keyRing.filter(key =>
          key.login === this.loginControl.value &&
          key.context === this.contextControl.value)
        this.password = filtered.length === 1 ? filtered[0].password : ''
      })
    }
    else{
      this.password = ''
    }
  }

  goToAddKey(){
    this.router.navigate(["/Addkey"])
  }

  goToAllKeys(){
    this.router.navigate(["/All_keys"])
  }

  logout() {
    localStorage.removeItem('currentAccount');
    this.router.navigate(['/Login'])
  }
}

