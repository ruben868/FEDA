import {PeriodoModel} from './periodo-model';
import {OrgModel} from './org-model';
/*
authUserId: { type: Schema.ObjectId },
  fechaCarga: { type: Date },
  nomArchivoOrg: { type: String },
  intentos: { type: Number },
  estatus: { type: String },
  periodo: { type: Periods.schema  },
  genFileName: { type: String },
  fileId: { type: String },
  isActive: { type: Boolean },

  entfed: {
    cve: { type: String },
    tipo: { type: String },
  },

  proceso: {
    registros: { type: Number },
    calificacion: { type: Number },
    suministro: { type: Number },
    oportunidad: { type: Number },
    integridad: { type: Number },
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
  },
  wscarga: {
    registros: { type: Number },
    calificacion: { type: Number },
    suministro: { type: Number },
    oportunidad: { type: Number },
    integridad: { type: Number },
    fechaFin: { type: Date },
    numprocs: { type: Number },
    stat: { type: Number }, // 1: OK, 2: ERROR
  },
 */
export interface CargaModel {
  _id?: string;
  authUserId?: string;
  fechaCarga?: Date;
  nomArchivoOrg?: string;
  intentos?: number;
  estatus?: string;
  genFileName?: string;
  fileId?: string;
  periodo?: PeriodoModel;
  isActive?: boolean;

  org?: OrgModel;

  entfed?: {
    cve: number;
    cveStr: string;
    nom: string;
    tipo: string;
  };

  proceso?: {
    registros: number;
    calificacion: number;
    suministro: number;
    oportunidad: number;
    integridad: number;
    fechaFin: Date;
  };

  wscarga?: {
    registros: number;
    calificacion: number;
    suministro: number;
    oportunidad: number;
    integridad: number;
    fechaFin: Date;
    numprocs: number;
    stat: number;
    comprobante: string;
  };
}
