import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { ResetPasswordRoutingModule } from './resetpassword-routing.module';
import { ResetPasswordComponent } from './resetpassword.component';
import {ToastModule} from 'ng2-toastr/ng2-toastr';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        ResetPasswordRoutingModule,
        ToastModule.forRoot()
    ],
    declarations: [ResetPasswordComponent]
})
export class ResetPasswordModule {
}
