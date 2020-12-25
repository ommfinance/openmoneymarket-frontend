import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../../services/modal/modal.service";
import {Subscription} from "rxjs";
import {Modals} from "../../models/Modals";
import {IconexApiService} from "../../services/iconex-api/iconex-api.service";
import {BridgeWidgetService} from "../../services/bridge-widget/bridge-widget.service";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  @ViewChild('signInModal', { static: true }) signInModal!: ElementRef;

  activeModalSubscription: Subscription;
  activeModal?: HTMLElement;


  constructor(private modalService: ModalService,
              private iconexApiService: IconexApiService,
              private bridgeWidgetService: BridgeWidgetService) {
    this.activeModalSubscription = this.modalService.activeModalChange$.subscribe((modal: Modals) => {
      switch (modal) {
        case Modals.SIGN_IN:
          this.activeModal = this.signInModal.nativeElement;
      }
      this.modalService.showModal(this.activeModal);
    });
  }

  ngOnInit(): void {
  }

  onSignInIconexClick(): void {
    this.modalService.hideActiveModal();
    this.iconexApiService.hasAccount();
  }

  onSignInBridgeClick(): void {
    this.modalService.hideActiveModal();
    this.bridgeWidgetService.openBridgeWidget();
  }

}
