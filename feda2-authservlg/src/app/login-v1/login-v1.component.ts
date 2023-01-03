import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Subscription} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {LogServiceService} from '../services/log-service.service';
import {LoginService} from './login.service';

@Component({
  selector: 'app-login-v1',
  templateUrl: './login-v1.component.html',
  styleUrls: ['./login-v1.component.scss']
})
export class LoginV1Component implements OnInit, OnDestroy {
  authLoginObj = {
    clientId: '',
    codeChallange: '',
    codeChallangeMethod: '',
    responseType: '',
    scope: '',
    redirectUrl: '',
  };

  // Variable declarations =================================================================================
  private subs: Subscription = new Subscription();

  public isLoading = false;
  public hasError = false;
  public appName = '';

  public showError = false;

  form = this.fb.group({
    mail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    pwd: ['', Validators.required],
  });
  // =======================================================================================================

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authSrv: AuthService,
    private loginSrv: LoginService,
    private log: LogServiceService
  ) {
    this.route.paramMap.subscribe( (params: ParamMap) => {
      this.authLoginObj.clientId              = params.get('clientId');
      this.authLoginObj.codeChallange         = params.get('codeChallange');
      this.authLoginObj.codeChallangeMethod   = params.get('codeChallangeMethod');
      this.authLoginObj.responseType          = params.get('responseType');
      this.authLoginObj.scope                 = params.get('scope');
      this.authLoginObj.redirectUrl           = params.get('redirectUrl');

      this.log.show(this.authLoginObj);
    });

    // this.subs.add(
    //   this.loginSrv.getAuthCodeDoneSrc$.subscribe((data) => {
    //     this.afterGetAuthCodeDone(data);
    //   })
    // );
    //
    // this.subs.add(
    //   this.loginSrv.getAuthCodeErrorSrc$.subscribe((data) => {
    //     this.afterGetAuthCodeError(data);
    //   })
    // );
    //
    // this.subs.add(
    //   this.loginSrv.loginServiceSrc$.subscribe((data) => {
    //     this.dispatchLoginServiceEvents(data);
    //   })
    // );
    //
    // this.loginSrv.getClientName(this.authLoginObj.clientId);
  }

  ngOnInit() {
    // Obtener información
    this.initAsync();
  }

  async initAsync() {
    try {
      // Obtiene información del cliente para desplegar información en la pantalla de login
      const clientInfo:any = await this.loginSrv.getClientInfo(this.authLoginObj.clientId);
      this.appName = clientInfo.label;
    } catch (e) {
      this.showError = true;
    }
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  async onSubmit() {
    this.log.show('onSubmit');
    if (this.form.valid) {
      const userData = this.form.getRawValue();

      this.isLoading = true;
      this.hasError = false;

      try {
        const resp:any = await this.loginSrv.getAuthCodeAsync(this.authLoginObj, userData);
        // Redirect
        this.loginSrv.redirectAuth(this.authLoginObj, resp.authCode);

        this.isLoading = false;
        this.hasError = false;
      } catch (e) {
        this.hasError = true;
        this.isLoading = false;
      }
    }
  }

  afterGetAuthCodeDone(data) {
    this.log.show(data);
    this.isLoading = false;
    this.log.show(data);

    this.loginSrv.redirectAuth(this.authLoginObj, data.authCode);
  }

  afterGetAuthCodeError(data) {
    this.hasError = true;
    this.isLoading = false;
  }

  get isFormValid(){
    return this.form.valid;
  }

  dispatchLoginServiceEvents(data) {
    switch (data.event) {
      case 'GETCLIENTNAMEOK':
        this.appName = data.data.clientName;
        break;
      case 'GETCLIENTNAMEERROR':
        // TODO: Show error
        break;
    }
  }
}
