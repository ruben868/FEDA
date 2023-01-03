import { Component, OnInit } from '@angular/core';
import {SideNavService} from '../../side-nav/side-nav.service';
import {PlantillaModel} from '../../../models/plantilla-model';
import {PlantillaService} from '../plantilla.service';

@Component({
  selector: 'app-plantillas-view',
  templateUrl: './plantillas-view.component.html',
  styleUrls: ['./plantillas-view.component.scss']
})
export class PlantillasViewComponent implements OnInit {

  plantillas: Array<PlantillaModel> = [];

  constructor(
    private sideNavSrv: SideNavService,
    private plaSrv: PlantillaService,
  ) {
    this.sideNavSrv.addEnterEvent('plantillas-view');
  }

  ngOnInit() {
    this.initAsync();
  }

  async initAsync() {
    const res: any = await this.plaSrv.getAllPlantilla();
    this.plantillas = res;
  }

  onActualizar() {
    this.initAsync();
  }
}
