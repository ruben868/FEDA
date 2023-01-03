import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {AuthClientService} from '../../services/auth-client.service';
import {LogServiceService} from '../../services/log-service.service';
import {prepareSyntheticPropertyName} from '@angular/compiler/src/render3/util';
import {DateUtilService} from '../../services/date-util.service';
import * as _ from 'lodash';
import {timeout} from 'rxjs/operators';
import {PeriodoCargaModel} from './periodo-carga-model';
import {CargaModel} from '../../models/carga-model';
import {Observable} from 'rxjs';
import { LoadExcelExtResultModel } from './load-excel-ext/load-excel-ext-result-model';
// import {Http, ResponseContentType} from '@angular/http';


@Injectable({
  providedIn: 'root'
})
export class CargaArchivoService {
  apiUri = environment.APIEndpoint;

  constructor(
    private http: HttpClient,
    private authClientSrv: AuthClientService,
    private log: LogServiceService,
    private dateUtil: DateUtilService,
  ) { }


  // Obtener la lista de los pendientes por cargar
  async allList() {
    const url = `${this.apiUri}/cargas/getCargas`;
    try {
      this.authClientSrv._recoverSecureData();
      const postData = {
        fecha: new Date(),
        authUserId: this.authClientSrv.acsData.userId,
        cveEntFed: this.authClientSrv.userData.entFed.cve,
        orgCveStr: this.authClientSrv.userData.org.cveStr
      };
      const response = await this.http.post(url, postData).toPromise();
      return response;
    } catch (e) {
      this.log.show('Error: carga-archivo.service.ts --> allList');
      this.log.show(e);
    }
    return null;
  }

  async getPeriodoCargaById(yearWeek) {
    try {
      const cveEntFed = this.authClientSrv.userData.entFed.cve;
      const orgCveStr = this.authClientSrv.userData.org.cveStr;
      const url = `${this.apiUri}/cargas/getCargas/${yearWeek}/${cveEntFed}/${orgCveStr}`;
      const response = await this.http.get(url).toPromise();
      return response;
    } catch (e) {
      this.log.show('Error on getPeriodoCargaById');
    }
  }


  async getADLAccessToken() {
    try {
      this.log.sStr('carga-archivo-service', 'getADLAccessToken', 'Init >>>>  ');
      const url = `${this.apiUri}/cargas/req-stg-tok`;
      const respose: any = await this.http.get(url).toPromise();
      this.log.show(respose);
      return respose.at;
    } catch (e) {
      this.log.sStr('carga-archivo-service', 'getADLAccessToken', 'ERROR!!!!');
      this.log.show(e);
    }
  }

  async loadFile(fileData, fileName) {
    let stat = false;
    this.log.show(fileName);

    // Obtener token
    let accessToken: string = null;
    try {
      accessToken = await this.getADLAccessToken();
      this.log.sStr('carga-archivo-service', 'loadFile', '+Token found!');
      this.log.show(accessToken);
    } catch (e) {
      this.log.sStr('carga-archivo-service', 'loadFile', 'ERROR!!!! Token not found');
      throw new Error('NoADLToken');
    }

    const authHeader = {
      'x-ms-version': '2018-11-09',
      'content-type': 'application/octet-stream',
      authorization: `Bearer ${accessToken}`,
    };

    let baseUrl = environment.adl_ext_income_folder;
    baseUrl = baseUrl + fileName;

    try {
      let res = null;
      // await this.wait(500);
      const createFileRes = await this.createFile(baseUrl, {headers: authHeader});
      this.log.sStr('carga-archivo-service', 'loadFile', 'createFile res');
      this.log.show(createFileRes);
      await this.wait(200);
      const writeFileRes = await this.writeFile(baseUrl, {headers: authHeader}, fileData);
      this.log.sStr('carga-archivo-service', 'loadFile', 'writeFileRes >>>>>');
      this.log.show(writeFileRes);
      await this.wait(200);
      const FlushFileRes = await this.flushFile(baseUrl, {headers: authHeader}, fileData.size);
      this.log.sStr('carga-archivo-service', 'loadFile', 'FlushFileRes res');
      this.log.show(FlushFileRes);
      stat = true;
    } catch (e) {
      this.log.sStr('carga-archivo-service', 'loadFile', 'ERROR!!!! Al subir archvio');
      throw new Error('NoADLToken');
    }

    return stat;
  }

