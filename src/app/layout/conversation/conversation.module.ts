import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { ConversationRoutingModule } from './conversation-routing.module';
import { ConversationComponent } from './conversation.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ToastModule} from 'ng2-toastr/ng2-toastr';
import {NgxPaginationModule} from 'ngx-pagination';
import { RegExFilterPipe } from './regExFilterPipe';
import { TagInputModule } from 'ngx-chips';
import { SharedPipesModule } from '../../shared/pipes/shared-pipes.module';
@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    ToastModule,
    TagInputModule,
    NgbModule.forRoot(),
    ConversationRoutingModule
  ],
  declarations: [
    ConversationComponent,
    RegExFilterPipe
  ]
})
export class ConversationModule { }
