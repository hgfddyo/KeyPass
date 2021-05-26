import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import "@angular/compiler";
import { AppRoutingModule } from './app-routing.module';

import { AppComponent} from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { KeysComponent } from './keys/keys.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { KeyringService } from './keyring.service'
import { ClipboardModule } from 'ngx-clipboard';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { AddkeyComponent } from './addkey/addkey.component';
import { KeystableComponent } from './keystable/keystable.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';


@NgModule({
  declarations: [
    AppComponent,
    KeysComponent,
    LoginComponent,
    RegistrationComponent,
    AddkeyComponent,
    KeystableComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatToolbarModule,
    FormsModule,
    MatIconModule,
    MatDialogModule,
    ClipboardModule,
    HttpClientModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule
    
  ],
  providers: [ KeyringService ],
  bootstrap: [ AppComponent ],
  entryComponents: [  ]
})
export class AppModule { }
