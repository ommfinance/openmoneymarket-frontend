import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hide'
})
export class HideElementPipe implements PipeTransform {

  transform(hide: boolean): any {
    return {display: hide ? 'none' : null};
  }

}
