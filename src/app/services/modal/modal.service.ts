import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {Modals} from "../../models/Modals";
import {ActiveModalChange} from "../../models/ActiveModalChange";
import {Asset} from "../../models/Asset";
import log from "loglevel";

declare var classie: any;
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private activeModalChange: Subject<ActiveModalChange> = new Subject<ActiveModalChange>();
  activeModalChange$ = this.activeModalChange.asObservable();

  public activeModal?: HTMLElement;

  constructor() { }

  showNewModal(modal: Modals, asset?: Asset): void {
    this.activeModalChange.next(new ActiveModalChange(modal, asset));
  }

  hideActiveModal(): void {
    log.debug("hideActiveModal activeModal=", this.activeModal);
    if (this.activeModal) {
      classie.remove( this.activeModal, 'modal-show' );

      if (classie.has(this.activeModal, 'md-setperspective')) {
        classie.remove(document.documentElement, 'md-perspective');
      }
      this.activeModal = undefined;

      $(".modal-overlay").css({opacity: 0, visibility: "hidden"});
    }
  }

  showModal(modal?: HTMLElement): void {
    if (modal) {
      classie.add(modal, 'modal-show');
      $(".modal-overlay").css({opacity: 1, visibility: "visible"});
      this.activeModal = modal;
    }
  }
}
