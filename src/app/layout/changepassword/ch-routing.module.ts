import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChComponent } from './ch.component';

const routes: Routes = [
    { path: '', component: ChComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ChRoutingModule { }
