import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(lista: any[], texto: string): any[] {

    if(!texto) return lista
    return lista.filter(user => user.name.toUpperCase().includes(texto.toUpperCase()))
  }

}
