import {Inject, Injectable} from '@angular/core';
import {WINDOW} from '../services/window.service';
import {LogServiceService} from '../services/log-service.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {AppError} from '../models/app-error';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  uri = environment.APIEndpoint;

  constructor(
    @Inject(WINDOW) private window: Window,
    private log: LogServiceService,
    private http: HttpClient
  ) { }

  // public async getAuthCode(authLoginObj, userData) {
  //   try {
  //     const postData = {
  //       auth: authLoginObj,
  //       userData: userData
  //     };
  //
  //     const response = await this.http.post(`${this.uri}/auth/v1/getAuthCode`, postData).toPromise();
  //     this.log.show(response);
  //     this.getAuthCodeDoneSrc.next(response);
  //     return response;
  //   } catch (e) {
  //     this.log.show(e);
  //     this.getAuthCodeErrorSrc.next(e);
  //   }
  // }

  public async getAuthCodeAsync(authLoginObj, userData) {
    try {
      const postData = {
        auth: authLoginObj,
        userData: userData
      };

      const response = await this.http.post(`${this.uri}/auth/v1/getAuthCode`, postData).toPromise();
      this.log.show(response);
      return response;
    } catch (e) {
      this.log.show(e);
      throw e;
    }
  }

  public redirectAuth(authLoginObj, authCode) {
    const redirectUrl = authLoginObj.redirectUrl.replace(':authCode', encodeURIComponent(authCode) );
    this.window.location.href = redirectUrl;
    // this.window.open(redirectUrl);
  }

  // public async getClientName(clientId) {
  //   try {
  //     this.log.show('getClientName (1)');
  //     const response = await this.http.post(`${this.uri}/auth/v1/getClientName`, {
  //       clientId: clientId
  //     }).toPromise();
  //     this.log.show(response);
  //     this.loginServiceSrc.next({
  //       event: 'GETCLIENTNAMEOK',
  //       data: response
  //     });
  //     return response;
  //   } catch (e) {
  //     this.log.show('getClientName (2): Error getting clientName');
  //     this.log.show(e);
  //     this.loginServiceSrc.next({
  //       event: 'GETCLIENTNAMEERROR',
  //       data: {}
  //     });
  //   }
  // }

  public async getClientInfo(clientId) {
    try {
      this.log.show('getClientInfo (1)');
      const response = await this.http.post(`${this.uri}/auth/v1/getClientName`, {
        clientId: clientId
      }).toPromise();
      this.log.show(response);
      return response;
    } catch (e) {
      this.log.show('getClientInfo (2): Error on service');
      this.log.show(e);
      if (e instanceof HttpErrorResponse) {
        if (e.status === 500) {
          // TODO: Soltar error cuando no se encuentre el client id
          const newError = new AppError('El id del cliente no existe');
          newError.context = 'login.service';
          newError.scope = 'client.not.found';
          throw newError;
        }
      } else {
        throw e;
      }
    }
  }

  // OBSERVABLES ================================================
  private getAuthCodeDoneSrc = new Subject<any>();
  public getAuthCodeDoneSrc$ = this.getAuthCodeDoneSrc.asObservable();
  private getAuthCodeErrorSrc = new Subject<any>();
  public getAuthCodeErrorSrc$ = this.getAuthCodeErrorSrc.asObservable();

  private loginServiceSrc = new Subject<any>();
  public loginServiceSrc$ = this.loginServiceSrc.asObservable();
  // ============================================================
}
