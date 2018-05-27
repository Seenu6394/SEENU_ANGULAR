import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './shared';
import { TypeaheadModule } from 'ngx-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
import {EqualValidator} from './shared/directives/password.match.directive';
import { TabsModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap';
import { LoadingModule } from 'ngx-loading';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ToastModule} from 'ng2-toastr/ng2-toastr';
// AoT requires an exported function for factories
export function HttpLoaderFactory(https: Http) {
    // for development
    return new TranslateHttpLoader(https, './assets/i18n/', '.json');
}
@NgModule({
    declarations: [
        AppComponent,
        EqualValidator
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        TypeaheadModule,
        TabsModule.forRoot(),
        NgbModule.forRoot(),
        ToastModule.forRoot(),
        BsDropdownModule.forRoot(),
        HttpModule,
        LoadingModule,
        PopoverModule.forRoot(),
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [Http]
            }
        })
    ],
    providers: [AuthGuard],
    bootstrap: [AppComponent]
})
export class AppModule {
}
