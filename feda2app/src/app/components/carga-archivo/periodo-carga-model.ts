import {PeriodoModel} from '../../models/periodo-model';
import {CargaModel} from '../../models/carga-model';


export interface PeriodoCargaModel {
  periodo?: PeriodoModel;
  carga?: CargaModel;
}
