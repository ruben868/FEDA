import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CargaArchivoConsComponent} from './components/carga-archivo/carga-archivo-cons/carga-archivo-cons.component';
import {AuthGuard} from './services/auth.guard';
import {SignInComponent} from './components/sign-in/sign-in.component';
import {CargaArchivoEditComponent} from './components/carga-archivo/carga-archivo-edit/carga-archivo-edit.component';
import {PlantillasViewComponent} from './components/plantillas/plantillas-view/plantillas-view.component';
import {UserEditComponent} from './components/user/user-edit/user-edit.component';
import {UserConsComponent} from './components/user/user-cons/user-cons.component';
import {UserInfoEditComponent} from './components/user/user-info-edit/user-info-edit.component';
import { last } from 'rxjs/operators';
import {BusquedaConsComponent} from './components/busqueda/busqueda-cons/busqueda-cons.component';
import {FilaBusquedaComponent} from './components/busqueda/fila-busqueda/fila-busqueda.component';


const routes: Routes = [


  { path: 'signin', component: SignInComponent  },
  { path: 'signin/:authCode', component: SignInComponent  },

  { path: 'carga-archivo', component: CargaArchivoConsComponent, canActivate: [AuthGuard]  },
  { path: 'carga-archivo-edit/:id', component: CargaArchivoEditComponent, canActivate: [AuthGuard]  },
  { path: 'plantillas-view', component: PlantillasViewComponent, canActivate: [AuthGuard]  },
  { path: 'user-edit', component: UserEditComponent, canActivate: [AuthGuard]},
  { path: 'user-edit/:id', component: UserEditComponent, canActivate: [AuthGuard]},
  { path: 'user-cons', component: UserConsComponent, canActivate: [AuthGuard]},
  { path: 'busqueda-cons', component: BusquedaConsComponent, canActivate: [AuthGuard]},
  { path: 'fila-busqueda', component: FilaBusquedaComponent, canActivate: [AuthGuard]},

  { path: 'user-info', component: UserInfoEditComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'carga-archivo', canActivate: [AuthGuard]  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], 
  //imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// rewrite 
// 
// rewrite "^/signin" /index.html last;
// rewrite "^/carga-archivo" /index.html last;
// rewrite "^/carga-archivo-edit" /index.html last;
// rewrite "^/plantillas-view" /index.html last;
// rewrite "^/user-edit" /index.html last;
// rewrite "^/user-cons" /index.html last;
// rewrite "^/user-info" /index.html last;
// 
// { path: 'signin', component: SignInComponent  },
// { path: 'signin/:authCode', component: SignInComponent  },
// { path: 'carga-archivo', component: CargaArchivoConsComponent, canActivate: [AuthGuard]  },
// { path: 'carga-archivo-edit/:id', component: CargaArchivoEditComponent, canActivate: [AuthGuard]  },
// { path: 'plantillas-view', component: PlantillasViewComponent, canActivate: [AuthGuard]  },
// { path: 'user-edit', component: UserEditComponent, canActivate: [AuthGuard]},
// { path: 'user-edit/:id', component: UserEditComponent, canActivate: [AuthGuard]},
// { path: 'user-cons', component: UserConsComponent, canActivate: [AuthGuard]},
// { path: 'user-info', component: UserInfoEditComponent, canActivate: [AuthGuard] },
// { path: '**', redirectTo: 'carga-archivo', canActivate: [AuthGuard]  },