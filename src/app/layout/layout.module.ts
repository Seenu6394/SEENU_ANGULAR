import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule} from '@angular/forms';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent, ChatComponent, SidebarComponent } from '../shared';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TagInputModule } from 'ngx-chips';
import { InputTrimModule } from 'ng2-trim-directive';
import { TabsModule } from 'ngx-bootstrap';
import { LoadingModule } from 'ngx-loading';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        TooltipModule.forRoot(),
        TabsModule,
        LayoutRoutingModule,
        InputTrimModule,
        TagInputModule,
        LoadingModule,
        TranslateModule
    ],
    declarations: [
        LayoutComponent,
        HeaderComponent,
        SidebarComponent,
        ChatComponent
    ]
})
export class LayoutModule { }
