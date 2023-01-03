import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideNavService {

  // MAIN OBSERVABLE ===========================================================
  private routeEnterEvent = new Subject<any>();
  public routeEnterEvent$ = this.routeEnterEvent.asObservable();

  constructor() { }

  addEnterEvent(data) {
    this.routeEnterEvent.next({
      selected: data
    });
  }
}
