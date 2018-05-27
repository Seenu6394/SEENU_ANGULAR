import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FpComponent } from './fp.component';

const routes: Routes = [
    { path: '', component: FpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FpRoutingModule { }
