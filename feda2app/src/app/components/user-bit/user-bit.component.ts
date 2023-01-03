import { Component, OnInit } from '@angular/core';
import {UserInfo} from '../../models/user-info';
import {UserService} from '../../services/user.service';
import {Subscription} from 'rxjs';
import {UserModel} from '../../models/user-model';
import {LogServiceService} from '../../services/log-service.service';
import {AuthClientService} from '../../services/auth-client.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-user-bit',
  templateUrl: './user-bit.component.html',
  styleUrls: ['./user-bit.component.scss']
})
export class UserBitComponent implements OnInit {

  private subs: Subscription = new Subscription();
  userInfo: UserInfo;

  constructor(
    private userSrv: UserService,
    private log: LogServiceService,
    private authCliSrv: AuthClientService,
    private router: Router
  ) {
    this.subs.add(
      this.userSrv.updateUserInfoEvent$.subscribe((data) => {
          this.setAuthData(data.userData);
        }
      ));
  }

  ngOnInit() {
    // mock
    this.userInfo = {
      correo: " - ",
      org: " - ",
      entFedAbr: "-",
    };

    this.init();
  }

  async init() {
    setTimeout( async () => {
      await this.userSrv.getUserDataWithHeaders();
    }, 3000 );

    // try {
    //   await this.userSrv.getUserDataWithHeaders();
    // } catch (e) {
    //   // alert('error');
    //   setTimeout( () => {
    //     this.userSrv.getUserDataWithHeaders();
    //   }, 1000 );
    // }
  }

  setAuthData(userData: UserModel) {
    this.userInfo.correo = userData.authInfo.mail;
    this.userInfo.org = userData.org.abr;
    this.userInfo.entFedAbr = userData.entFed.abr;
  }

  async onCerrarSesion($event) {
    this.log.show($event);

    try {
      const resp = await this.userSrv.signOut();
      this.authCliSrv.removeCookie();
      this.authCliSrv.authGetLoginForm();
    } catch (e) {
      //
      this.log.show('Error on onCerrarSesion');
    }
  }

  onGoInfoAccount() {
    this.router.navigate(['user-info']);
  }

}
