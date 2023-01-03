import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogServiceService {
  logEnabled = environment.logEnabled;

  constructor() { }

  show(data: any) {
    if (this.logEnabled) {
      console.log(data);
    }
  }

  sStr(module: string, submodule: string, data: string) {
    if (this.logEnabled) {
      const logMsg = `[${module}]->[${submodule}] : msg=${data}`;
      console.log(logMsg);
    }
  }
}
