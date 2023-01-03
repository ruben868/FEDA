import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {AuthClientService} from './services/auth-client.service';
import {LogServiceService} from './services/log-service.service';
import {Subscription} from 'rxjs';
import {SignInComponent} from './components/sign-in/sign-in.component';
import {MyLodash} from './services/my-lodash.service';
import {UserService} from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // @ViewChild(SignInComponent, { static: false})
  // signIn: SignInComponent;

  title = 'extorsiones';
  authReady = false;
  private subs: Subscription = new Subscription();

  // handleSearch(value: string) {
  //   this.filtro_valor = value
  // }

  // filtro_valor = ''

  constructor(
    private authSrv: AuthClientService,
    private log: LogServiceService,
    private _: MyLodash,
    private usrSrv: UserService
  ) {
    this.subs.add(
      this.authSrv.authReadyEvent$.subscribe((data) => {
          this.authReady = data;
        }
      ));
  }

  ngOnInit(): void {
    // this.init();
  }

  async init() {
    this.authSrv._recoverSecureData();
    // this.log.show('Get User Data');
    await this.usrSrv.getUserData(this.authSrv.acsData.userId);
    this.log.show('Get User Data');
  }

  redirect() {
    this.authSrv.authGetLoginForm2();
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.checkSignIn();
  //   }, 1000);
  // }

  // async checkSignIn() {
  //   this.log.show('checkSignIn >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  //   this.log.show(this.signIn);
  //   this.log.show(this.signIn.authCode);
  //   if (!this._.isNil(this.signIn) && !this._.isNil(this.signIn.authCode)) {
  //     this.log.show('AUTH TOKEN!!!');
  //     await this.authSrv.signIn(this.signIn.authCode);
  //   } else {
  //     this.log.show('NO AUTH TOKEN');
  //     await this.authSrv.signIn(null);
  //   }
  // }
}
