/* xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */
import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';
import {ClientFileValidationResultModel, FileValidationResult} from '../../../models/client-file-validation-result-model';
import {LogServiceService} from '../../../services/log-service.service';
import {CargaArchivoService} from '../carga-archivo.service';
import {UserService} from '../../../services/user.service';
import {FileInfoModel} from '../../../models/file-info.model';
import {PeriodoCargaModel} from '../periodo-carga-model';
import {LoadExcelExtResultModel} from './load-excel-ext-result-model';

type AOA = any[][];

@Component({
  selector: 'load-excel-ext',
  templateUrl: './load-excel-ext.component.html',
  styleUrls: ['./load-excel-ext.component.scss']
})

export class LoadExcelExtComponent {

  @ViewChild('loadFile', {static: false}) fileInputEl: ElementRef;

  constructor(
    private log: LogServiceService,
    private cargaSrv: CargaArchivoService,
    private userSrv: UserService
  ) {
  }


  @Input() periodoCarga: PeriodoCargaModel;
  @Output() estadoCarga = new EventEmitter<number>();
  @Output() fileInfo = new EventEmitter<LoadExcelExtResultModel>();

  result: LoadExcelExtResultModel = {};

  estatusCarga = 0; // 0: Pendiente; 1: Cargando; 2: Carga Finalizada

  validation = 0;

  fileSpec = {
    sheetName: 'extorsiones',
    rowStart: 1,
    colStart: 1,
    columns: [
      {
        colName: 'TELEFONO'
      },
      {
        colName: 'COD_TIPO_TELEFONO'
      },
      {
        colName: 'COD_MEDIO'
      },
      {
        colName: 'MEDIO_OTRO'
      },
      {
        colName: 'COD_IDENTIDAD'
      },
      {
        colName: 'IDENTIDAD_OTRO'
      },
      {
        colName: 'COD_ENT'
      },
      {
        colName: 'COD_MUN'
      },
      {
        colName: 'COD_TIPO_EXTORSION'
      },
      {
        colName: 'TIPO_EXTORSION_OTRO'
      },
      {
        colName: 'DIA_EXTORSION'
      },
      {
        colName: 'MES_EXTORSION'
      },
      {
        colName: 'ANIO_EXTORSION'
      },
      {
        colName: 'HORA_EXTORSION'
      },
      {
        colName: 'MINUTO_EXTORSION'
      },
      {
        colName: 'RELATO_HECHOS'
      },
      {
        colName: 'EDAD'
      },
      {
        colName: 'COD_SEXO'
      },
      {
        colName: 'COD_BIEN_ENTREGADO'
      },
      {
        colName: 'BIEN_ENTREGADO_DES'
      },
      {
        colName: 'VALOR_BIEN'
      },
      {
        colName: 'BANCO'
      },
      {
        colName: 'NO_CUENTA'
      },
      {
        colName: 'COD_DENUNCIANTE'
      },
      {
        colName: 'COD_INSTITUCION'
      },
      {
        colName: 'FOLIO_INTERNO'
      },
      {
        colName: 'DIA_DENUNCIA'
      },
      {
        colName: 'MES_DENUNCIA'
      },
      {
        colName: 'ANIO_DENUNCIA'
      },
      {
        colName: 'HORA_DENUNCIA'
      },
      {
        colName: 'MINUTO_DENUNCIA'
      },
    ]
  };

  validationLog: Array<ClientFileValidationResultModel> = [];

  data: AOA = [ [1, 2], [3, 4] ];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';

