import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginV1Component} from './login-v1/login-v1.component';
import {InvitacionComponent} from './activacion/invitacion/invitacion.component';


const routes: Routes = [
  { path: '', component: LoginV1Component  },
  { path: 'login-form/v1/:clientId/:codeChallange/:codeChallangeMethod/:responseType/:scope/:redirectUrl', component: LoginV1Component  },
  { path: 'activation/act/:mode/:invitationCode/:appUrl/:appName', component: InvitacionComponent  },
  // { path: 'activation/act', component: InvitacionComponent  },
];

@NgModule({
  //imports: [RouterModule.forRoot(routes)],
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { } 
