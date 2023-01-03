import {Inject, Injectable} from '@angular/core';
import {WINDOW} from './window.service';
import {LogServiceService} from './log-service.service';
import * as cryto from 'crypto-js';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {CookieService} from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authUri = 'http://localhost:4041/login-form/v1/';
  authApiUri = environment.AuthApiUri;
  uri = environment.APIEndpoint;
  clientId = 'fLbixVUE04wvdq7f04E+hHT8hKYqUW6PovJclOEzK1gwuG/dt7Zu9xu0dAaoFKeTCsGHHvJ6UCh5JlPdekm1Ew==';

  public user = {
    _id: '5da372ab78971d7c3eb6a969'
  };

  public makeid(length) {
    let result           = '';
    let characters       = '@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-!';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public SHA_256_HASH(message) {
    // let buffer = new TextEncoder().encode(message);
    // const algo = 'SHA-256';
    // let hash = await this.window.crypto.subtle.digest(algo, buffer);
    // return hash;
    this.log.show('SHA_256_HASH >>>>>>');
    let hash = cryto.SHA256(message);
    let base64 = cryto.enc.Base64.stringify(hash);
    this.log.show(base64);
    this.log.show('SHA_256_HASH <<<<<<');
    return base64;
  }

  public async getAuthCode(authLoginObj, userData) {
    try {
      const postData = {
        auth: authLoginObj,
        userData: userData
      };
      const response = await this.http.post(`${this.authApiUri}/auth/v1/getAuthCode`, postData).toPromise();
      this.log.show(response);
      this.attemptAuthDoneSource.next(response);
      return response;
    } catch (e) {
      this.log.show(e);
      this.attemptAuthErrorSource.next(e);
    }
  }

  private getCodeChallange() {
    const code = this.makeid(60);
    this.setCookieData('code', code);
    const codeChallange = this.SHA_256_HASH(code);

    return codeChallange;
  }

  public authGetLoginForm() {
    const redirectUrl = this.window.location.origin + '/signin/:authCode';

    // Parametros
    const params = {
      clientId: encodeURIComponent('fLbixVUE04wvdq7f04E+hHT8hKYqUW6PovJclOEzK1gwuG/dt7Zu9xu0dAaoFKeTCsGHHvJ6UCh5JlPdekm1Ew=='),
      codeChallange: encodeURIComponent(this.getCodeChallange()),
      codeChallangeMethod: 'sha256',
      reponseType: 'code',
      scope: 'all',
      redirectUrl: encodeURIComponent(redirectUrl)
    };

    // TODO: Get and validate cookie

    // redirect...
    const authLoginFormUri = `${this.authUri}${params.clientId}/${params.codeChallange}/${params.codeChallangeMethod}/${params.reponseType}/${params.scope}/${params.redirectUrl}`;
    this.log.show(authLoginFormUri);
    this.window.location.href = authLoginFormUri;
  }

  async requestToken(authCode) {
    try {
      const postData = {
        authcode: authCode,
        clientId: this.clientId,
        code: this.getCookieData('code')
      };

      const response: any = await this.http.post(`${this.uri}/auth/v1/gettoken`, postData).toPromise();
      this.log.show(response);
      this.setCookieData('token', response.token);
      this.reqTokenDoneSrc.next(response);
      return response;
    } catch (e) {
      this.log.show(e);
      this.reqTokenErrorSrc.next(e);
    }
  }

  // COOKIE STORE FUNCTIONS ================================================
  getCookieData(key) {
    return this.cookie.get(key);
  }

  setCookieData(key, value: any) {
    console.log(this.window.location.origin);
    this.cookie.set(key, value, null, '/');
  }
  // =======================================================================

  // OBSERVABLES ===========================================================
  // Indica cuando la información fue cargada desde el servidor
  private attemptAuthDoneSource = new Subject<any>();
  public attemptAuthDoneSource$ = this.attemptAuthDoneSource.asObservable();
  private attemptAuthErrorSource = new Subject<any>();
  public attemptAuthErrorSource$ = this.attemptAuthErrorSource.asObservable();

  private reqTokenDoneSrc = new Subject<any>();
  public reqTokenDoneSrc$ = this.reqTokenDoneSrc.asObservable();
  private reqTokenErrorSrc = new Subject<any>();
  public reqTokenErrorSrc$ = this.reqTokenErrorSrc.asObservable();
  // =======================================================================

  constructor(
    @Inject(WINDOW) private window: Window,
    private log: LogServiceService,
    private http: HttpClient,
    private cookie: CookieService,
  ) {
    this.SHA_256_HASH('123');
    this.log.show('end consturctor');
  }
}
