import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReComponent } from './re.component';

const routes: Routes = [
    { path: '', component: ReComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReRoutingModule { }
