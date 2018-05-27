import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { ChRoutingModule } from './ch-routing.module';
import { ChComponent } from './ch.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ToastModule} from 'ng2-toastr/ng2-toastr';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ToastModule.forRoot(),
    NgbModule.forRoot(),
    ChRoutingModule
  ],
  declarations: [ChComponent]
})
export class ChModule { }
