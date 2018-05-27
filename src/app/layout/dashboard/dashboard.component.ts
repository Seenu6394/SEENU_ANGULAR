import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { routerTransition } from '../../router.animations';

import { KuService } from '../../shared/services/ku.service';
import { Ku } from '../../models/ku';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    providers: [KuService, ToastsManager, ToastOptions],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {

    kus: Ku[];
    errorMessage: any;
    constructor(
        private kuService: KuService,
        public router: Router,
        public toastr: ToastsManager,
        vcr: ViewContainerRef) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.getKus()
    }
    getKus() {
        this.kuService.getKus('001')
            .subscribe(
            kus => this.kus = kus,
            error => {
                this.errorMessage = <any>error;
                if (this.errorMessage == 401) {
                  this.toastr.error('Session Expired, Please Login Again');
                  this.router.navigate(['/login']);
                }
            });
    }
}
