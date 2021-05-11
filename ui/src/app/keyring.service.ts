import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Key } from './key'
import * as crypto from 'crypto-js'
import { Account } from './account'
import { Channel } from './channel'
import { Setup } from './setup'
import { Result } from './result'
import { Observable } from 'rxjs/Observable';
import {CONFIG} from './app.config'

@Injectable()
export class KeyringService {
  private httpOptions:any

  private account:Account

  private loginUrl:string

  private putUrl:string

  private getUrl:string

  private setupUrl:string

  private registerUrl:string

  private channelUUID:string

  private sign:string

  private setup:Setup

  private keyRing:Key[]

  constructor( private http: HttpClient ) {
    this.loginUrl = CONFIG.apiURL + "/login"
    this.putUrl = CONFIG.apiURL + "/put"
    this.getUrl = CONFIG.apiURL + "/get"
    this.setupUrl =  CONFIG.apiURL + "/setup"
    this.registerUrl = CONFIG.apiURL + "/register_account"
    this.channelUUID = "85839ee8-31d0-4cd5-a7d6-7f55637ccc88"
    this.sign = "0a01c2d7-1d72-4712-93dc-6c44adc13c54"
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    this.keyRing = []
  }

  setAccount(account:Account) {
    this.account = account
    let self = this
    this.http.post<Result>(this.loginUrl, {
      uuid: self.channelUUID,
      login: account.login,
      password: account.password
    }, this.httpOptions).subscribe(result => {
      let token = <string>result['data']
      if(token.length > 0){
        this.httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          })
        }
        this.loadSetup()
      } else {
          alert("Bad Account credentials!")
          window.location.replace("index.html")
          localStorage.removeItem('currentAccount');
      }
    })
  }

  registerAccount(account:Account){
    this.account = account
    let self = this
    this.http.post<Result>(this.registerUrl, {
      uuid: self.channelUUID,
      login: account.login,
      password: account.password
      }, this.httpOptions).subscribe(result => {
      let token = <string>result['data']
      if(token.length > 0){
        this.httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          })
        }
        setTimeout(() => {
          /*
          Adding an empty line to user data to enter a login is implemented in the frontend part of the application, 
          because to add data to the user in the backend part, 
          it is necessary that the settings have already been specified when adding data, 
          at the current moment the settings are transferred to the application after a period of time after entering the credentials of user.
          */ 
          this.rentPlace("")
        }, 1000)
      } else {
          alert("this user already exists!")
          window.location.replace("index.html")
          localStorage.removeItem('currentAccount')
      }
    })
  }

  getSetup():Setup {
    return this.setup
  }

  loadSetup() {
    let self = this
    this.http.get<Result>(this.setupUrl, this.httpOptions).subscribe(result => {
        self.setup = result['data']
    })
  }

  setSetup(setup:Setup) {
      this.setup = setup
      this.http.post<Result>(this.setupUrl, setup, this.httpOptions).subscribe()
  }

  getKeyRing():Observable<Key[]> {
    return new Observable(observer => {
      if(!this.account) {
        observer.next([])
        observer.complete()
      } else {
        this.http.post<Result>(this.getUrl, {uuid: this.channelUUID}, this.httpOptions).subscribe(result => {
          let binary = result['data']
          if (!binary) {
            observer.next([])
          } else {
            observer.next(JSON.parse(binary))
          }
          observer.complete()
        })
      }
    })
  }

  addKey(key:Key) {
    this.getKeyRing().subscribe(keyRing => {
      if(!keyRing) {
        keyRing = []
      }
      let index = keyRing.findIndex(aKey =>
        key.login === aKey.login &&
        key.context === aKey.context)
      if (index >= 0) {
        keyRing.splice(index, 1, key)
      } else {
        keyRing.push(key)
      }
      this.putKeyRing(keyRing)
    })
  }

  deleteKey(key:Key) {
    this.getKeyRing().subscribe(keyRing => {
      if(!keyRing) {
        keyRing = []
      }
      let index = keyRing.findIndex(aKey =>
        key.login === aKey.login &&
        key.context === aKey.context)
      if (index >= 0) {
        keyRing.splice(index, 1)
        this.putKeyRing(keyRing)
      }
    })
  }

  deleteKeysOfContext(key:Key) {
    this.getKeyRing().subscribe(keyRing => {
      if(!keyRing) {
        keyRing = []
      }
      let isDone: boolean = false;
      for(var i = keyRing.length - 1; i >= 0; i--) {
        if(keyRing[i].context === key.context) {
        keyRing.splice(i, 1);
        isDone = true
        }
      }
      if(isDone){
        this.putKeyRing(keyRing)
      }
    })
  }

  putKeyRing(keyRing:Key[]) {
    let json = JSON.stringify(keyRing)
    let self = this
    this.http.post<Result>(this.putUrl, {
      channel:  {uuid: this.channelUUID},
      data:     {content: json},
      sign:     self.sign
    }, this.httpOptions).subscribe()
  }

  rentPlace(str:String) {
    let self = this
    this.http.post<Result>(this.putUrl, {
      channel:  {uuid: this.channelUUID},
      data:     {content: str},
      sign:     self.sign
    }, this.httpOptions).subscribe()
  }
}
