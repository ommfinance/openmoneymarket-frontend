import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule} from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import {CoreModule} from "./core/core.module";
import { NotificationComponent } from './components/notification/notification.component';
import { ModalComponent } from './components/modal/modal.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { RiskComponent } from './components/risk/risk.component';
import { AssetComponent } from './components/asset/asset.component';
import {environment} from "../environments/environment";
import log from "loglevel";
import { VoteComponent } from './components/vote/vote.component';
import { MainComponent } from './components/main/main.component';
import {HttpClientModule} from "@angular/common/http";
import { RewardsComponent } from './components/rewards/rewards.component';
import { UsFormatPipe } from './pipes/us-format.pipe';
import { RoundOff2DecPipe } from './pipes/round-off-2-dec.pipe';
import { RoundDown2DecPipe } from './pipes/round-down-2-dec.pipe';
import { PoolStakeSliderComponent } from './components/pool-stake-slider/pool-stake-slider.component';
import BigNumber from "bignumber.js";
import {RoundOff0DecPipe} from "./pipes/round-off-0-dec.pipe";

// Big Number configs
const fmt = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: '',
};

BigNumber.config({ FORMAT: fmt, ROUNDING_MODE: BigNumber.ROUND_DOWN, DECIMAL_PLACES: 18 });
BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN }); // equivalent

// set logging level
log.setLevel(environment.production ? "error" : "debug");

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    NotificationComponent,
    ModalComponent,
    PerformanceComponent,
    RiskComponent,
    AssetComponent,
    VoteComponent,
    MainComponent,
    RewardsComponent,
    UsFormatPipe,
    RoundOff2DecPipe,
    RoundDown2DecPipe,
    RoundOff0DecPipe,
    PoolStakeSliderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CoreModule,
    HttpClientModule
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
