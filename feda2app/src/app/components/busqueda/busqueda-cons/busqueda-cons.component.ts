import {Component, ViewChild, OnDestroy, OnInit, Output} from '@angular/core';
import {SideNavService} from '../../side-nav/side-nav.service';
import {PeriodoModel} from '../../../models/periodo-model';
import {LogServiceService} from '../../../services/log-service.service';
import { FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BusquedaArchivoService } from './busqueda-archivo.service';
import { DateUtilService } from 'src/app/services/date-util.service';
import { BusquedaModel } from '../../../models/busqueda-model';
// import { FileBusquedaModel } from '../../../models/file-busqueda-model';
import * as _ from 'lodash';
import {MatSnackBar, MatDialog} from '@angular/material';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { StdGrid2Component } from '../../shared/std-grid2/std-grid2.component';
import { ExcelService } from '../../../services/excel.service';
import { UserService } from '../../../services/user.service';
import {Subscription} from 'rxjs';
import { FileService } from '../fila-busqueda/file.service';
import { isNull } from '@angular/compiler/src/output/output_ast';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-busqueda-cons',
  templateUrl: './busqueda-cons.component.html',
  styleUrls: ['./busqueda-cons.component.scss']
})
export class BusquedaConsComponent implements OnInit, OnDestroy {
  @ViewChild('groupForm', { static: false }) public form: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  SNACKBAR_STD_DURATION = 3500;

  refreshButtonDisabled = false;
  finder = false;
  find = false;
  usr;
  public load: Boolean = false;
  // mostrar = false;
  invertalId = 0;
  ocultar1: boolean = false;
  gridApi: any;
  total: any = 0;

  accion1() {        
    this.ocultar1 = !this.ocultar1;
    this.checkActiveButton();
  }

  checkActiveButton() {

    if ( this.ocultar1 ) {
      this.ocultar1 = true;
    }
    else if ( !this.ocultar1 ) {
      this.ocultar1 = false;
    }
  }
  

  // busqu: BusquedaModel = new BusquedaModel();
  busqu = { busqueda: '', infoUser: null, fechaconsulta: new Date(), encontrados: 0};
  consulta: any;

  

  public errorMsg = '';

  data: any;

  public id: string;
  TELEFONO: string;

  handleSearch(value: string) {
    this.filtro_valor = value
  }

  filtro_valor = ''
  _id;

  private subs: Subscription = new Subscription();

  constructor(
    private sideNavSrv: SideNavService,
    public dateSrv: DateUtilService,
    private log: LogServiceService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private busque: BusquedaArchivoService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private usrService: UserService,
    private filaService: FileService,
  ) { 
    //agrupar información de usuario logueado con la busqueda realizada  
    console.log("constructor * * * * * * * * ** * * * * * * * * ");
    setTimeout( ()=> { 
      console.log(this.usrService.userData);

      if (this.usrService.userData) {
        // SI HAY DATOS
        this.setUserData(this.usrService);
      } else {
        // no hay datos y hay que inscribirse al evento
        this.subs.add(
          this.usrService.updateUserInfoEvent$.subscribe((data) => {
            
            this.setUserData(data);
            console.log("SUBS * * * * * * * * * * * * * * * * * * * * * * * * * ");
            console.log(this.busqu.infoUser);
  
            }
          ));
      }

      console.log("DATO LOCAL DE USER * * * * * * * * * * * * * * * * * * * * * * * * * ");
      console.log(this.busqu.infoUser);
    }, 1000);
  }

