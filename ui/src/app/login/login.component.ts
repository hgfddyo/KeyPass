import { Component, OnInit, ViewChild, TemplateRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Account } from '../account'
import { KeyringService } from '../keyring.service'
import {v4 as uuidv4} from 'uuid';
import { min } from 'rxjs/operator/min';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  change: boolean
  account: Account

  constructor(public dialog: MatDialog, private keyringService: KeyringService, private router: Router) { 
    this.change = true;
  }

  @ViewChild('LoginTemplate') LoginTemplate: TemplateRef<any>;
  @ViewChild('PasswordTemplate') PasswordTemplate: TemplateRef<any>;
  
  get getTemplate() {
    if (this.change) {
      return this.LoginTemplate;
    }
    else {
      return this.PasswordTemplate;
    }

  }

  changeTemplate() {
    this.change = !this.change;
  }

  ngOnInit() {
    let account = JSON.parse(localStorage.getItem('currentAccount'));
    console.log(account)
    if(account){
      this.account = account
      this.keyringService.setAccount({login: this.account.login, password: this.account.password})
      this.router.navigate(["/keys"])
    } 
  }

}
