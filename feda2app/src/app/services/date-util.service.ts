import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilService {

  constructor() { }

  addDay(date: Date, numOfDays) {
    const tmp = new Date(date);
    tmp.setDate(tmp.getDate() + numOfDays);
    return tmp;
  }

  fd_ddmmyyyy(date) {
    const anio = date.getFullYear();
    const dia = this.right('0' + date.getDate(), 2);
    const mes = this.right('0' + (date.getMonth() + 1), 2);
    const hh = this.right('0' + date.getHours(), 2);
    const mm = this.right('0' + date.getMinutes(), 2);//date.getMinutes();
    const ss = this.right('0' + date.getSeconds(), 2);//date.getSeconds();

    return dia + mes + anio + hh + mm + ss;
    // return dia + mm + anio + '-' + hh + mm + ss;
  }

  right(str: string, len: number) {
    return str.substring(str.length - len, str.length);
  }

  diffInDays(date1: Date, date2: Date) {
    const tmpDate1 = new Date(date1);
    const tmpDate2 = new Date(date2);

    const Difference_In_Time = tmpDate2.getTime() - tmpDate1.getTime();
    const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    return Math.trunc(Difference_In_Days);
  }

  //entidad a dos digitos + fecha (ddmmaaaa)+ hora(hh:mm:ss)
}
