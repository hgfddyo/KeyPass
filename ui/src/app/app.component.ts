import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Account } from './account'
import { KeyringService } from './keyring.service'
import {v4 as uuidv4} from 'uuid';
import { min } from 'rxjs/operator/min';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
//   title = 'Keys ring'

//   account:Account

//   constructor(public dialog: MatDialog, private keyringService: KeyringService, private router: Router) {}
  
//   ngOnInit() {
//     let account = JSON.parse(localStorage.getItem('currentAccount'));
//     console.log(account)
//     if(account){
//       this.account = account
//       this.keyringService.setAccount({login: this.account.login, password: this.account.password})
//     } else {
//         setTimeout(() => {
//         this.openAuth()
//         }, 200)
//     }
//   }

//   logout() {
//     localStorage.removeItem('currentAccount');
//     location.replace('index.html');
//   }

//   openAuth() {
//     let dialogRef = this.dialog.open(AuthorizationDialog, {
//       width: '258px',
//       data: {
//         login: this.account ? this.account.login : '',
//         password: this.account ? this.account.password : ''
//       },
//       disableClose:true
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       if(result.login && result.password && result.button == false) {
//         this.account = result
//         localStorage.setItem('currentAccount', JSON.stringify(this.account))
//         let account = JSON.parse(localStorage.getItem('currentAccount'));
//         console.log(account)
//         this.keyringService.setAccount({login: this.account.login, password: this.account.password})
//       } else if(result.login && result.password && result.button == true) {
//           this.account = result
//           localStorage.setItem('currentAccount', JSON.stringify(this.account))
//           this.keyringService.registerAccount({login: this.account.login, password: this.account.password})
//       }
//       setTimeout(() => {
//         let settings = this.keyringService.getSetup()
//         if(!settings) {
//           let myuuid = uuidv4()
//           this.keyringService.setSetup({device: myuuid, partition: "min"});
//         }
//       }, 1000)
//     });
//   }
// }

// @Component({
//   selector: 'authorization-dialog',
//   templateUrl: 'auth-dialog.html',
// })
// export class AuthorizationDialog {

//   constructor(
//     public dialogRef: MatDialogRef<AuthorizationDialog>,
//     @Inject(MAT_DIALOG_DATA) public data: any) { }

//   onLoginClick(): void {
//     this.data.button = false
//   }

//   onRegisterClick(): void {
//     this.data.button = true
//   }
 }
