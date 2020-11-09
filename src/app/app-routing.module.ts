import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MarketsPageComponent} from './components/markets-page/markets-page.component';
import {HomeComponent} from "./components/home/home.component";

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'markets', component: MarketsPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
