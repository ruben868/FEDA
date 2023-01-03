import {Component, Input, OnInit} from '@angular/core';
import {DateUtilService} from '../../../services/date-util.service';
import {PeriodoCargaModel} from '../periodo-carga-model';
import {Router} from '@angular/router';
import {LogServiceService} from '../../../services/log-service.service';
import {MyLodash} from '../../../services/my-lodash.service';

@Component({
  selector: 'app-fila-carga-pend',
  templateUrl: './fila-carga-pend.component.html',
  styleUrls: ['./fila-carga-pend.component.scss']
})
export class FilaCargaPendComponent implements OnInit {

  @Input() pc: PeriodoCargaModel;


  constructor(
    public dateSrv: DateUtilService,
    private router: Router,
    private log: LogServiceService,
    public _: MyLodash,
  ) { }

  ngOnInit() {
  }

  goToEdit() {
    // this.log.show('goToEdit >>>>>>>>>>>>>>>>>>>>>');
    // this.log.show(this.pc.periodo.yearWeak);
    this.router.navigate(['carga-archivo-edit', this.pc.periodo.yearWeek]);
  }


  get hasFechaCarga() {
    const fechaCarga = this._.get(this.pc, 'carga.fechaCarga', null);
    return this._.isNil(fechaCarga) ? false : true;
  }

  get cargaEstatus() {
    const estatus = this._.get(this.pc, 'carga.estatus', 'pendiente');
    return estatus;
  }

  get cargaDelay() {
    const fechaCarga = this._.get(this.pc, 'carga.estatus', 'pendiente');
    return this._.isNil(fechaCarga) ? false : true;
  }

  get ws_registros() {
    return this._.get(this.pc, 'carga.wscarga.registros', 0);
  }
}
