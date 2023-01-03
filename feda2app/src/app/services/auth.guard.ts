import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthClientService} from '../services/auth-client.service';
import {LogServiceService} from './log-service.service';
import {UserService} from './user.service';
import {MyLodash} from './my-lodash.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authClient: AuthClientService,
    private log: LogServiceService,
    private usrSrv: UserService,
    private _: MyLodash,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // this.log.show('auth guard');
    // return this.authClient.checkSesion();
    // return true;

    // const roles = this.usrSrv.userData.roles;
    this.log.show(next);
    this.log.show(state);
    this.log.show(next.url);
    // const path = next.url.path;
    // let hasPer = false;
    //
    // for(let item of roles) {
    //   for (let item2 of roles) {
    //     if (item2.path === path) {
    //       hasPer = true;
    //     }
    //   }
    // }

    // for(let item of this.usrSrv.userData.roles) {
    //
    // }

    // return this.authClient.checkSesion(next.url[0].path); // && hasPer;
    return this.authClient.checkSesion(next.url);
  }
}
