import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Key } from './key'
import { Account } from './account'
import { Channel } from './channel'
import { Setup } from './setup'
import { Result } from './result'
import { Observable } from 'rxjs';
import {CONFIG} from './app.config'

@Injectable()
export class KeyringService {
  private httpOptions:any

  private updatedKey:Key

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

  private passwordVocabulary = [
    '!', '#', '$', '%', '&', '(', ')', '*', '+', '-',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    ':', ';', '<' ,'=', '>', '?', '@',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

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
  //TODO: обернуть все в observable??
  setAccount(account:Account):Observable<boolean> {
    return new Observable(observer => {
      this.account = account
      let self = this
      this.http.post<Result>(this.loginUrl, {
        uuid: self.channelUUID,
        login: account.login,
        password: account.password
      }, this.httpOptions).subscribe(result => {
        let token = <string>result['data']
        if(token.length > 0 && token){
          this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            }) 
          }
          localStorage.setItem('currentAccount', JSON.stringify(this.account))
          this.loadSetup().subscribe(setup => {
            this.setup = setup
            observer.next(true)
            observer.complete()
          })
        }
        else{
          this.httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
          }
          observer.next(false)
          observer.complete()
        } 
      })
    })
  }
  //BUG: при регистрации регистрирует существующего юзера при неверном пароле и меняет пароль, стирает все аккаунты
  registerAccount(account:Account):Observable<boolean>{
    return new Observable(observer => {
      this.account = account
      let self = this
      this.http.post<Result>(this.registerUrl, {
        uuid: self.channelUUID,
        login: account.login,
        password: account.password
        }, this.httpOptions).subscribe(result => {
        let token = <string>result['data']
        if(token.length > 0 && token){
          this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            })
          }
          localStorage.setItem('currentAccount', JSON.stringify(this.account))
          this.rentPlace("").subscribe(rent => {
            observer.next(true)
            observer.complete()
          })
        }
        else{
          this.httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
          }
          observer.next(false)
          observer.complete()
        } 
      })
    })
  }

  getSetup():Setup {
    return this.setup
  }

  setUpdatedKey(key:Key){
    this.updatedKey = key
  }

  getUpdatedKey(){
    return this.updatedKey  
  }

  loadSetup():Observable<Setup> {
    return new Observable(observer =>{
      this.http.get<Result>(this.setupUrl, this.httpOptions).subscribe(result => {
        observer.next(result['data'])
        observer.complete()
      })
    })
  }

  setSetup(setup:Setup):Observable<boolean> {
    return new Observable(observer =>{
      this.setup = setup
      this.http.post<Result>(this.setupUrl, setup, this.httpOptions).subscribe(result => {
        observer.next(true)
        observer.complete()
      })
    })
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

  addKey(key:Key):Observable<Boolean> {
    return new Observable(observer => {
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
        this.putKeyRing(keyRing).subscribe(result => {
          observer.next(true)
          observer.complete()
        })
      })
    })
  }
  
  updateKey(key:Key, oldKey:Key):Observable<Boolean> {
    return new Observable(observer => {
      this.getKeyRing().subscribe(keyRing => {
        if(!keyRing) {
          keyRing = []
        }
        let index = keyRing.findIndex(aKey =>
          oldKey.login === aKey.login &&
          oldKey.context === aKey.context)
        if (index >= 0) {
          keyRing.splice(index, 1, key)
        }
        this.putKeyRing(keyRing).subscribe(result => {
          observer.next(true)
          observer.complete()
        })
      })
    })
  }

  deleteKey(key:Key):Observable<Boolean> {
    return new Observable(observer => {
      this.getKeyRing().subscribe(keyRing => {
        if(!keyRing) {
          keyRing = []
        }
        let index = keyRing.findIndex(aKey =>
          key.login === aKey.login &&
          key.context === aKey.context)
        if (index >= 0) {
          keyRing.splice(index, 1)
          this.putKeyRing(keyRing).subscribe(result => {
          observer.next(true)
          observer.complete()
          })
        }
      })
    })
  }

  deleteKeysOfContext(key:Key):Observable<Boolean> {
    return new Observable(observer => {
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
          this.putKeyRing(keyRing).subscribe(result => {
          observer.next(true)
          observer.complete()
          })
        }
      })
    })
  }

  putKeyRing(keyRing:Key[]):Observable<Boolean> {
    return new Observable(observer => {
      let json = JSON.stringify(keyRing)
      let self = this
      this.http.post<Result>(this.putUrl, {
        channel:  {uuid: this.channelUUID},
        data:     {content: json},
        sign:     self.sign
      }, this.httpOptions).subscribe(result => {
        observer.next(true)
        observer.complete()
      })
    })
  }

  rentPlace(str:String):Observable<Boolean> {
    return new Observable(observer => {
      let self = this
      this.http.post<Result>(this.putUrl, {
        channel:  {uuid: this.channelUUID},
        data:     {content: str},
        sign:     self.sign
      }, this.httpOptions).subscribe(result => {
        observer.next(true)
        observer.complete()
      })
    })
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
    return password
  }
}