  onFileChange(evt: any) {
    this.log.show('onFileChange - - - - - - - - - - - - - - - - - - - - - - - - - - - -  -');
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    this.log.show(evt);

    const reader: FileReader = new FileReader();
    let fileSize = 0;
    let fileBlob;

    reader.onload = async (e: any) => {
      this.log.show('onload - - - - - - - - - - - - - - - - - - - - - - - - - - - -  -');
      this.result.loadDate = new Date();
      this.result.orgFileName = fileBlob.name;
      this.estadoCarga.emit(1);
      const bstr: string = e.target.result;

      const chunkBlob = fileBlob.slice(0, 1);
      const ab = await chunkBlob.arrayBuffer();
      this.log.show(ab);
      const valRes: ValidationResult = await this.validateFile(bstr, fileBlob);
      // this.log.show('Validate File Result');
      // this.log.show(valRes);
      this.validationLog = valRes.log;
      this.validation = (valRes.status) ? 1 : 2;

      // this.estadoCarga.emit(0);



      if (valRes.status) {
        this.log.show('Validate File Result True');
        const entidad = this.userSrv.userData.entFed.cve;
        const orgCveStr = this.userSrv.userData.org.cveStr;
        const evalua = this.userSrv.userData.org.eval;

        try {
          this.result.getFileName = this.cargaSrv.createFileName(entidad, this.result.loadDate, this.periodoCarga, orgCveStr, evalua);
          this.log.sStr('carga-archivo-edit', 'onload', 'init >>>>>');

          // Establecer información del archivo
          this.periodoCarga.carga.fechaCarga = this.result.loadDate;
          this.periodoCarga.carga.nomArchivoOrg = this.result.orgFileName;
          this.periodoCarga.carga.genFileName = this.result.getFileName;
          this.periodoCarga.carga.fileId = this.result.getFileName.split('.')[0];
          // this.periodoCarga.carga.estatus = 'cargando';

          const cargaStat = await this.cargaSrv.loadFileNode(fileBlob, this.result.getFileName, this.periodoCarga);
          
          //const cargaStat = await this.cargaSrv.loadFile(fileBlob, this.result.getFileName);
          this.log.show(cargaStat);

          this.log.sStr('carga-archivo-edit', 'onload', 'end >>>>>');
          if (!cargaStat.hasError) {
            this.estadoCarga.emit(2);
            this.fileInfo.emit(cargaStat.procesoCarga);
          } else {
            this.estadoCarga.emit(0);
          }

        } catch (e) {
          this.estadoCarga.emit(0);
        }
      } else {
        this.log.show('Validate File Result False');
        this.estadoCarga.emit(0);
      }

      this.fileInputEl.nativeElement.value  = null;
    };

    fileSize = target.files[0].size;
    fileBlob = target.files[0];
    reader.readAsBinaryString(target.files[0]);
  }

  async validateFile(bstr: string, blob: any) {
    let valResult: ValidationResult = {
      status: true,
      log: new Array<ClientFileValidationResultModel>()
    };

    try {
      this.log.sStr('load-excel-ext', 'validateFile', 'init function >>>>');

      valResult = await this.validateFileVersion(blob, valResult);

      if (valResult.status) {
        valResult = this.validateSheetName(this.fileSpec, bstr, valResult);
      }

      if (valResult.status) {
        valResult = this.validateColumns(this.fileSpec, bstr, valResult);
      }

      if (valResult.status) {
        valResult = this.validateHasData(this.fileSpec, bstr, valResult);
      }

      // valResult.status = (valSheetName.status && valColsName.status && valData.status);
      // valResult.log = valSheetName.log.concat(valData.log, valColsName.log);
    } catch (e) {
      valResult.status = false;
      // throw e;
    }
    return valResult;
  }

  async validateFileVersion(fileBlob: any, valResult: ValidationResult) {
    const chunkBlob = fileBlob.slice(0, 5);
    const ab = await chunkBlob.arrayBuffer();
    this.log.show(ab);
    this.log.show(new Int8Array(ab));
    const newArr = new Int8Array(ab);


    if (newArr[0] !== 80) {
      valResult.status = false;
      valResult.log.push({
        validationType: 'Versión de Excel',
        validationResult: FileValidationResult.Failed,
        expedtedValue: 'Versión xlsx',
        foundValue: 'Otra versión',
        msg: 'El archivo no es una versión xlsx',
      });
    }

    return valResult;
  }

  // Validate excel for extorsiones
  validateSheetName(fileSpecs: any, bstr: string, valResult: ValidationResult) {
    let sheetFound = false;
    let tmpLog = {
      validationType: 'Nombre de la Hoja',
      validationResult: FileValidationResult.Failed,
      expedtedValue: fileSpecs.sheetName,
      msg: 'No se encontró la hoja "extorsiones" necesaria para la carga del archivo'
    };

    try {
      // const wbOnlySheetNames: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary', bookSheets: true});
      // const wbOnlySheetNames: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});
      const wbOnlySheetNames: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary', sheets: [fileSpecs.sheetName], sheetRows: 5});
      this.log.show(wbOnlySheetNames.Props);

      // Validar nombre de la hoja

      for (let i = 0; i < wbOnlySheetNames.SheetNames.length; i++) {
        if (fileSpecs.sheetName === wbOnlySheetNames.SheetNames[i]) {
          sheetFound = true;
          break;
        }
      }

      if (!sheetFound) {
        valResult.log.push(tmpLog);
        this.log.sStr('load-excel-ext', 'validateExcelFile', 'Nombre de hoja no encontrado');
      }
      // else {
      //   tmpLog.validationResult = FileValidationResult.Pass;
      //   tmpLog.msg = 'Hoja ' + fileSpecs.sheetName + ' encontrada';
      //   valResult.status = true;
      //   valResult.log.push(tmpLog);
      // }

    } catch (e) {
      valResult.log.push(tmpLog);
    }

    return valResult;
  }

