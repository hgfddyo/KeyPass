import { Component, OnInit, ViewChild, TemplateRef, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Account } from '../account'
import { KeyringService } from '../keyring.service'
import {v4 as uuidv4} from 'uuid';
import { min } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms'

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  loginControl: FormControl = new FormControl('', [Validators.required]);
  passwordControl: FormControl = new FormControl('', [Validators.required]);
  change: boolean
  account: Account

  constructor(public dialog: MatDialog, private keyringService: KeyringService, private router: Router) { 
    this.change = true;
    this.account = {password:"", login:""};
  }

  @ViewChild('PasswordTemplate') PasswordTemplate: TemplateRef<any>;
  
  changeTemplate() {
    this.change = !this.change;
  }

  ngOnInit() {
    let account = JSON.parse(localStorage.getItem('currentAccount'));
    if(account){
      this.account = account
      this.keyringService.setAccount(this.account).subscribe()
      this.router.navigate(["/keys"])
    } 
  }
  selectPassword(){
    this.account.password = this.passwordControl.value
  }

  selectLogin(){
    this.account.login = this.loginControl.value
  }
  goToLogin(){
    this.router.navigate(["/Login"])
  }

  registration(){
    if(this.loginControl.value && this.passwordControl.value){
      this.keyringService.registerAccount(this.account).subscribe(result =>{
        if(result){
          let settings = this.keyringService.getSetup()
          if(!settings) {
            let myuuid = uuidv4()
            this.keyringService.setSetup({device: myuuid, partition: "min"});
          }
          this.router.navigate(["/keys"])
        }
        else{
          let dialogRef = this.dialog.open(InformationDialog, {
            width: '258px',
            data: "This user is already exists."
          });
        }
      })
    }
  } 
}

@Component({
    selector: 'authorizationDialog',
    templateUrl: '../infodialog.html',
  })

export class InformationDialog {

  constructor(public dialogRef: MatDialogRef<InformationDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }
  
  close(){
    this.dialogRef.close();
  }
}

