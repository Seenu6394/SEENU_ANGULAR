import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { FpRoutingModule } from './fp-routing.module';
import { FpComponent } from './fp.component';
import {ToastModule} from 'ng2-toastr/ng2-toastr';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        FpRoutingModule,
        ToastModule.forRoot()
    ],
    declarations: [FpComponent]
})
export class FpModule {
}