  //Asignar los datos de usuario a variable
  private setUserData(data) {
    this.busqu.infoUser = {};
    this.busqu.infoUser["appat"] = data.userData.authInfo["appat"];
    this.busqu.infoUser["apmat"] = data.userData.authInfo["apmat"];
    this.busqu.infoUser["nom"] = data.userData.authInfo["nom"];
    this.busqu.infoUser["mail"] = data.userData.authInfo["mail"];
    this.busqu.infoUser["entFed"] = {};
    this.busqu.infoUser["entFed"]["cve"] = data.userData.entFed["cve"];
    this.busqu.infoUser["entFed"]["cveStr"] = data.userData.entFed["cveStr"];
    this.busqu.infoUser["entFed"]["nom"] = data.userData.entFed["nom"];
    this.busqu.infoUser["org"] = {};
    this.busqu.infoUser["org"]["cveStr"] = data.userData.org["cveStr"];
    this.busqu.infoUser["org"]["nom"] = data.userData.org["nom"];
    this.busqu.fechaconsulta = this.busqu.fechaconsulta;
  }

    // Grid Acciones Integrantes=======================================================================
    @ViewChild('gridIntes', { static: false }) public gridIntes: StdGrid2Component;
    
    gridIntesColConfig = {

    };
    gridIntesColDefs = [
      { headerName: 'Teléfono', field: 'TELEFONO', width: 100, resizable: true },
      { headerName: 'Tipo Teléfono', field: 'DES_TIPO_TELEFONO', width: 150 },
      { headerName: 'Identidad', field: 'DES_IDENTIDAD', width: 170, resizable: true },
      { headerName: 'Entidad donde ocurrio Extorsión', field: 'DES_ENT', width: 150, resizable: true },
      { headerName: 'Municipio donde ocurrio Extorsión', field: 'DES_MUN', width: 150, resizable: true },
      { headerName: 'Extorsión', field: 'DES_TIPO_EXTORSION', width: 250, resizable: true },
      {headerName: 'Fecha y Hora de Extorsión', width: 200 , field: 'FECHA_EXTORSION', cellRenderer: (data) => {
        if (!_.isNil(data) && !_.isNil(data.value)) {
          const ret: string = moment(data.value).format('DD/MM/YYYY HH:mm');
          return ret;
        } else {
          return '';
        }
      }
    },
      { headerName: 'Relato de los Hechos', field: 'RELATO_HECHOS', width: 1000, resizable: true },
      { headerName: 'Sexo de la persona que recibio la Extorsión', field: 'DES_SEXO', width: 150 },
      { headerName: 'Edad', field: 'EDAD', width: 100 },
      { headerName: 'Entró Bien', field: 'DES_BIEN_ENTREGADO', width: 200 },
      { headerName: 'Banco', field: 'BANCO', with: 250, resizable: true, cellRenderer: (params) => {
          if (params.value) {
            return params.value
          } else {
            return 'No se Registraron Datos'
          }
        }
      },
      { headerName: 'Nº de Cuenta', field: 'NO_CUENTA', with: 250, resizable: true, cellRenderer: (params) => {
        if (params.value) {
          return params.value
        } else {
          return 'No se Registraron Datos'
        }
      }
    },
    { headerName: 'Monto Entregado', field: 'VALOR_BIEN', with: 250, resizable: true, cellRenderer: (params) => {
      if (params.value) {
        return params.value
      } else {
        return 'No se Registraron Datos'
      }
    }
  },
      { headerName: 'Descripción Denunciante', field: 'DES_DENUNCIANTE', width: 200, resizable: true  },
      { headerName: 'Institución', field: 'DES_INSTITUCION', width: 200 },
      { headerName: 'Folio Interno', field: 'FOLIO_INTERNO', width: 150, resizable: true  },
      {headerName: 'Fecha y Hora de Denuncia', width: 250 , field: 'FECHA_DENUNCIA', cellRenderer: (data) => {
        if (!_.isNil(data) && !_.isNil(data.value)) {
          const ret: string = moment(data.value).format('DD/MM/YYYY HH:mm');
          return ret;
        } else {
          return '';
        }
      }
    },
    // { headerName: 'Identificador', field: 'indicador', width: 100, resizable: true },
    { headerName: 'IFT Tipo', field: 'IFT_TIPO_TELEFONO', width: 100, resizable: true  },
    { headerName: 'Entidad al que pertenece el código del número', field: 'IFT_ENTIDAD', width: 200, resizable: true  },
    { headerName: 'Municipio al que pertenece el código del número', field: 'IFT_MUNICIPIO', width: 200, resizable: true  },
    { headerName: 'Compañia  al que pertenece el código del número', field: 'IFT_CPIA', width: 250, resizable: true  },
    { headerName: 'Entidad Responsable', field: 'ENTIDAD_CARGA', width: 170, resizable: true },
    { headerName: 'Institución Responsable', field: 'INSTITUCION_CARGA', width: 170, resizable: true },
    {headerName: 'Fecha y Hora de Carga', width: 200 , field: 'FECHA_DE_CARGA', cellRenderer: (data) => {
      if (!_.isNil(data) && !_.isNil(data.value)) {
        const ret: string = moment(data.value).format('DD/MM/YYYY HH:mm');
        return ret;
      } else {
        return '';
      }
    }
  },
  { headerName: 'Comprobante', field: 'NOMBRE_COMPROBANTE', width: 200, resizable: true },
    ];

