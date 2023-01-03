import {Inject, Injectable} from '@angular/core';
import {WINDOW} from './window.service';
// import {LogServiceService} from '../shared/log-service.service';
import * as crypto from 'crypto-js';
import {CookieService} from 'ngx-cookie-service';
import * as _ from 'lodash';
import {HttpClient} from '@angular/common/http';
import {of, Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';
import {AcsData} from '../models/acs-data';
import {LogServiceService} from './log-service.service';
import {EncdecService} from './encdec.service';
import {UserService} from './user.service';
import {RolModel, UserModel} from '../models/user-model';
import {MyLodash} from './my-lodash.service';
import { APP_BASE_HREF } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class AuthClientService {
  apiUri = environment.APIEndpoint;

  // VARIABLES ===========================================================
  encryptSecretKey = environment.oa_encryptSecretKey;
  clientId = environment.oa_clientId;
  authLoginUri = environment.oa_authLoginUri;
  authApiUri = environment.oa_authApiUri;

  acsData: AcsData = new AcsData();
  appSingInURI = '/signin/:authCode';
  isLogged = false;
  checkSesionOnGoing = false;

  isInit = false;

  userData: UserModel;

  // OBSERVABLES ===========================================================
  private authClientEventSource = new Subject<any>();
  public authClientEventSource$ = this.authClientEventSource.asObservable();

  private authReadyEventSource = new Subject<any>();
  public authReadyEvent$ = this.authReadyEventSource.asObservable();

  constructor(
    // @Inject(APP_BASE_HREF) public baseHref: string,
    @Inject(WINDOW) private window: Window,
    private log: LogServiceService,
    private cookie: CookieService,
    private http: HttpClient,
    private router: Router,
    private encSrv: EncdecService,
    private _: MyLodash,
    // private userSrv: UserService,
  ) {
    this.acsData = new AcsData();
  }

  /****
   * Genera el codigo de cliente y redirige a la página de login del auth server
   */

  private getRedirectUrl():string {
    let redirectUrl;
    // this.baseHref = "/bnext-app/";
    // let tmpBaseHref = "/bnext-app/";
    let baseHref = environment.baseHref;
    let tmpBaseHref = (baseHref.length > 0) ? baseHref.substr(0, baseHref.length - 1) : "";
    
    redirectUrl = `${this.window.location.origin}${(tmpBaseHref.length > 0) ? tmpBaseHref : ""}${(environment.useHash) ? "/#" : ""}${this.appSingInURI}`
    // if (this.baseHref.length > 0) {
    //   redirectUrl = this.window.location.origin + this.baseHref + this.appSingInURI;
    // } else {
    //   redirectUrl = this.window.location.origin + this.baseHref + "/#" + this.appSingInURI;
    // }

    console.log("getRedirectUrl = = = = = == = = = == = = = = = ==  =");
    console.log(redirectUrl);
    console.log(tmpBaseHref);
    console.log("getRedirectUrl = = = = = == = = = == = = = = = ==  =");

    return redirectUrl;
  }


  public authGetLoginForm() {
    // return true;
    const redirectUrl = this.getRedirectUrl();
    

    // obtener client code
    const res = this._recoverSecureData();
    // let codeChallange = '';

    // if (res) {
    //   codeChallange = res;
    // } else {
    //   codeChallange = this.getCodeChallange();
    // }

    // Parametros
    const params = {
      clientId: encodeURIComponent(this.clientId),
      codeChallange: encodeURIComponent(this.getCodeChallange()),
      codeChallangeMethod: 'sha256',
      reponseType: 'code',
      scope: 'all',
      redirectUrl: encodeURIComponent(redirectUrl)
    };

    const authLoginFormUri = `${this.authLoginUri}${params.clientId}/${params.codeChallange}/${params.codeChallangeMethod}/${params.reponseType}/${params.scope}/${params.redirectUrl}`;
    this.log.show(authLoginFormUri);
    console.log(" * * * * * * **  * * * * * * * *");
    console.log(" Before redirect ");
    console.log(" * * * * * * **  * * * * * * * *");
    this.window.location.href = authLoginFormUri;
    //this.window.open(authLoginFormUri)
  }

  public authGetLoginForm2() {
    // return true;
    // const redirectUrl = this.window.location.origin + this.appSingInURI;
    // const redirectUrl = this.window.location.origin + this.baseHref + this.appSingInURI;
    const redirectUrl = this.getRedirectUrl();

    // obtener client code
    const res = this._recoverSecureData();
    // let codeChallange = '';

    // if (res) {
    //   codeChallange = res;
    // } else {
    //   codeChallange = this.getCodeChallange();
    // }

    // Parametros
    const params = {
      clientId: encodeURIComponent(this.clientId),
      codeChallange: encodeURIComponent(this.getCodeChallange()),
      codeChallangeMethod: 'sha256',
      reponseType: 'code',
      scope: 'all',
      redirectUrl: encodeURIComponent(redirectUrl)
    };

    const authLoginFormUri = `${this.authLoginUri}${params.clientId}/${params.codeChallange}/${params.codeChallangeMethod}/${params.reponseType}/${params.scope}/${params.redirectUrl}`;
    this.log.show(authLoginFormUri);

    console.log(" * * * * * * **  * * * * * * * *");
    console.log(" Before redirect 2");
    console.log(" * * * * * * **  * * * * * * * *");
    this.window.location.href = authLoginFormUri;
  }

  /***
   * Solicita al servidor el token de autorización, enviando el código de autorización (authCode)
   * @param authCode: Es el código de autorización generado por el servidor.
   *                  Con este código, se solicita el token de autorizacion.
   */
  async requestTokenAsync(authCode) {
    try {
      this.log.show('requestTokenAsync (1) ---------');
      // obtener datos
      this._recoverSecureData();
      this.acsData.authCode = authCode;
      this.storeSecureData();

      this.log.show('requestTokenAsync (2) ---------');
      if (!_.isNil(this.acsData.authCode) && !_.isNil(this.acsData.clientCode)) {
        this.log.show('requestToken (3) ---------');
        try {
          this.log.show('requestToken (4) ---------');
          const postData = {
            authcode: this.acsData.authCode,
            clientId: this.clientId,
            code: this.acsData.clientCode
          };

          this.log.show('requestToken (5) ---------');
          const response: any = await this.http.post(`${this.authApiUri}/auth/v1/gettoken`, postData).toPromise();
          this.log.show('requestToken (6) ---------');

          this.acsData.token = response.token;
          this.acsData.refreshToken = response.refreshToken;
          this.acsData.userId = response.userId;
          this.acsData.clientId = this.clientId;
          console.log(this.acsData);
          this.storeSecureData();

          this.log.show('requestToken (7) ---------');

          // Obtener la información del usuario
          // await this.userSrv.getUserData(this.acsData.userId);

          this.isLogged = true;

          return response;
        } catch (e) {
          this.log.show(e);
          // this.reqTokenErrorSrc.next(e);
        }
      } else {
        // redirect a página de login
        this.authGetLoginForm();
      }
    } catch (e) {
      this.authGetLoginForm();
    }
  }

  async checkSesion(routePath) {

    this.log.sStr('auth-client.service', 'checkSesion', '1');
    this.log.show(routePath);
    let response = false;

    try {
      this.log.sStr('auth-client.service', 'checkSesion', '2');
      let resSecure  = this._recoverSecureData();
      if ( !(resSecure && this.isInit) ) {
        this.log.sStr('auth-client.service', 'checkSesion', '3');
        const res2 = await this.signInBase(null, routePath);
        resSecure = res2;
      }

      if (this._.isNil(this.userData)) {
        await this.getUserData(this.acsData.userId);
      }


      // Validar acceso a la ruta
      const parentPath = routePath[0].path;
      let accessPath = false;
      if (!this._.isNilOrEmpty(parentPath)) {
        for(let item of this.userData.roles) {
          this.log.show(item);
          for(let rolPath of item.paths) {
            this.log.show(rolPath);
            if (rolPath === parentPath) {
              accessPath = true;
              break;
            } else if ('user-info' === parentPath) {
              accessPath = true;
              break;
            }
          }
        }
      } else {
        accessPath = true; // no path
      }



      this.log.show(accessPath);
      return resSecure && accessPath;

      // this.log.sStr('auth-client.service', 'checkSesion', '3.1');
      // this.getUserData(this.acsData.userId);
      // this.log.sStr('auth-client.service', 'checkSesion', '3.2');
      //
      // return res2;
      // else {
      //   this.log.sStr('auth-client.service', 'checkSesion', '4');
      //   return res && this.isInit;
      // }
    } catch (e) {
      this.log.sStr('auth-client.service', 'checkSesion', '5');
      this.log.sStr('auth-client.service.ts', 'cehckSesion', 'ERROR #### #######');
      this.log.show(e);
    }

    return response;
    // let returnVal = false;
    //
    // if (this._recoverSecureData()) {
    //   // Corroborar con el servidor si el token aún es válido mediante llamada al servidor
    //   try {
    //     const response: any = await this.http.post(`${this.authApiUri}/auth/v1/checkTokenCli`, {
    //       clientId: this.clientId,
    //       token: this.acsData.token,
    //       userId: this.acsData.userId,
    //     }).toPromise();
    //
    //     if (!_.isNil(response)) {
    //       const codeChallange = this.SHA_256_HASH(this.acsData.clientCode);
    //       const serverData = this.encSrv.dec(response.d, codeChallange);
    //
    //       if (
    //           !_.isNil(serverData)
    //           && (serverData.token === this.acsData.token && serverData.userId === this.acsData.userId)
    //       ) {
    //         this.log.show('checkSesion =  VALID');
    //         return true;
    //       } else {
    //         this.log.show('checkSesion =  INVALID');
    //         return false;
    //       }
    //     } else {
    //       this.authGetLoginForm();
    //     }
    //   } catch (e) {
    //     this.log.show('checkSesion =  ERROR');
    //     console.log(e);
    //     if (!this.checkSesionOnGoing) {
    //       this.log.show('checkSesion (a): Error');
    //       this.checkSesionOnGoing = true;
    //       const resp2 = await this.checkSesion();
    //       this.checkSesionOnGoing = false;
    //
    //       return resp2;
    //     }
    //     this.authGetLoginForm();
    //   }
    // }
    //
    // return returnVal;
  }

  renewToken(): Promise<any> {
    this.log.show('renewToken (1) ---------');

    if (this._recoverSecureData()) {
      this.log.show('renewToken (2) ---------');
      return this.http.post(`${this.authApiUri}/auth/v1/renewToken`, {
        clientId: this.clientId,
        userId: this.acsData.userId,
        token: this.acsData.token,
        refreshToken: this.acsData.refreshToken,
      }).toPromise();
    } else {
      this.log.show('renewToken (3) ---------');
      return of(null).toPromise();
    }
  }

  setRenewToken(data: string) {
    // // desencriptar
    this.log.show('setRenewToken - - - - - - --  - - - - - - - - - - -');
    this.log.show(data);

    const codeChallange = this.SHA_256_HASH(this.acsData.clientCode);
    const response:any = this.encSrv.dec(data, codeChallange);

    this.log.show('setRenewToken - - - - - - -- ');
    this.log.show(response);

    this.acsData.token = response.token;
    this.acsData.refreshToken = response.refreshToken;
    this.storeSecureData();
    this.log.show(this.acsData);

    // Descencriptar datos

  }

  /***
   * Genera el codigo de cliente
   * Guarda la información en una cookie local
   */
  private getCodeChallange() {
    const code = this.makeid(60);
    this.acsData.clientCode = code;
    this.storeSecureData();
    const codeChallange = this.SHA_256_HASH(code);
    return codeChallange;
  }

  /***
   * Funcion auxiliar para generar un id random
   * @param length tamaño de la cadena que se va a generar
   */
  public makeid(length) {
    let result           = '';
    let characters       = '@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-!';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /***
   * Genera una HASH codificado en base64
   * Funcin auxiliar
   * @param message
   * @constructor
   */
  public SHA_256_HASH(message) {
    // let buffer = new TextEncoder().encode(message);
    // const algo = 'SHA-256';
    // let hash = await this.window.crypto.subtle.digest(algo, buffer);
    // return hash;
    this.log.show('SHA_256_HASH >>>>>>');
    let hash = crypto.SHA256(message);
    let base64 = crypto.enc.Base64.stringify(hash);
    this.log.show(base64);
    this.log.show('SHA_256_HASH <<<<<<');
    return base64;
  }

  storeSecureData() {
    try {
      const crypData = crypto.AES.encrypt(JSON.stringify(this.acsData), this.encryptSecretKey).toString();
      this.cookie.set('acs', crypData, null, '/');
    } catch (e) {
      console.log(e);
    }
  }

  _recoverSecureData() {
    let returnVal = false;
    this.acsData = new AcsData();
    this.log.show('_recoverSecureData (1)');
    try {
      const data = this.cookie.get('acs');
      const bytes = crypto.AES.decrypt(data, this.encryptSecretKey);
      if (bytes.toString()) {
        this.log.show('_recoverSecureData (2)');
        this.acsData.initWithData(JSON.parse(bytes.toString(crypto.enc.Utf8)));
        //this.log.show(this.acsData);
      }
      returnVal = true;
    } catch (e) {
      this.log.show('_recoverSecureData (3): Error al recuperar el cookie');
      console.log(e);
    }
    return returnVal;
  }

  get ssToken() {
    if (this._recoverSecureData()) {
      console.log(this.acsData);
      return this.acsData.token;
    } else {
      return null;
    }
  }

  removeCookie() {
    this.cookie.set('acs', null, null, '/');
  }

  addEvent(data: boolean) {
    this.isInit = data;
    this.authReadyEventSource.next(data);
  }

  async signIn(authCode) {
    const result = await this.signInBase(authCode, null);
    return result;
  }

  async signInBase(authCode, route) {
    let ret = false;
    const routeLoc = (this._.isNilOrEmpty(route)) ? [''] : route;

    // Convertir a command.

    if (!_.isNil(authCode)) {
      this.log.show('initAsync (1.1)');
      // Obtener el token del servidor
      const response = await this.requestTokenAsync(authCode);
      if (!_.isNil(response)) {
        this.log.show('initAsync (1.2)');
        // Redirigir a la página default

        this.addEvent(true);
        ret = true;
        this.router.navigate(['']);
      } else {
        this.log.show('initAsync (1.3)');
        this.authGetLoginForm();
      }
    } else {
      this.log.show('initAsync (2.1)');
      if (!_.isNil(this.ssToken)) {
        this.log.show('initAsync (2.2)');
        ret = true;
        this.addEvent(true);
        // this.router.navigate(routeLoc);
        // this.router.navigate([''], {relativeTo: routeLoc});
        // Obtener un token, si es que existe, validarlo en el servidor
      } else {
        this.log.show('initAsync (2.3)');
        // Si no existe el token, redirigir a la página de login
        this.authGetLoginForm();
      }
    }
    return ret;
  }

  async getUserData(authIdUser: string) {
    const url = `${this.apiUri}/users/getUserById/${authIdUser}`;
    try {
      this.log.show(authIdUser);
      const response: any = await this.http.get(url).toPromise();
      this.userData = response;
    } catch (e) {
      this.log.show('Error');
      this.log.show(e);
    }
    return null;
  }
}
