import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KeysComponent } from './keys/keys.component';

const routes: Routes = [
      { path: 'keys', component: KeysComponent },
      { path: '', redirectTo: 'keys', pathMatch: 'full' }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
