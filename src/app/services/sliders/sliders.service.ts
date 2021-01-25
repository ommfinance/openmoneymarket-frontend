import { Injectable } from '@angular/core';
import log from "loglevel";

declare var noUiSlider: any;
declare var wNumb: any;

@Injectable({
  providedIn: 'root'
})
export class SlidersService {

  constructor() { }

  public createNoUiSlider(htmlElement: any, start?: number, padding?: number, connect?: string, tooltips?: [],
                          range?: any, format?: any): void {
    if (!htmlElement) { return; }
    log.debug("createNoUiSlider for htmlElement:", htmlElement);
    noUiSlider.create(htmlElement, {
      start: [start ?? 10000],
      padding: [padding ?? 0],
      connect: connect ?? 'lower',
      range: range ?? {
        min: [0],
        max: [15000]
      }
    });
  }


}
