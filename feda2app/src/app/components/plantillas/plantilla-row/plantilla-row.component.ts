import {Component, Input, OnInit} from '@angular/core';
import {PlantillaModel} from '../../../models/plantilla-model';
import {CargaArchivoService} from '../../carga-archivo/carga-archivo.service';
import * as fileSaver from 'file-saver';
import {LogServiceService} from '../../../services/log-service.service';

@Component({
  selector: 'app-plantilla-row',
  templateUrl: './plantilla-row.component.html',
  styleUrls: ['./plantilla-row.component.scss']
})
export class PlantillaRowComponent implements OnInit {

  @Input() plantilla: PlantillaModel;

  constructor(
    private cargaSrv: CargaArchivoService,
    private log: LogServiceService
  ) { }

  ngOnInit() {
  }

  onDescargarArchivo() {
    const fileName = this.plantilla.archivo;
    this.cargaSrv.downloadFilePlantilla(fileName).subscribe(response => {
      this.log.show(response);
      let blob: any = response;//new Blob(response, { type: 'text/json; charset=utf-8' });
      const url= window.URL.createObjectURL(blob);
      //window.open(url);
      // window.location.href = response.url;
      fileSaver.saveAs(blob, fileName);
    }), error => console.log('Error downloading the file'),
      () => console.info('File downloaded successfully');
  }
}
