import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { MappingRoutingModule } from './mapping-routing.module';
import { MappingComponent } from './mapping.component';
import { DiagramEditorComponent } from './diagram-editor/diagram-editor.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ToastModule} from 'ng2-toastr/ng2-toastr';
import { TypeaheadModule } from 'ngx-bootstrap';
import { Draggable } from 'ng2draggable/draggable.directive';
import { TagInputModule } from 'ngx-chips';
import { TabsModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap';
import { UiSwitchModule } from 'ngx-ui-switch'
import { AngularMultiSelectModule } from 'angular2-multiselect-checkbox-dropdown/angular2-multiselect-dropdown';
import { LoadingModule } from 'ngx-loading';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { ModalModule } from "ngx-bootstrap";
import { ClickOutsideModule } from 'ng4-click-outside';
import { InputTrimModule } from 'ng2-trim-directive';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ButtonsModule } from 'ngx-bootstrap';
import { GetValuesPipe } from './getValuesPipe';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UiSwitchModule,
    ToastModule.forRoot(),
    NgbModule.forRoot(),
    TabsModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    ButtonsModule.forRoot(),
    TagInputModule,
    ClickOutsideModule,
    InputTrimModule,
    PopoverModule,
    LoadingModule,
    TypeaheadModule.forRoot(),
    ScrollToModule.forRoot(),
    AngularMultiSelectModule,
    MappingRoutingModule
  ],
  declarations: [
  MappingComponent,
  Draggable,
  GetValuesPipe,
  DiagramEditorComponent]
})
export class MappingModule { }
