import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MarketsPageComponent} from './components/markets-page/markets-page.component';

const routes: Routes = [
  { path: '', component: MarketsPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
