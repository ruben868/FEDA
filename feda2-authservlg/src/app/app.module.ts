import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginV1Component } from './login-v1/login-v1.component';
import {MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';

import {WINDOW_PROVIDERS} from './services/window.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { InvitacionComponent } from './activacion/invitacion/invitacion.component';
import { CsetpwdComponent } from './activacion/csetpwd/csetpwd.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginV1Component,
    InvitacionComponent,
    CsetpwdComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    HttpClientModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [WINDOW_PROVIDERS, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
