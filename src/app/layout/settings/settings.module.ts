import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ToastModule} from 'ng2-toastr/ng2-toastr';
import { TagInputModule } from 'ngx-chips';
import { TabsModule } from 'ngx-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { LoadingModule } from 'ngx-loading';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ToastModule.forRoot(),
    TabsModule.forRoot(),
    TagInputModule,
    NgbModule.forRoot(),
    PopoverModule,
    LoadingModule,
    SettingsRoutingModule
  ],
  declarations: [
    SettingsComponent
  ]
})
export class SettingsModule { }
