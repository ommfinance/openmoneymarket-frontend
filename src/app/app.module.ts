import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule} from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import {CoreModule} from "./core/core.module";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationComponent } from './components/notification/notification.component';
import { ModalComponent } from './components/modal/modal.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { RiskComponent } from './components/risk/risk.component';
import { AssetComponent } from './components/asset/asset.component';
import {environment} from "../environments/environment";
import log from "loglevel";
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
    AssetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CoreModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
