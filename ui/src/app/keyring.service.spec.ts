import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { KeyringService } from './keyring.service';
import {CONFIG} from './app.config'
import * as G from 'glob';
import { HttpHeaders } from '@angular/common/http';

describe('KeyringService', () => {
  let service: KeyringService;
  let httpController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ KeyringService ],
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(KeyringService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    localStorage.removeItem("currentAccount")
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate password which length is 21 symbols', () => {
    let genPass = service.generate()
    expect(genPass.length).toBe(21)
  });

  it('should get correct setup', () => {
    let setup = service.getSetup()
    expect(setup).toBeFalsy()
    service.setSetup({partition:"1", device:"1"})
    setup = service.getSetup()
    expect(setup).toEqual({partition:"1", device:"1"})
    httpController.expectOne(CONFIG.apiURL.concat("/setup"))
  });

  it('should set and get updated key', () => {
    service.setUpdatedKey({context: "1", login: "1", password: "1"})
    let key = service.getUpdatedKey()
    expect(key).toEqual({context: "1", login: "1", password: "1"})
  });

  it('should return checked value', () => {
    let checked = service.getChecked()
    expect(checked).toBe(false)
  });

  it('should correct load setup', () => {
    service.loadSetup()
    let request = httpController.expectOne(CONFIG.apiURL.concat("/setup"))
    expect(request.request.method).toBe("GET")
    request.flush({message:"OK", data:{partition:"1", device:"1"}})
    let setup = service.getSetup()
    expect(setup).toEqual({partition:"1", device:"1"})
  });

  it('should correct set setup', () => {
    let setup = {partition:"1", device:"1"}
    service.setSetup(setup)
    let request = httpController.expectOne(CONFIG.apiURL.concat("/setup"))
    expect(request.request.method).toBe("POST")
    expect(request.request.body).toBe(setup)
    let loadedSetup = service.getSetup()
    expect(loadedSetup).toEqual(setup)
  });

  it('should not make a request to get keyring if an account is not set ', () => {
    service.getKeyRing().subscribe(keyRing => {
      expect(keyRing.length).toBe(0)
    })
  });

  it('should make a request to get keyring and return it if an account is set ', () => {
    service.setAccount({login: "1", password: "1"})
    httpController.expectOne(CONFIG.apiURL.concat("/login"))
    service.getKeyRing().subscribe(keyRing =>{
      expect(keyRing).toEqual([{context:'1', login: '1', password: '1'}, {context:'2', login: '2', password: '2'}])
    })
    const request = httpController.expectOne(CONFIG.apiURL.concat("/get"))
    let json = JSON.stringify([{context:'1', login: '1', password: '1'}, {context:'2', login: '2', password: '2'}])
    request.flush({message:"OK", data: json})
    expect(request.request.method).toBe("POST")
  });

  it('should correct add key ', () => {
    service.addKey({context:'1', login: '1', password: '1'}) 
    const addKeyRequest = httpController.expectOne(CONFIG.apiURL.concat("/put"))
    expect(addKeyRequest.request.method).toBe("POST")
    let json = JSON.stringify([{context:'1', login: '1', password: '1'}])
    expect(addKeyRequest.request.body.data.content).toBe(json)
  });

  it('should replace existing key if inserted key matches with it', () => {
    service.setAccount({login: "1", password: "1"})
    httpController.expectOne(CONFIG.apiURL.concat("/login"))
    service.addKey({context:'1', login: '1', password: '23'})
    const keyringRequest = httpController.expectOne(CONFIG.apiURL.concat("/get"))
    let json = JSON.stringify([{context:'1', login: '1', password: '1'}, {context:'2', login: '2', password: '2'}])
    keyringRequest.flush({message:"OK", data: json})
    const addKeyRequest = httpController.expectOne(CONFIG.apiURL.concat("/put"))
    expect(addKeyRequest.request.method).toBe("POST")
    json = JSON.stringify([{context:'1', login: '1', password: '23'}, {context:'2', login: '2', password: '2'}])
    expect(addKeyRequest.request.body.data.content).toBe(json)
  });

  it('should correct update key ', () => {
    service.setAccount({login: "1", password: "1"})
    httpController.expectOne(CONFIG.apiURL.concat("/login"))
    service.updateKey({context:'2', login: '2', password: '2'}, {context:'1', login: '1', password: '1'})
    const keyringRequest = httpController.expectOne(CONFIG.apiURL.concat("/get"))
    let json = JSON.stringify([{context:'1', login: '1', password: '1'}])
    keyringRequest.flush({message:"OK", data: json})
    const updateKeyRequest = httpController.expectOne(CONFIG.apiURL.concat("/put"))
    expect(updateKeyRequest.request.method).toBe("POST")
    json = JSON.stringify([{context:'2', login: '2', password: '2'}])
    expect(updateKeyRequest.request.body.data.content).toBe(json)
  });

  it('should correct delete key ', () => {
    service.setAccount({login: "1", password: "1"})
    httpController.expectOne(CONFIG.apiURL.concat("/login"))
    service.deleteKey({context:'2', login: '2', password: '2'})
    const keyringRequest = httpController.expectOne(CONFIG.apiURL.concat("/get"))
    let json = JSON.stringify([{context:'1', login: '1', password: '1'}, {context:'2', login: '2', password: '2'}])
    keyringRequest.flush({message:"OK", data: json})
    const deleteKeyRequest = httpController.expectOne(CONFIG.apiURL.concat("/put"))
    expect(deleteKeyRequest.request.method).toBe("POST")
    json = JSON.stringify([{context:'1', login: '1', password: '1'}])
    expect(deleteKeyRequest.request.body.data.content).toBe(json)
  });

  it('should correct delete keys of context ', () => {
    service.setAccount({login: "1", password: "1"})
    httpController.expectOne(CONFIG.apiURL.concat("/login"))
    service.deleteKeysOfContext({context:'2', login: '2', password: '2'})
    const keyringRequest = httpController.expectOne(CONFIG.apiURL.concat("/get"))
    let json = JSON.stringify([{context:'1', login: '1', password: '1'}, {context:'2', login: '2', password: '2'}, {context:'2', login: '3', password: '3'}])
    keyringRequest.flush({message:"OK", data: json})
    const deleteKeysRequest = httpController.expectOne(CONFIG.apiURL.concat("/put"))
    expect(deleteKeysRequest.request.method).toBe("POST")
    json = JSON.stringify([{context:'1', login: '1', password: '1'}])
    expect(deleteKeysRequest.request.body.data.content).toBe(json)
  });

  it('should correct put keyring ', () => {
    service.putKeyRing([{context:'1', login: '1', password: '1'}, {context:'2', login: '2', password: '2'}])
    const putKeysRequest = httpController.expectOne(CONFIG.apiURL.concat("/put"))
    expect(putKeysRequest.request.method).toBe("POST")
    let json = JSON.stringify([{context:'1', login: '1', password: '1'}, {context:'2', login: '2', password: '2'}])
    expect(putKeysRequest.request.body.data.content).toBe(json)
  });

  it('should correct rent place for account ', () => {
    service.rentPlace("")
    const rentPlaceRequest = httpController.expectOne(CONFIG.apiURL.concat("/put"))
    expect(rentPlaceRequest.request.method).toBe("POST")
    expect(rentPlaceRequest.request.body.data.content).toBe("")
  });

  it('should set account in local storage if it exists ', () => {
    service.setAccount({login: "1", password: "2"})
    let loginRequest = httpController.expectOne(CONFIG.apiURL.concat("/login")) 
    expect(loginRequest.request.method).toBe("POST")
    expect(loginRequest.request.body.login).toBe("1")
    expect(loginRequest.request.body.password).toBe("2")
    loginRequest.flush({data: "token123123"})
    let setup = httpController.expectOne(CONFIG.apiURL.concat("/setup"))
    expect(setup.request.headers.get("Authorization")).toEqual("Bearer token123123")
    let curAccount = localStorage.getItem("currentAccount")
    expect(curAccount).toBe('{"login":"1","password":"2"}') 
  });

  it('should not set account in local storage if it not exists ', () => {
    service.setAccount({login: "1", password: "2"})
    let loginRequest = httpController.expectOne(CONFIG.apiURL.concat("/login")) 
    expect(loginRequest.request.method).toBe("POST")
    expect(loginRequest.request.body.login).toBe("1")
    expect(loginRequest.request.body.password).toBe("2")
    loginRequest.flush({data: ""})
    let setup = httpController.expectNone(CONFIG.apiURL.concat("/setup"))
    let curAccount = localStorage.getItem("currentAccount")
    expect(curAccount).toBe(null) 
  });

  it('should register account if it not exists ', fakeAsync(() => {
    service.registerAccount({login: "1", password: "2"})
    let loginRequest = httpController.expectOne(CONFIG.apiURL.concat("/register_account")) 
    expect(loginRequest.request.method).toBe("POST")
    expect(loginRequest.request.body.login).toBe("1")
    expect(loginRequest.request.body.password).toBe("2")
    loginRequest.flush({data: "token123123"})
    tick(1200)
    let rentPlaceRequest = httpController.expectOne(CONFIG.apiURL.concat("/put"))
    expect(rentPlaceRequest.request.headers.get("Authorization")).toEqual("Bearer token123123")
    let curAccount = localStorage.getItem("currentAccount")
    expect(curAccount).toBe('{"login":"1","password":"2"}') 
  }));

  it('should not register account if it exists ', fakeAsync(() => {
    service.registerAccount({login: "1", password: "2"})
    let loginRequest = httpController.expectOne(CONFIG.apiURL.concat("/register_account")) 
    expect(loginRequest.request.method).toBe("POST")
    expect(loginRequest.request.body.login).toBe("1")
    expect(loginRequest.request.body.password).toBe("2")
    loginRequest.flush({data: ""})
    tick(1200)
    let rentPlaceRequest = httpController.expectNone(CONFIG.apiURL.concat("/put"))
    let curAccount = localStorage.getItem("currentAccount")
    expect(curAccount).toBe(null) 
  }));


  

});
