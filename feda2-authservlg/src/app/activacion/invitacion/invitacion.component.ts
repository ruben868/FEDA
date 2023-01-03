import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {LogServiceService} from '../../services/log-service.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {MyLodash} from '../../services/my-lodash.service';

@Component({
  selector: 'app-invitacion',
  templateUrl: './invitacion.component.html',
  styleUrls: ['./invitacion.component.scss']
})
export class InvitacionComponent implements OnInit {
  codigoEnviado = false;
  hasCodigoIncorrecto = false;
  uri = environment.APIEndpoint;
  pin = '';
  disableEnviarCodigo = false;
  hasCodeSent = false;
  hasCodeSending = false;

  form = this.fb.group({
    pin: ['', [Validators.required, Validators.maxLength(6)]],
    // mail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    // pwd: ['', Validators.required],
  });

  codeOk = false;
  public isLoading = false;
  public hasError = false;
  public showError = false;
  appName = '';
  invitationCode = '';
  appUrl = '';
  // isLoading = false;
  mail = '';
  hasInit = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private log: LogServiceService,
    private http: HttpClient,
    private _: MyLodash
  ) {
    this.route.paramMap.subscribe( (params: ParamMap) => {
      this.appName              = params.get('appName');
      this.invitationCode       = params.get('invitationCode');
      this.appUrl               = params.get('appUrl');
    });
  }

  ngOnInit() {
    this.init();
  }

  async init() {
    try {
      const resp: any = await this.getUserInfoFromInvitationCode(this.invitationCode);
      this.log.show(resp);
      this.mail = resp.mail;
      this.hasInit = true;
    } catch (e) {
      this.hasError = true;
      this.showError = true;
      this.hasInit = true;
    }
  }

  async getUserInfoFromInvitationCode(invitationCode) {
    try {
      this.isLoading = true;
      const resp: any = await this.http.post(`${this.uri}/auth/v1/ic`, {ic: invitationCode}).toPromise();
      // this.mail = resp.mail;
      // this.isLoading = false;
      return resp;
    } catch (e) {
      throw e;
    }
  }

  get isFormValid() {
    return this.form.valid;
  }

  async validarCodigo() {
    this.hasCodigoIncorrecto = false;
    const pin = this.form.get('pin').value;
    const resp: any = await this.http.post(`${this.uri}/auth/v1/ic`, {ic: this.invitationCode, pin: pin, a: 2}).toPromise();
    this.log.show(resp);
    if (!this._.isNil(resp) && resp === true) {
      this.pin = pin;
      this.codeOk = true;
    } else {
      this.hasCodigoIncorrecto = true;
    }
  }

  async onSubmit() {

  }

  async enviarCodigo() {
    this.disableEnviarCodigo = true;
    this.codigoEnviado = true;
    this.hasCodeSending = true;

    try {
      const resp: any = await this.http.post(`${this.uri}/auth/v1/ic`, {ic: this.invitationCode, a: 1}).toPromise();
      this.hasCodeSent = true;
      this.hasCodeSending = false;
    } catch (e) {
      this.log.show(e);
    }


    setTimeout(() => {
      this.disableEnviarCodigo = false;
      this.codigoEnviado = true;
    }, 60000);
  }

  // async onSubmit() {
  //   this.log.show('onSubmit');
  //   if (this.form.valid) {
  //     const userData = this.form.getRawValue();
  //
  //     this.isLoading = true;
  //     this.hasError = false;
  //
  //     try {
  //       const resp:any = await this.loginSrv.getAuthCodeAsync(this.authLoginObj, userData);
  //       // Redirect
  //       this.loginSrv.redirectAuth(this.authLoginObj, resp.authCode);
  //
  //       this.isLoading = false;
  //       this.hasError = false;
  //     } catch (e) {
  //       this.hasError = true;
  //       this.isLoading = false;
  //     }
  //   }
  // }
}