  async loadFileNode(fileData, fileName, periodoCarga:PeriodoCargaModel) {
    try {
      let stat = false;
      this.log.show(fileName);
      let formData: FormData = new FormData();
      formData.append('uploadFile', fileData, fileName);
      formData.append('resultJSON', JSON.stringify(periodoCarga));
      const url = `${this.apiUri}/files/upload-single`;
      let response:any = await this.http.post(url, formData).toPromise();
      console.log(" * * * * * * *  * *");
      console.log("the response");
      console.log(response);
      console.log(" * * * * * * *  * *");

      // stat = !response.hasError;

      return response;
    } catch(e) {
      console.log(" * * * * * * *  * *");
      console.log(e);
    }



    // // Obtener token
    // let accessToken: string = null;
    // try {
    //   accessToken = await this.getADLAccessToken();
    //   this.log.sStr('carga-archivo-service', 'loadFile', '+Token found!');
    //   this.log.show(accessToken);
    // } catch (e) {
    //   this.log.sStr('carga-archivo-service', 'loadFile', 'ERROR!!!! Token not found');
    //   throw new Error('NoADLToken');
    // }

    // const authHeader = {
    //   'x-ms-version': '2018-11-09',
    //   'content-type': 'application/octet-stream',
    //   authorization: `Bearer ${accessToken}`,
    // };

    // let baseUrl = environment.adl_ext_income_folder;
    // baseUrl = baseUrl + fileName;

    // try {
    //   let res = null;
    //   // await this.wait(500);
    //   const createFileRes = await this.createFile(baseUrl, {headers: authHeader});
    //   this.log.sStr('carga-archivo-service', 'loadFile', 'createFile res');
    //   this.log.show(createFileRes);
    //   await this.wait(200);
    //   const writeFileRes = await this.writeFile(baseUrl, {headers: authHeader}, fileData);
    //   this.log.sStr('carga-archivo-service', 'loadFile', 'writeFileRes >>>>>');
    //   this.log.show(writeFileRes);
    //   await this.wait(200);
    //   const FlushFileRes = await this.flushFile(baseUrl, {headers: authHeader}, fileData.size);
    //   this.log.sStr('carga-archivo-service', 'loadFile', 'FlushFileRes res');
    //   this.log.show(FlushFileRes);
    //   stat = true;
    // } catch (e) {
    //   this.log.sStr('carga-archivo-service', 'loadFile', 'ERROR!!!! Al subir archvio');
    //   throw new Error('NoADLToken');
    // }

    // return stat;
  }

  async createFile(baseUrl, headers) {
    const url = baseUrl + '?resource=file';
    this.log.show(url);
    try {
      const resp: any = await this.http.put(url, null, headers).toPromise();
      return resp;
    } catch (e) {
      this.log.sStr('carga-archivo-service', 'createFile', 'ERROR!!!!');
      this.log.show(e);
      throw e;
    }
    return null;
  }

  async writeFile(baseUrl, headers, fileBlob) {
    try {
      let append: any;
      let chunkBlob;
      let url;
      const BYTES_PER_CHUNK = 1048576 * 1; // 5Mb

      let newHeaders = {
        'x-ms-version': headers.headers['x-ms-version'],
        'content-type': headers.headers['content-type'],
        authorization: headers.headers['authorization'],
      };

      for (let i = 0; i < fileBlob.size; i += BYTES_PER_CHUNK) {
        chunkBlob = fileBlob.slice(i, i + BYTES_PER_CHUNK);
        // Upload the different chinks
        this.log.show(chunkBlob.size);
        // newHeaders['Content-Length'] = chunkBlob.size.toString();
        url =  baseUrl + `?action=append&position=${i}`;
        append = await this.http.patch(url, chunkBlob, {headers: newHeaders}).toPromise();
      }
      return append;
    } catch (e) {
      this.log.sStr('carga-archivo-service', 'writeFile', 'ERROR!!!!');
      this.log.show(e);
      throw e;
    }
    return null;
  }

