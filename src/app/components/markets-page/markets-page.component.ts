import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {PersistenceService} from '../../services/persistence-service/persistence.service';
import {MockScoreService} from '../../services/mock-score/mock-score.service';
import {BaseClass} from '../base-class';
import {DepositService} from '../../services/deposit/deposit.service';



@Component({
  selector: 'app-markets-page',
  templateUrl: './markets-page.component.html',
  styleUrls: ['./markets-page.component.css']
})
export class MarketsPageComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  public USDbDepositAmount = 0;
  public bridgeSupplySlider: any;
  public bridgeBorrowSlider: any;
  public riskRatio: any;

  // Position manager variables
  public supplyDeposited: any;
  public supplyAvailable: any;
  public borrowBorrowed: any;
  public borrowAvailable: any;
  public borrowAvailableRange: any;
  public supplyRewards: any;

  constructor(public persistenceService: PersistenceService,
              public mockScoreService: MockScoreService,
              public depositService: DepositService) {
    super();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {}


  ngOnDestroy(): void {
  }


}


