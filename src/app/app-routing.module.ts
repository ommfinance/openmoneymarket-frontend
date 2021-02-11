import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {VoteComponent} from "./components/vote/vote.component";

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'vote', component: VoteComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
