import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {Modals} from "../../models/Modals";

declare var classie: any;

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private activeModalChange: Subject<Modals> = new Subject<Modals>();
  activeModalChange$ = this.activeModalChange.asObservable();

  public activeModal?: HTMLElement;

  constructor() { }

  showNewModal(modal: Modals): void {
    this.activeModalChange.next(modal);
  }

  hideActiveModal(): void {
    if (this.activeModal) {
      classie.remove( this.activeModal, 'modal-show' );

      if (classie.has(this.activeModal, 'md-setperspective')) {
        classie.remove(document.documentElement, 'md-perspective');
      }
      this.activeModal = undefined;
    }
  }

  showModal(modal?: HTMLElement): void {
    if (modal) {
      classie.add(modal, 'modal-show');
      this.activeModal = modal;
    }
  }
}
