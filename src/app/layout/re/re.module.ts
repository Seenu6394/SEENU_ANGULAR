import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { ReRoutingModule } from './re-routing.module';
import { ReComponent } from './re.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ToastModule} from 'ng2-toastr/ng2-toastr';
import {NgxPaginationModule} from 'ngx-pagination';
import { RegExFilterPipe } from './regExFilterPipe';
import { TagInputModule } from 'ngx-chips';
import { SharedPipesModule } from '../../shared/pipes/shared-pipes.module';
import { LoadingModule } from 'ngx-loading';
import { TabsModule } from 'ngx-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    ToastModule,
    TagInputModule,
    LoadingModule,
    NgbModule.forRoot(),
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    ReRoutingModule
  ],
  declarations: [
    ReComponent,
    RegExFilterPipe
  ]
})
export class ReModule { }
