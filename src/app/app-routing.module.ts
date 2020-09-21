import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IconexLoginComponent} from "./components/iconex-login/iconex-login.component";

const routes: Routes = [
  { path: '', component: IconexLoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
