import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyLodash {

  constructor() { }

  isNil(data: any): boolean {
    return (data == null) || (data === undefined);
  }

  isNilOrEmpty(data: any): boolean {
    const res = this.isNil(data);
    let stringEmpty = false;
    if ( typeof data === 'string') {
      stringEmpty = (data === '');
    }
    return res && stringEmpty;
  }

  get(obj, path, defaultValue): any {
    try {
      const travel = regexp =>
        String.prototype.split
          .call(path, regexp)
          .filter(Boolean)
          .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
      const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
      return result === undefined || result === obj ? defaultValue : result;
    } catch (e) {
      // ERROR
    }
    return defaultValue;
  }
}
