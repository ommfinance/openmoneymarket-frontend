import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scoreParam'
})
export class ScoreParamPipe implements PipeTransform {

  transform(parameter: string): string {
    switch (parameter) {
      case "_address":
        return "Address";
      case "_data":
        return "Data";
      case "_value":
        return "Token"
      default:
        return parameter;
    }
  }

}