  //
  validateColumns(fileSpecs: any, bstr: string, valResult: ValidationResult) {
    // const valResult: ValidationResult = {
    //   status: true,
    //   log: new Array<ClientFileValidationResultModel>(),
    // };

    if (valResult.status) {
      const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary', sheets: [fileSpecs.sheetName], sheetRows: 5});
      const sheet: XLSX.Sheet = wb.Sheets[fileSpecs.sheetName];

      let allColsValStat = true;
      let colStart = fileSpecs.colStart;
      let rowStart = fileSpecs.rowStart;
      let tmpColName = '';
      let tmpValMsg: any;
      let tmpCol: any;
      let tmpVal;
      for (let i = 0; i < fileSpecs.columns.length; i++) {
        tmpValMsg = {};

        tmpCol = fileSpecs.columns[i];
        tmpColName = this.converColNumTOColName(colStart + i);
        this.log.show(tmpColName);

        try {
          tmpVal = sheet[tmpColName + rowStart].v;
          tmpValMsg.validationType = 'Nombre de columna: ' + tmpCol.colName;
          tmpValMsg.expedtedValue = tmpCol.colName;

          if (tmpVal !== tmpCol.colName) {
            tmpValMsg.validationResult = FileValidationResult.Failed;
            tmpValMsg.msg = 'El nombre de la columna en la celda ' + tmpColName + ' es incorreta';
            valResult.status = false;
            valResult.log.push(tmpValMsg);
          }

          // if (tmpVal === tmpCol.colName) {
          //   tmpValMsg.validationResult = FileValidationResult.Pass;
          //   tmpValMsg.msg = 'Nombre de columna correcta';
          // } else {
          //   tmpValMsg.validationResult = FileValidationResult.Failed;
          //   tmpValMsg.msg = 'El nombre de la columna en la celda ' + tmpColName + ' es incorreta';
          //   valResult.status = false;
          // }
        } catch (e) {
          valResult.status = false;
        }
      }
    }

    return valResult;
  }

  //
  validateHasData(fileSpecs: any, bstr: string, valResult: ValidationResult) {
    // const valResult: ValidationResult = {
    //   status: true,
    //   log: new Array<ClientFileValidationResultModel>(),
    // };

    let tmpLog: ClientFileValidationResultModel = {
      validationType: 'Contiene datos',
      validationResult: FileValidationResult.Pass,
      expedtedValue: 'El archivo contiene datos',
      msg: 'El archivo contiene datos'
    };

    if (valResult.status) {
      try {
        const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary', sheets: [fileSpecs.sheetName], sheetRows: 5});
        const sheet: XLSX.Sheet = wb.Sheets[fileSpecs.sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        if (data.length <= 0) {
          tmpLog.validationResult = FileValidationResult.Failed;
          tmpLog.msg = 'No contiene datos';
          valResult.log.push(tmpLog);
          valResult.status = false;
        }
        // else {
        //   valResult.status = true;
        //   valResult.log.push(tmpLog);
        // }
      } catch (e) {
        tmpLog.validationResult = FileValidationResult.Failed;
        tmpLog.msg = 'No contiene datos';
        valResult.status = false;
        valResult.log.push(tmpLog);
      }
    }

    return valResult;
  }

  converColNumTOColName(colNum: number) {
    let dividend = colNum;
    let colName = '';
    let modulo;

    while (dividend > 0)
    {
      modulo = Math.trunc((dividend - 1) % 26) ;
      // this.log.show(modulo);
      colName = String.fromCharCode(65 + modulo) + colName;
      dividend = Math.trunc(((dividend - modulo) / 26)) ;
    }

    return colName;
  }

  export(): void {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  resetToDefault() {
    this.validation = 0;
    this.validationLog = [];
  }
}

export interface ValidationResult {
  status: boolean;
  log: Array<ClientFileValidationResultModel>;
}
