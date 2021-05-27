import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KeysComponent } from './keys/keys.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import {AddkeyComponent} from './addkey/addkey.component'
import {KeystableComponent} from './keystable/keystable.component'

const routes: Routes = [
      { path: 'keys', component: KeysComponent },
      { path: 'Login', component: LoginComponent },
      { path: 'Registration', component: RegistrationComponent },
      { path: 'Addkey', component: AddkeyComponent },
      { path: 'All_keys', component: KeystableComponent },
      { path: '', redirectTo: 'Login', pathMatch: 'full' }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

