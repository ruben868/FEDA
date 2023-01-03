import {Component, OnDestroy, OnInit} from '@angular/core';
import {SideNavService} from '../../side-nav/side-nav.service';
import {CargaArchivoService} from '../carga-archivo.service';
import {PeriodoCargaModel} from '../periodo-carga-model';
import {PeriodoModel} from '../../../models/periodo-model';
import {LogServiceService} from '../../../services/log-service.service';

@Component({
  selector: 'app-carga-archivo-cons',
  templateUrl: './carga-archivo-cons.component.html',
  styleUrls: ['./carga-archivo-cons.component.scss']
})
export class CargaArchivoConsComponent implements OnInit, OnDestroy {

  refreshButtonDisabled = false;
  periodoCargaList: Array<PeriodoCargaModel>;
  invertalId = 0;

  constructor(
    private sideNavSrv: SideNavService,
    private cargaSrv: CargaArchivoService,
    private log: LogServiceService,
  ) {
    this.sideNavSrv.addEnterEvent('carga');
  }

  ngOnInit() {
    this.initAsync();

    this.invertalId = setInterval(async () => {
      this.log.show("INTERVAL RUNNING!!!!!");
      this.refreshButtonDisabled = true;
      try {
        await this.initAsync();
      } catch (e) {
        this.log.show(e);
      }
      this.refreshButtonDisabled = false;
    }, 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.invertalId);
  }

  async initAsync() {
    const data: any = await this.cargaSrv.allList();

    this.periodoCargaList = [];
    let tmpCarPer: PeriodoCargaModel = {};
    for (const periodo of data.periodos) {
      tmpCarPer = {};
      tmpCarPer.periodo = periodo;

      for (const carga of data.cargas) {
        if (carga.periodo.yearWeek === periodo.yearWeek) {
          tmpCarPer.carga = carga;
          break;
        }
      }

      this.periodoCargaList.push(tmpCarPer);
    }
  }

  async onActualizar() {
    this.refreshButtonDisabled = true;
    try {
      await this.initAsync();
    } catch (e) {
      this.log.show(e);
    }
    await this.cargaSrv.wait(2000);
    this.refreshButtonDisabled = false;
  }
}
