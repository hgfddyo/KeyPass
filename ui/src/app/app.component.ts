import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Account } from './account'
import { KeyringService } from './keyring.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Keys ring'

  account:Account

  constructor(public dialog: MatDialog, private keyringService: KeyringService) {}

  openLogin() {
    let dialogRef = this.dialog.open(LoginDialog, {
      width: '250px',
      data: {
        login: this.account ? this.account.login : '',
        password: this.account ? this.account.password : ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.account = result
        this.keyringService.setAccount(this.account)
      }
    });
  }

  openSettings() {
    let setup = this.keyringService.getSetup();
    let dialogRef = this.dialog.open(SettingsDialog, {
      width: '250px',
      data: setup ? setup : {partition: "", device: ""}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if(result && result.partition && result.device) {
        this.keyringService.setSetup(result)
      }
    });
  }
}

@Component({
  selector: 'settings-dialog',
  templateUrl: 'settings-dialog.html',
})
export class SettingsDialog {

  constructor(
    public dialogRef: MatDialogRef<SettingsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close()
  }
}

@Component({
  selector: 'login-dialog',
  templateUrl: 'login-dialog.html',
})
export class LoginDialog {

  constructor(
    public dialogRef: MatDialogRef<LoginDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close()
  }
}