  ngOnInit() {

    console.log("ngOnInit * * * * * * * * * * * * * * * * * * * * * * * * * * * * * ");

  }

  //Se realiza la busqueda
  async busqueda(pageIndex, PageSize) {
    this.finder = true;
    this.find = false;
    this.busqu.encontrados = 0;

    const resp = await this.busque.getAllNumeros(this.busqu, pageIndex, PageSize).subscribe(
      (data: any) => {
        this.finder = false;
        if (data.message) {
          alert(data.message)
        } else {
          this.find = true;
          this.data = data.data;
          this.total=data.total
          console.log(this.total)
          this.busqu.encontrados = this.data.length
          console.log('Service------2');
        }
      }
    );
  }

//   resetpagination(pageIndex, PageSize) {
//     if(this.busqueda(pageIndex, PageSize) ) {
//     }else {
//       this.paginator.firstPage();
//     }
    
// }

  changePage(event) {
    this.busqueda(event.pageIndex, event.pageSize)

  }

  //Se realiza la busqueda
  // async busqueda() {
  //   this.find = false;

  //   const resp = await this.busque.getAllNumeros(this.busqu).subscribe(
  //     (data: any) => {
  //       if (data.message) {
  //         alert(data.message)
  //       } else {
  //         this.find = true;
  //         this.data = data;
  //         this.busqu.encontrados = this.data.length
  //         console.log(this.busqu.encontrados);
  //         console.log('Service');
  //       }
  //     }
  //   );
  // }

  // busqueda() {
  //   this.find = false;

  //   this.subs.add(

  //   this.busque.getAllNumeros(this.busqu).subscribe(
  //     (data: any) => {
  //       console.log('Service');
  //       console.log(data);
  //       if (data.message) {
  //         alert(data.message)
  //       } else {
  //         this.find = true;
  //         this.data = data

  //       }        
  //     }
  //   ));
  // }



  exportAsXLSX() {
    const extorcion = [];

    this.gridApi.forEachNode(function printNode(node, index) {
      console.log(node);
      console.log(extorcion);
      console.log('Excell');
      extorcion.push({
        Teléfono: node.data.TELEFONO, Tipo_Teléfono: node.data.DES_TIPO_TELEFONO

        // Sede: node.data.sede.entidad, Número_de_Acuerdo: node.data.acuerdos.numAcuerdo+' - '+node.data.acuerdos.titulo+' - '+node.data.acuerdos.descipcion, Estatus: node.data.acuerdos.estatus.estatus
       });
    });
    this.excelService.exportAsExcelFile(extorcion, 'Números de Extorción');

  }

//  fullNameGetter(params) {
//     if (!_.isNil(params)) {
//       return "No se Registraron Datos";
//     } else {
//       return params.data.denuncia.BANCO;
//     }
//   }

  search = new FormControl('')

  ngOnDestroy(): void {
    clearInterval(this.invertalId);


  }