  async flushFile(baseUrl, headers, strDataLen) {
    const url = baseUrl + '?action=flush&position=' + strDataLen;

    let newHeaders = {
      'x-ms-version': headers.headers['x-ms-version'],
      'content-type': headers.headers['content-type'],
      // 'content-length': '0',
      'xs-ms-date': (new Date()).toString(),
      authorization: headers.headers['authorization'],
    };

    try {
      const resp = await this.http.patch(url, '', {headers: newHeaders}).toPromise();
      return resp;
    } catch (e) {
      this.log.sStr('carga-archivo-service', 'flushFile', 'ERROR!!!!');
      this.log.show(e);
      throw e;
    }
    return null;
  }

  createFileName(entidad, fechaCarga, periodoCarga: PeriodoCargaModel, orgCveStr, evalua) {
    const fechaVigencia = this.dateUtil.addDay(periodoCarga.periodo.end, 4);
    let diff = this.dateUtil.diffInDays(fechaVigencia, fechaCarga);
    diff = (diff < 0) ? 0 : diff;
    diff = (diff >= 100) ? 99 : diff;
    let diffStr: string = '0' + diff.toString();
    diffStr = this.dateUtil.right(diffStr, 2);

    const evalStr = (evalua) ? '01' : '00';

    const strEnt = this.dateUtil.right('0' + entidad.toString(), 2);


    const fileName = orgCveStr
      + evalStr
      + strEnt
      + this.dateUtil.fd_ddmmyyyy(fechaCarga)
      + periodoCarga.periodo.yearWeek
      + periodoCarga.periodo.startNum
      // + periodoCarga.periodo.endNum
      + diffStr
      + '.xlsx'
    ;

    return fileName;
  }

  async wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  async updateCarga(carga: CargaModel) {
    try {
      const url = `${this.apiUri}/cargas/upsert-carga`;
      const response = await this.http.post(url, carga).toPromise();
      return response;
    } catch (e) {
      this.log.sStr('carga-archivo.service', 'updateCarga', 'ERROR ##############');
      this.log.show(e);
    }
  }

  async registrarTask(cargaId: string) {
    try {
      const url = `${this.apiUri}/cargas/regtask`;
      const response = await this.http.post(url, {cargaId: cargaId}).toPromise();
      return response;
    } catch (e) {
      this.log.sStr('carga-archivo.service', 'registrarTask', 'ERROR ##############');
      this.log.show(e);
    }
  }

  async descargarComprobante(fileId) {
    try {
      const url = `${this.apiUri}/cargas/getfile/comp/${fileId}`;
      const response = await this.http.get(url).toPromise();
      return response;
    } catch (e) {
      this.log.sStr('carga-archivo.service', 'descargarComprobante', 'ERROR ##############');
      this.log.show(e);
    }
  }

  getDownloadFileLink(fileId) {
    return `${this.apiUri}/cargas/getfile/comp/${fileId}`;
  }

  downloadFile(fileId): Observable<any> {
    const url = `${this.apiUri}/cargas/getfile/comp/${fileId}`;
    return this.http.get(url, {responseType: 'blob'});
  }

  downloadFilePlantilla(fileName): Observable<any> {
    const url = `${this.apiUri}/cargas/getfile/plant/${fileName}`;
    return this.http.get(url, {responseType: 'blob'});
  }

  async getStatusWSCarga(cveEntFed, yearWeek) {
    const orgCveStr = this.authClientSrv.userData.org.cveStr;
    const url = `${this.apiUri}/cargas/getstatwscarga/${cveEntFed}/${yearWeek}/${orgCveStr}`;
    const resp = await this.http.get(url).toPromise();
    return resp;
  }
}
