
import { Injectable } from '@angular/core';
import {Subject, Observable, throwError, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {AuthClientService} from '../../../services/auth-client.service';
import {LogServiceService} from '../../../services/log-service.service';
import {prepareSyntheticPropertyName} from '@angular/compiler/src/render3/util';
import {DateUtilService} from '../../../services/date-util.service';
import * as _ from 'lodash';
import {timeout, catchError} from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
// import {Http, ResponseContentType} from '@angular/http';


export enum FileEvents {
  GetFile = 1,
}

@Injectable({
  providedIn: 'root'
})

export class FileService {
  apiUri = environment.APIEndpoint;
  private eventSource = new Subject<any>();
  public eventSource$ = this.eventSource.asObservable();

  constructor(
    private http: HttpClient,
    private authClientSrv: AuthClientService,
    private log: LogServiceService,
    private dateUtil: DateUtilService,
    private usrService: UserService,
  ) { }



  // getAllUsuarios() {
  //   return this.http.get(`${this.apiUri}/cargas/getAllUsuarios`); 
  // }

  public async getAllUsuarios() {
    let response = null;
    
    try {
      response = await this.http.get(`${this.apiUri}/cargas/getAllUsuarios?ent=`+this.usrService.userData.entFed.nom).toPromise();
    } catch (e) {
      this.log.show('Error');
    }
    return response;
  }

}
