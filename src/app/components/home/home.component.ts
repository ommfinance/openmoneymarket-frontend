import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {DepositService} from "../../services/deposit/deposit.service";

import {WithdrawService} from "../../services/withdraw/withdraw.service";
import {BorrowService} from "../../services/borrow/borrow.service";
import {SlidersService} from "../../services/sliders/sliders.service";
import {RepayService} from "../../services/repay/repay.service";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {HeaderComponent} from "../header/header.component";
import * as toggleLogic from "./home-toggle-logic";
import {RiskComponent} from "../risk/risk.component";
import {Asset} from "../../models/Asset";
import log from "loglevel";

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {
  // Child components
  @ViewChild(HeaderComponent) private headerComponent!: HeaderComponent;
  @ViewChild(RiskComponent) private riskComponent!: RiskComponent;

  public toggleLogic = toggleLogic;

  public assets: Asset[] = Array.from(this.getSupportedAssetsMap().values());

  constructor(public persistenceService: PersistenceService,
              public depositService: DepositService,
              public withdrawService: WithdrawService,
              public borrowService: BorrowService,
              public repayService: RepayService,
              public slidersService: SlidersService,
              public calculationService: CalculationsService,
              private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.assets = Array.from(this.getSupportedAssetsMap().values());
    this.cd.detectChanges();
  }



  onMainClick(): void {
    $('#notifications-tooltip').removeClass("active");
    $('.notifications').removeClass("active");
    this.headerComponent.onMainClick();
  }
}


