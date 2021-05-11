import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KeysComponent } from './keys/keys.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
      { path: 'keys', component: KeysComponent },
      { path: 'Login', component: LoginComponent },
      { path: '', redirectTo: 'Login', pathMatch: 'full' }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
