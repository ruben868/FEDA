import {Component, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SideNavService} from '../../side-nav/side-nav.service';
import {PeriodoModel} from '../../../models/periodo-model';
import {LogServiceService} from '../../../services/log-service.service';
import { FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DateUtilService } from 'src/app/services/date-util.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { ValueGetterParams } from 'ag-grid-community/dist/lib/entities/colDef';
import * as moment from 'moment';
import * as _ from 'lodash';
import {Subscription} from 'rxjs';
import { StdGrid2Component } from '../../shared/std-grid2/std-grid2.component';
import { FileService } from './file.service';

@Component({
  selector: 'app-fila-busqueda',
  templateUrl: './fila-busqueda.component.html',
  styleUrls: ['./fila-busqueda.component.scss']
})
export class FilaBusquedaComponent implements OnInit, OnDestroy {

  ent: any;

  @ViewChild(StdGrid2Component, {static: false})
  private stdGrid: StdGrid2Component;

  SNACKBAR_STD_DURATION = 3500;
  refreshActive = false;

  private subs: Subscription = new Subscription();
  // Std Grid fields -----------------------------------------
  sourceData = [];
  colDefs = [
      { headerName: 'ID', valueGetter: (args) => this._getIdValue(args), width: 100 },
      {headerName: 'Usuario', field: '_id.correo', width: 200},
      {headerName: 'Nombre de Usuario', field: '_id.nomComp', width: 200},
      {headerName: 'Código Entidad', field: '_id.Clave', width: 200},
      {headerName: 'Entidad', field: '_id.Entidad', width: 250},
      {headerName: 'Institución', field: '_id.Organizacion', width: 300},
      {headerName: 'Resultados con Exito', field: 'coincidencias', width: 250},
      {headerName: '% con Exito', field: 'coincidencias_porcentaje', width: 250},
      {headerName: 'Resultados sin Exito', field: 'nocoincidencias', width: 250},
      {headerName: '% sin Exito', field: 'nocoincidencias_porcentaje', width: 250},
      {headerName: 'Total', field: 'total', width: 100},
  ];
  stdColConfig = {

  };
  
  constructor( 
    private router: Router,
    private snackBar: MatSnackBar,
    private fileService: FileService
    )
  {
      
  }

  ngOnInit() {
    // this.tipo = this.service.getUser().tipo.cve
    // console.log(this.tipo);
    // this.personalSrv.getPersonal(this.tipo).then( (data: any) => {
    //   this.stdGrid.setNewData(data);
    //   console.log(data);
    // });


    this.fileService.getAllUsuarios().then( (data: any) => {
      this.stdGrid.setNewData(data);
      console.log('GRIIIID');
      console.log(data);
    });

  }

    _getIdValue(args: ValueGetterParams): any {
    return (Number(args.node.id)) + 1;
  }


    ngOnDestroy(): void {
      if (this.subs) {
        this.subs.unsubscribe();
      }
    }

    showMsg(msg: string) {
      this.snackBar.open(msg, 'cerrar',{
        duration: this.SNACKBAR_STD_DURATION
      });
    }

}