  transformData (value) {

   let array = []
    let telefono = []
    let ift_telefono = []
    let ift_entidad = []
    let ift_municipio  = []
    let ift_cpia = []
    let banco = []
    let no_cuenta = []
    let valor_bien = []
    
    // Recorrer elemento que contiene un arreglo dentro de otro arreglo
    value.Denuncia.NUMS_INFO.forEach(element => {
      telefono.push(element.TELEFONO)
    });

    value.Denuncia.NUMS_INFO.forEach(element => {
      ift_telefono.push(element.IFT_TIPO_TELEFONO)
    });

    value.Denuncia.NUMS_INFO.forEach(element => {
      ift_entidad.push(element.IFT_ENTIDAD)
    });

    value.Denuncia.NUMS_INFO.forEach(element => {
      ift_municipio.push(element.IFT_MUNICIPIO)
    });

    value.Denuncia.NUMS_INFO.forEach(element => {
      ift_cpia.push(element.IFT_CPIA)
    });

    value.Denuncia.BANCO.forEach(element => {
      banco.push(element)
    });

    value.Denuncia.NO_CUENTA.forEach(element => {
      no_cuenta.push(element)
    });

    value.Denuncia.VALOR_BIEN.forEach(element => {
      valor_bien.push(element)
    });
      // Agregar info a Grid que contiene objetos y arreglos
      array.push({
        TELEFONO: telefono.join(', '),
        DES_TIPO_TELEFONO: value.Denuncia.DES_TIPO_TELEFONO,
        DES_IDENTIDAD: value.Denuncia.DES_IDENTIDAD,
        DES_ENT: value.Denuncia.DES_ENT,
        DES_MUN: value.Denuncia.DES_MUN,
        DES_TIPO_EXTORSION: value.Denuncia.DES_TIPO_EXTORSION,
        FECHA_EXTORSION: value.Denuncia.FECHA_EXTORSION,
        RELATO_HECHOS: value.Denuncia.RELATO_HECHOS,
        DES_SEXO: value.Denuncia.DES_SEXO,
        EDAD: value.Denuncia.EDAD,
        DES_BIEN_ENTREGADO: value.Denuncia.DES_BIEN_ENTREGADO,
        BANCO: banco.join(', '),
        NO_CUENTA: no_cuenta.join(', '),
        VALOR_BIEN: valor_bien.join(', '),
        // BANCO: value.Denuncia.BANCO[0],
        // NO_CUENTA: value.Denuncia.NO_CUENTA[0],
        // VALOR_BIEN: value.Denuncia.VALOR_BIEN[0],
        DES_DENUNCIANTE: value.Denuncia.DES_DENUNCIANTE,
        DES_INSTITUCION: value.Denuncia.DES_INSTITUCION,
        FOLIO_INTERNO: value.Denuncia.FOLIO_INTERNO,
        FECHA_DENUNCIA: value.Denuncia.FECHA_DENUNCIA,
        indicador: value.Denuncia.indicador,
        IFT_TIPO_TELEFONO: ift_telefono.join(', '),
        IFT_ENTIDAD: ift_entidad.join(', '),
        IFT_MUNICIPIO: ift_municipio.join(', '),
        IFT_CPIA: ift_cpia.join(', '),
        ENTIDAD_CARGA: value.Denuncia.ENTIDAD_CARGA,
        INSTITUCION_CARGA: value.Denuncia.INSTITUCION_CARGA,
        FECHA_DE_CARGA: value.Denuncia.FECHA_DE_CARGA,
        NOMBRE_COMPROBANTE: value.Denuncia.NOMBRE_COMPROBANTE,
      })
    
     return array
  }

  async onActualizar() {
    this.refreshButtonDisabled = true;
    try {
      await this.initAsync();
    } catch (e) {
      this.log.show(e);
    }
    // await this.busque.wait(2000);
    this.refreshButtonDisabled = false;
  }

async initAsync() {
  

}

@Output('search') searchEmitter = new EventEmitter<string>();

  // Snackbar methods ------------------------------------
  showMsg(msg: string) {
    this.snackBar.open(msg, 'cerrar',{
      duration: this.SNACKBAR_STD_DURATION
    });
  }

}
