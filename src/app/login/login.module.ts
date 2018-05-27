import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import {ToastModule} from 'ng2-toastr/ng2-toastr';
import { LoadingModule } from 'ngx-loading';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        ToastModule.forRoot(),
        LoadingModule,
        LoginRoutingModule
    ],
    declarations: [LoginComponent]
})
export class LoginModule {
}
