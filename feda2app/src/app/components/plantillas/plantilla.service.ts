import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LogServiceService} from '../../services/log-service.service';

@Injectable({
  providedIn: 'root'
})
export class PlantillaService {
  apiUri = environment.APIEndpoint;

  constructor(
    private http: HttpClient,
    private log: LogServiceService
  ) { }

  async getAllPlantilla() {
    const url = `${this.apiUri}/cargas/plantilla/getAll`;
    try {
      const response = await this.http.get(url).toPromise();
      return response;
    } catch (e) {
      this.log.show('Error: plantilla.service.ts --> getAllPlantilla');
      this.log.show(e);
    }
    return null;
  }
}
