import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toZeroIfDash'
})
export class ToZeroIfDashPipe implements PipeTransform {

  transform(dash: string): string {
    return dash === "-" ? "0" : dash;
  }

}
