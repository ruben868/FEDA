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
// import {Http, ResponseContentType} from '@angular/http';


export enum BusquedaEvents {
  GetBusqueda = 1,
}

@Injectable({
  providedIn: 'root'
})

export class BusquedaArchivoService {
  apiUri = environment.APIEndpoint;
  private eventSource = new Subject<any>();
  public eventSource$ = this.eventSource.asObservable();

  constructor(
    private http: HttpClient,
    private authClientSrv: AuthClientService,
    private log: LogServiceService,
    private dateUtil: DateUtilService,
  ) { }


  // Obtener la lista

  getAllNumeros(data, pageIndex, pageSize) { 
    return this.http.post(this.apiUri+'/cargas/getAllNumeros?pageIndex='+pageIndex+'&pageSize='+pageSize,data); 
  
  }

  // getAllNumeros(data) { 
  //   return this.http.post('${this.apiUri}/cargas/getAllNumeros', data); 
  
  // }

  // async getAllNumeros(data, pageIndex, pageSize) {
  //   const url = this.apiUri+'/cargas/getAllNumeros?pageIndex='+pageIndex+'&pageSize='+pageSize+'&data='+data;
  //   try {
  //     const resp = await this.http.post(url).toPromise();
  //     return resp;
  //   } catch (e) {
  //     this.log.show(e);
  //   }
  // }


}
