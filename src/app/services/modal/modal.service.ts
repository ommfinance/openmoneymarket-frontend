import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {Modals} from "../../models/Modals";
import {ModalAction} from "../../models/ModalAction";
import log from "loglevel";
import {AssetAction} from "../../models/AssetAction";

declare var classie: any;
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private activeModalChange: Subject<ModalAction> = new Subject<ModalAction>();
  activeModalChange$ = this.activeModalChange.asObservable();

  public activeModal?: HTMLElement;

  constructor() { }

  showNewModal(modal: Modals, assetAction?: AssetAction): void {
    this.activeModalChange.next(new ModalAction(modal, assetAction));
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
