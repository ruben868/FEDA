import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {PeriodoCargaModel} from '../periodo-carga-model';
import {CargaArchivoService} from '../carga-archivo.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {LogServiceService} from '../../../services/log-service.service';
// import * as _ from 'lodash';
import {LoadExcelExtResultModel} from '../load-excel-ext/load-excel-ext-result-model';
import {AuthClientService} from '../../../services/auth-client.service';
import * as fileSaver from 'file-saver';
import {CargaModel} from '../../../models/carga-model';
import {LoadExcelExtComponent} from '../load-excel-ext/load-excel-ext.component';
import {SideNavService} from '../../side-nav/side-nav.service';
import {UserService} from '../../../services/user.service';
import {MyLodash} from '../../../services/my-lodash.service';
import { resolve } from 'url';

@Component({
  selector: 'app-carga-archivo-edit',
  templateUrl: './carga-archivo-edit.component.html',
  styleUrls: ['./carga-archivo-edit.component.scss']
})
export class CargaArchivoEditComponent implements OnInit {
  @ViewChild('loadExcel01', {static: false})
  private loadExcel: LoadExcelExtComponent;

  estatusCarga = 0;
  showNetworkError = 0;
  periodoCarga: PeriodoCargaModel;
  yearWeek: string;

  constructor(
    private cargaSrv: CargaArchivoService,
    private route: ActivatedRoute,
    private log: LogServiceService,
    private authSrv: AuthClientService,
    private router: Router,
    private sideNavSrv: SideNavService,
    private userSrv: UserService,
    public _: MyLodash
  ) {
    this.sideNavSrv.addEnterEvent('carga');
    this.route.paramMap.subscribe( (params: ParamMap) => {
      this.yearWeek = params.get('id');
    });
  }

  ngOnInit() {
    this.log.show('NgOnInit');
    this.log.show(this.yearWeek);
    this.init();
  }

  wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay));

  async init() {
    try {
      // esperar 3 segundos
      console.log("init (1)");
      await this.wait(3000);
      // await new Promise(resolve => {
      //   setTimeout(() => {
      //     console.log(" * * * * * * * * * * * * * * * * *");
      //     console.log(" * * * * * * * * * * * * * * * * *");
      //     console.log(this.userSrv.userData);
      //     console.log(" init await");
      //     resolve;
      //   }, 3000);        
      // });
      console.log("init (2)");


      this.periodoCarga = await this.cargaSrv.getPeriodoCargaById(this.yearWeek);
      console.log(this.periodoCarga);
      console.log("init (3)");

      const wscarga = this._.get(this.periodoCarga, 'carga.wscarga', null);
      console.log("init (4)");
      if (this._.isNil(wscarga)) {
        console.log("init (5)");
        // Obtener el estatus actual
        const cveEntFed = this.authSrv.userData.entFed.cve;
        const yearWeek = this.periodoCarga.periodo.yearWeek;
        const estat: any = await this.cargaSrv.getStatusWSCarga(cveEntFed, yearWeek);
        this.log.show(estat);

        const tmp: any = this._.get(this.periodoCarga, 'carga', {});
        this.log.show(tmp);
        tmp.wscarga = {
          registros: estat.registros,
          fechaFin: estat.ultimaFechaCarga
        };
        this.periodoCarga.carga = tmp;
      }

      /**
       * Modificación para trabajar con spark local
       */
       console.log("init (6)");
       

       

      this.log.show(this.periodoCarga);
    } catch (e) {
      this.log.show(e);
      this.log.show('Error on carga-archivo-edit --> init');
      await this.setDefaultCarga();
    }

    if (this.loadExcel && this.loadExcel.periodoCarga) {
      this.loadExcel.periodoCarga = this.periodoCarga;
    }
    
  }

  /**
    * Modificación SPARK LOCAL
  */
  async setDefaultCarga() {
    if (this._.isNil(this.periodoCarga.carga)) {
      this.setDefaultCargaInfo();
    }

    console.log(" * * * * * * * * * * * * * * * * *");
    console.log(this.periodoCarga);
    console.log(this.userSrv.userData);

    if (this._.isNil(this.userSrv.userData)) {
      await new Promise(resolve => {
        setTimeout(() => {
          console.log(" * * * * * * * * * * * * * * * * *");
          console.log(" * * * * * * * * * * * * * * * * *");
          console.log(this.userSrv.userData);
          resolve;
        }, 3000);        
      });
    }

    // this.periodoCarga.carga.fechaCarga = result.loadDate;
    // this.periodoCarga.carga.nomArchivoOrg = result.orgFileName;
    // this.periodoCarga.carga.genFileName = result.getFileName;
    // this.periodoCarga.carga.fileId = result.getFileName.split('.')[0];
    // this.periodoCarga.carga.estatus = 'cargando';
    this.periodoCarga.carga.entfed = {
      cve: this.userSrv.userData.entFed.cve,
      cveStr: this.userSrv.userData.entFed.cveStr,
      nom: this.userSrv.userData.entFed.nom,
      tipo: this.userSrv.userData.entFed.tipo,
    };
    this.periodoCarga.carga.org = this.userSrv.userData.org;    


  }

  onLoadFile() {
    this.showNetworkError = 0;
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.click();
  }

  onEstadoCarga(estatusCarga: number) {
    this.estatusCarga = estatusCarga;
  }

  async onFileInfoResult(result: PeriodoCargaModel) {
    console.log("onFileInfoResult executed");
    console.log(result);
    this.periodoCarga = result;
  }

  async onFileInfoResult_BACKUP(result: LoadExcelExtResultModel) {
    try {
      if (this._.isNil(this.periodoCarga.carga)) {
        this.setDefaultCargaInfo();
        // this.periodoCarga.carga = {
        //   _id: null,
        //   authUserId: this.authSrv.acsData.userId,
        //   fechaCarga: null,
        //   nomArchivoOrg: null,
        //   intentos: 0,
        //   estatus: 'pendiente',
        //   genFileName: null,
        //   fileId: null,
        //   periodo: this.periodoCarga.periodo,
        //   isActive: true
        // };
      }

      this.periodoCarga.carga.fechaCarga = result.loadDate;
      this.periodoCarga.carga.nomArchivoOrg = result.orgFileName;
      this.periodoCarga.carga.genFileName = result.getFileName;
      this.periodoCarga.carga.fileId = result.getFileName.split('.')[0];
      this.periodoCarga.carga.estatus = 'cargando';
      this.periodoCarga.carga.entfed = {  
        cve: this.userSrv.userData.entFed.cve,
        cveStr: this.userSrv.userData.entFed.cveStr,
        nom: this.userSrv.userData.entFed.nom,
        tipo: this.userSrv.userData.entFed.tipo,
      };
      this.periodoCarga.carga.org = this.userSrv.userData.org;

      // throw new Error('test');

      // TODO: Guardar información de carga al servidor
      const resp: any = await this.cargaSrv.updateCarga(this.periodoCarga.carga);
      this.periodoCarga.carga = resp;

      // TODO: Ejecutar JOB en el servidor
      // const registro = this.cargaSrv.registrarTask(this.periodoCarga.carga._id);
    } catch (e) {
      this.log.show(e);

      // TODO: Regresar al estado de pendiente
      this.setDefaultCargaInfo();
      this.loadExcel.resetToDefault();
      this.showNetworkError = 1;
    }
  }

  goBack() {
    this.router.navigate(['carga-archivo']);
  }

  async onDownloadComp() {
    // const urlReporte = this.cargaSrv.getDownloadFileLink(this.periodoCarga.carga.fileId);
    // if (urlReporte) {
    //   window.open(urlReporte);
    // } else {
    //   alert("Error al obtener el reporte");
    // }

    this.cargaSrv.downloadFile(this.periodoCarga.carga.fileId).subscribe(response => {
      this.log.show(response);
      let blob:any = response;//new Blob(response, { type: 'text/json; charset=utf-8' });
      const url= window.URL.createObjectURL(blob);
      //window.open(url);
      // window.location.href = response.url;
      fileSaver.saveAs(blob, `${this.periodoCarga.carga.fileId}.pdf`);
    }), error => console.log('Error downloading the file'),
      () => console.info('File downloaded successfully');
  }

  async onDownloadCompWsCarga() {
    const newFileName = this.periodoCarga.carga.wscarga.comprobante.split('.')[0]
    this.cargaSrv.downloadFile(newFileName).subscribe(response => {
      this.log.show(response);
      let blob:any = response;//new Blob(response, { type: 'text/json; charset=utf-8' });
      const url= window.URL.createObjectURL(blob);
      //window.open(url);
      // window.location.href = response.url;
      fileSaver.saveAs(blob, `${this.periodoCarga.carga.fileId}.pdf`);
    }), error => console.log('Error downloading the file'),
      () => console.info('File downloaded successfully');
  }

  setDefaultCargaInfo() {
    this.periodoCarga.carga = {
      _id: null,
      authUserId: this.authSrv.acsData.userId,
      fechaCarga: null,
      nomArchivoOrg: null,
      intentos: 0,
      estatus: 'pendiente',
      genFileName: null,
      fileId: null,
      periodo: this.periodoCarga.periodo,
      isActive: true
    };
    this.estatusCarga = 0;
  }

  // SAFE ATTRIBUTES  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  get weekLabel(): string {
    // this.log.show('weekLabel >>>>>>>>>>>>>>>>>');
    // this.log.show(this.periodoCarga);
    const data = this._.get(this.periodoCarga, 'periodo.weekLabel', null);
    return !this._.isNil(data) ? data : '-';
  }

  get safeYear(): string {
    // this.log.show('safeYear >>>>>>>>>>>>>>>>>');
    // this.log.show(this.periodoCarga);
    const data = this._.get(this.periodoCarga, 'periodo.year', null);
    return !this._.isNil(data) ? data : '-';
  }

  get start(): string {
    // this.log.show('start >>>>>>>>>>>>>>>>>');
    // this.log.show(this.periodoCarga);
    const data = this._.get(this.periodoCarga, 'periodo.start', null);
    return !this._.isNil(data) ? data : new Date();
  }

  get end(): string {
    // this.log.show('end >>>>>>>>>>>>>>>>>');
    // this.log.show(this.periodoCarga);
    const data = this._.get(this.periodoCarga, 'periodo.end', null);
    return !this._.isNil(data) ? data : new Date();
  }

  get processStatus(): string {
    // this.log.show('end >>>>>>>>>>>>>>>>>');
    // this.log.show(this.periodoCarga);

    // this.log.show('processStatus > > > > > > > > > > > > > > > > > > > > > > > > >');
    // this.log.show(this.periodoCarga);
    const data = this._.get(this.periodoCarga, 'carga.estatus', 'pendiente');
    // this.log.show(data);
    return data;
  }

  get ws_fechaCarga(): Date {
    return this._.get(this.periodoCarga, 'carga.wscarga.fechaFin', null);
  }

  get ws_registros(): Date {
    return this._.get(this.periodoCarga, 'carga.wscarga.registros', null);
  }

  get ws_calificacion(): Date {
    return this._.get(this.periodoCarga, 'carga.wscarga.calificacion', null);
  }

  get ws_comprobante(): Date {
    return this._.get(this.periodoCarga, 'carga.wscarga.comprobante', null);
  }

  get canLoadFile(): boolean {
    const data = this._.get(this.periodoCarga, 'periodo.end', null);
    const curDate = new Date();
    // this.log.show(new Date(data));
    // this.log.show(curDate);
    // this.log.show(new Date(data) <= curDate);
    if (!this._.isNil(data)) {
      return (new Date(data) <= curDate);
    } else {
      return false;
    }
  }
  
}
