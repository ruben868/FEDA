import { Injectable } from '@angular/core';
import {catchError, filter, finalize, switchAll, switchMap, take, tap} from 'rxjs/operators';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import {Router} from '@angular/router';
import {AuthClientService} from '../services/auth-client.service';
import {LogServiceService} from '../services/log-service.service';
import * as _ from 'lodash';
import {LoaderService} from '../services/loader.service';
import {environment} from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthClientService,
    private router: Router,
    private log: LogServiceService,
    private loaderService: LoaderService
  ) { }

  cachedRequest: Promise<any>;
  retryCheckToken = false;


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.show();
    // next.handle(req).pipe(
    //   finalize(() => this.loaderService.hide())
    // );
    return from(this.addBearerToken(req, next)).pipe(
      finalize(() => this.loaderService.hide())
    );
  }

  private async addBearerToken(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    this.log.sStr('interceptor', 'addBearerToken', '1');
    this.auth._recoverSecureData();
    let token = this.auth.acsData.token;
    let clientId = this.auth.acsData.clientId;
    let userId = this.auth.acsData.userId;

    const urlBricks = environment.adl_ext_income_folder;


    if (req.url.includes(urlBricks)) {
      this.log.sStr('interceptor', 'addBearerToken', '2');
      const orgReq = next.handle(req).toPromise();
      return orgReq;
    }

    // const headerSettings = req.headers.keys().reduce(
    //   (acc, cur) => {
    //     acc[cur] = req.headers.getAll(cur);
    //     return acc;
    //   }, {});

    if (!token) {
      console.log('performing request without auth!');
    }

    // prevent 302 redirect to challenge on a 401
    // headerSettings['X-Requested-With'] = 'XMLHttpRequest';
    // const
    //   headers = new HttpHeaders(headerSettings),
    //   newRequest = req.clone({headers});
    // const result = next.handle(newRequest).toPromise();
    this.log.sStr('interceptor', 'addBearerToken', '3');
    const newRequest = req.clone({
        setHeaders: {
          authorization: `Bearer ${token}`,
          'x-int-cid':  clientId || '',
          'x-int-aid':  userId || '',
        }
      });
    const result = next.handle(newRequest).toPromise();

    return result.catch(async (err) => {
      this.log.sStr('interceptor', 'addBearerToken', '4');
      this.log.show('addBearerToken catch (1)');

      if (req.url.includes(urlBricks)) {
        throw err;
      }

      if (err.status === 401 ) {
        this.log.sStr('interceptor', 'addBearerToken', '5');

        if (req.url.includes('gettoken')) {
          this.auth.authGetLoginForm();
        }

        if (req.url.includes('renewToken')) {
          this.auth.authGetLoginForm();
        }

        this.log.show('addBearerToken catch (2)');
        if (!this.cachedRequest) {
          this.log.show('addBearerToken catch (3)');
          this.cachedRequest = this.auth.renewToken();
        }

        this.log.show('addBearerToken catch (4)');
        const newToken = await this.cachedRequest;
        if (newToken) {
          this.log.sStr('interceptor', 'addBearerToken', '6');
          this.log.show('addBearerToken catch (5) !!!!!!!!!!!!');
          this.auth.setRenewToken(newToken.d);
          // this.auth.acsData.token = newToken.token;
          // this.auth.acsData.refreshToken = newToken.refreshToken;
          // this.auth.storeSecureData();
          this.cachedRequest = null;

          if (req.url.includes('auth/v1/checkTokenCli') && !this.retryCheckToken) {
            this.retryCheckToken = true;
            throw err;
            // this.auth.checkSesion();

            // return next.handle(this.auth.checkSesion).toPromise().then(data => {
            //   this.log.show('addBearerToken catch (6)');
            //   console.log('requeried data:', data); // <-- I also see this fire, with the valid data coming back from the second request
            //   return data; // <-- however the original caller doesn't get this data
            // });
          } else {
            this.log.sStr('interceptor', 'addBearerToken', '7');
            token = this.auth.acsData.token;
            clientId = this.auth.acsData.clientId;
            userId = this.auth.acsData.userId;

            const updatedRequest = req.clone({
              setHeaders: {
                authorization: `Bearer ${token}`,
                'x-int-cid':  clientId || '',
                'x-int-aid':  userId || '',
              }
              // setHeaders: {
              //   Authorization: `Bearer ${this.auth.acsData.token}`
              // }
            });

            // headerSettings['Authorization'] = `Bearer ${newToken}`;
            // const
            //   updatedHeaders = new HttpHeaders(headerSettings),
            //   updatedRequest = req.clone({headers: updatedHeaders, url: 'https://jsonplaceholder.typicode.com/todos/1'});
            // console.log('requery with new token'); // <-- I see this when I have a 401, eg by altering the auth token to be bad, whilst leaving the refresh token alone
            return next.handle(updatedRequest).toPromise().then(data => {
              this.log.show('addBearerToken catch (6)');
              console.log('requeried data:', data); // <-- I also see this fire, with the valid data coming back from the second request
              return data; // <-- however the original caller doesn't get this data
            });
          }
        }
      }
      else {
        throw err;
      }
    });

  }


  // private refreshTokenInProgress = false;
  // // Refresh Token Subject tracks the current token, or is null if no token is currently
  // // available (e.g. refresh pending).
  // private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
  //   null
  // );
  //
  // intercept(
  //   request: HttpRequest<any>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<any>> {
  //   return next.handle(this.addAuthenticationToken(request)).pipe(
  //     tap(
  //       event => {
  //         console.log('Event >>>>>>>>>');
  //         // logging the http response to browser's console in case of a success
  //         if (event instanceof HttpResponse) {
  //           console.log('api call success :', event);
  //         }
  //       },
  //       error => {
  //         this.log.show('Interceptor error (1)');
  //         if (
  //           request.url.includes("checkTokenCli") ||
  //           request.url.includes("renewToken")
  //         ) {
  //           this.log.show('Interceptor error (2)');
  //           // We do another check to see if refresh token failed
  //           // In this case we want to logout user and to redirect it to login page
  //
  //           if (request.url.includes("renewToken")) {
  //             this.auth.logout();
  //             return;
  //           }
  //           //
  //           return error;
  //
  //           //return next.handle(request);
  //         }
  //
  //         // If error status is different than 401 we want to skip refresh token
  //         // So we check that and throw the error if it's the case
  //         if (error.status !== 401) {
  //           return error;
  //         }
  //
  //         if (this.refreshTokenInProgress) {
  //           this.log.show('Interceptor error (3)');
  //           // If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
  //           // – which means the new token is ready and we can retry the request again
  //           return this.refreshTokenSubject.pipe(
  //             filter(result => result !== null),
  //             take(1),
  //             switchMap(() => next.handle(this.addAuthenticationToken(request)))
  //           );
  //         } else {
  //           this.log.show('Interceptor error (4)');
  //           this.refreshTokenInProgress = true;
  //
  //           // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
  //           this.refreshTokenSubject.next(null);
  //
  //           this.auth.renewToken().subscribe(
  //             reponse => {
  //               this.log.show('renewToken switchMap (1)');
  //               if (!_.isNil(reponse)) {
  //                 this.log.show('renewToken switchMap (2)');
  //                 this.log.show(reponse);
  //                 this.auth.acsData.token = reponse.token;
  //                 this.auth.storeSecureData();
  //                 this.refreshTokenInProgress = false;
  //                 this.refreshTokenSubject.next(reponse);
  //
  //                 return next.handle(this.addAuthenticationToken(request));
  //               } else {
  //                 this.log.show('renewToken switchMap (3)');
  //                 this.auth.logout();
  //               }
  //             },
  //             error1 => {
  //               this.refreshTokenInProgress = false;
  //               this.auth.logout();
  //               return error1;
  //             }
  //           );
  //         }
  //       }
  //     )
  //   );
  //
  //   // return next.handle(request).catch(error => {
  //   //
  //   // });
  // }
  //
  // addAuthenticationToken(request) {
  //   // If access token is null this means that user is not logged in
  //   // And we return the original request
  //
  //   this.log.show('addAuthenticationToken (1)');
  //   if (!this.auth.ssToken) {
  //     return request;
  //   }
  //
  //   this.log.show('addAuthenticationToken (1)');
  //
  //   // We clone the request, because the original request is immutable
  //   return request.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${this.auth.ssToken}`
  //     }
  //   });
  // }


  // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   if (request.url.indexOf('renewToken') !== -1) {
  //     return next.handle(request);
  //   }
  //
  //   const accessExpired = this.authService.isAccessTokenExpired();
  //   const refreshExpired = this.authService.isRefreshTokenExpired();
  //
  //   if (accessExpired && refreshExpired) {
  //     return next.handle(request);
  //   }
  //
  //   if (accessExpired && !refreshExpired) {
  //     if (!this.refreshTokenInProgress) {
  //       this.refreshTokenInProgress = true;
  //       this.refreshTokenSubject.next(null);
  //       return this.authService.requestAccessToken().pipe(
  //         switchMap((authResponse) => {
  //           this.authService.saveToken(AuthService.TOKEN_NAME, authResponse.accessToken);
  //           this.authService.saveToken(AuthService.REFRESH_TOKEN_NAME, authResponse.refreshToken);
  //           this.refreshTokenInProgress = false;
  //           this.refreshTokenSubject.next(authResponse.refreshToken);
  //           return next.handle(this.injectToken(request));
  //         }),
  //       );
  //     } else {
  //       return this.refreshTokenSubject.pipe(
  //         filter(result => result !== null),
  //         take(1),
  //         switchMap((res) => {
  //           return next.handle(this.injectToken(request))
  //         })
  //       );
  //     }
  //   }
  //
  //   if (!accessExpired) {
  //     return next.handle(this.injectToken(request));
  //   }
  // }
  //
  // injectToken(request: HttpRequest<any>) {
  //   const token = this.authService.getToken(AuthService.TOKEN_NAME);
  //   return request.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   });
  // }

  // intercept(
  //   request: HttpRequest<any>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<any>> {
  //   return next.handle(this.addAuthenticationToken(request)).pipe(
  //     tap(
  //       event => {
  //         console.log('Event >>>>>>>>>');
  //         // logging the http response to browser's console in case of a success
  //         if (event instanceof HttpResponse) {
  //           console.log('api call success :', event);
  //         }
  //       },
  //       error => {
  //         // logging the http response to browser's console in case of a failuer
  //         // alert('intercept error');
  //         // console.log('Interceptor error');
  //         // console.log(error);
  //         // if (error instanceof HttpErrorResponse) {
  //         //   if (error.status === 401) {
  //         //     // this.router.navigate(['signin']);
  //         //     this.authClient.authGetLoginForm();
  //         //   }
  //         // }
  //         // We don't want to refresh token for some requests like login or refresh token itself
  //         // So we verify url and we throw an error if it's the case
  //         this.log.show('Interceptor error (1)');
  //         if (
  //           request.url.includes("checkTokenCli") ||
  //           request.url.includes("renewToken")
  //         ) {
  //           this.log.show('Interceptor error (2)');
  //           // We do another check to see if refresh token failed
  //           // In this case we want to logout user and to redirect it to login page
  //
  //           if (request.url.includes("renewToken")) {
  //             this.auth.logout();
  //           }
  //
  //           return error;
  //         }
  //
  //         // If error status is different than 401 we want to skip refresh token
  //         // So we check that and throw the error if it's the case
  //         if (error.status !== 401) {
  //           return error;
  //         }
  //
  //         if (this.refreshTokenInProgress) {
  //           this.log.show('Interceptor error (3)');
  //           // If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
  //           // – which means the new token is ready and we can retry the request again
  //           return this.refreshTokenSubject.pipe(
  //             filter(result => result !== null),
  //             take(1),
  //             switchMap(() => next.handle(this.addAuthenticationToken(request)))
  //           );
  //         } else {
  //           this.log.show('Interceptor error (4)');
  //           this.refreshTokenInProgress = true;
  //
  //           // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
  //           this.refreshTokenSubject.next(null);
  //
  //           this.auth.renewToken().subscribe(
  //             token => {
  //               this.log.show('renewToken switchMap (1)');
  //               if (!_.isNil(token)) {
  //                 this.auth.acsData.token = token;
  //                 this.auth.storeSecureData();
  //                 this.refreshTokenInProgress = false;
  //                 this.refreshTokenSubject.next(token);
  //
  //                 return next.handle(this.addAuthenticationToken(request));
  //               } else {
  //                 this.auth.logout();
  //               }
  //             },
  //             error1 => {
  //               this.auth.logout();
  //             }
  //           );
  //
  //           // Call auth.refreshAccessToken(this is an Observable that will be returned)
  //           // return this.auth
  //           //   .renewToken().pipe(
  //           //     switchMap( (token:any) => {
  //           //       this.log.show('renewToken switchMap (1)');
  //           //       if (!_.isNil(token)) {
  //           //         this.auth.acsData.token = token;
  //           //         this.auth.storeSecureData();
  //           //         this.refreshTokenInProgress = false;
  //           //         this.refreshTokenSubject.next(token);
  //           //
  //           //         return next.handle(this.addAuthenticationToken(request));
  //           //       } else {
  //           //         this.auth.logout();
  //           //       }
  //           //     }),
  //           //     catchError( err => {
  //           //       this.log.show('renewToken catchError (1)');
  //           //       this.refreshTokenInProgress = false;
  //           //
  //           //       this.auth.logout();
  //           //
  //           //       return err;
  //           //     })
  //           //   );
  //         }
  //       }
  //     )
  //   );
  //
  //   // return next.handle(request).catch(error => {
  //   //
  //   // });
  // }

  // addAuthenticationToken(request) {
  //   // If access token is null this means that user is not logged in
  //   // And we return the original request
  //
  //   this.log.show('addAuthenticationToken (1)');
  //   if (!this.auth.ssToken) {
  //     return request;
  //   }
  //
  //   this.log.show('addAuthenticationToken (1)');
  //
  //   // We clone the request, because the original request is immutable
  //   return request.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${this.auth.ssToken}`
  //     }
  //   });

    /*
    // Get access token from Local Storage
        const accessToken = this.auth.getAccessToken();

        // If access token is null this means that user is not logged in
        // And we return the original request
        if (!accessToken) {
            return request;
        }

        // We clone the request, because the original request is immutable
        return request.clone({
            setHeaders: {
                Authorization: this.auth.getAccessToken()
            }
        });
     */






  /*
  // function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // how to update the request Parameters
    const updatedRequest = request.clone({
      // headers: request.headers.set('Authorization', 'Some-dummyCode')
      setHeaders: {
        Authorization: `Bearer ${this.authClient.ssAuthCode}`
      }
    });
    // logging the updated Parameters to browser's console
    console.log('Before making api call : ', updatedRequest);
    return next.handle(updatedRequest).pipe(
      tap(
        event => {
          console.log('Event >>>>>>>>>');
          // logging the http response to browser's console in case of a success
          if (event instanceof HttpResponse) {
            console.log('api call success :', event);
          }
        },
        error => {
          // logging the http response to browser's console in case of a failuer
          // alert('intercept error');
          console.log('Interceptor error');
          console.log(error);
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              // this.router.navigate(['signin']);
              this.authClient.authGetLoginForm();
            }
          }
        }
      )
    );
  }
   */
}
