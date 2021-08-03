import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {VoteComponent} from "./components/vote/vote.component";
import {RewardsComponent} from "./components/rewards/rewards.component";

const routes: Routes = [
  {
    path: '', pathMatch: 'full', redirectTo: 'home'
  },
  { path: 'home', component: HomeComponent},
  { path: 'vote', component: VoteComponent},
  { path: 'rewards', component: RewardsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
