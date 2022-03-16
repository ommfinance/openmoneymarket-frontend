import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {ModalType} from "../../models/ModalType";
import {ModalAction} from "../../models/ModalAction";
import log from "loglevel";
import {AssetAction} from "../../models/AssetAction";
import {StakingAction} from "../../models/StakingAction";
import {VoteAction} from "../../models/VoteAction";
import {GovernanceAction} from "../../models/GovernanceAction";
import {LockingAction} from "../../models/LockingAction";

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

  showNewModal(modal: ModalType, assetAction?: AssetAction, stakingAction?: StakingAction, voteAction?: VoteAction,
               governanceAction?: GovernanceAction, lockingOmmAction?: LockingAction): void {
    this.activeModalChange.next(new ModalAction(modal, assetAction, stakingAction, voteAction, governanceAction,
      lockingOmmAction));
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
