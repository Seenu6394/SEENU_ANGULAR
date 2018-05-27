import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import {AuthenticationService} from '../../app/shared/services/authentication.service';
import {ToastsManager, ToastOptions} from 'ng2-toastr/ng2-toastr';
@Component({
    selector: 'app-fp',
    templateUrl: './fp.component.html',
    styleUrls: ['./fp.component.scss'],
    providers: [AuthenticationService, ToastsManager, ToastOptions, ],
    animations: [routerTransition()]
})
export class FpComponent implements OnInit {
    user: any = {};
    constructor(
      private authenticationService: AuthenticationService,
      public router: Router ,
      public toastr: ToastsManager,
      vcr: ViewContainerRef) {
      this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
    }

    forgotPassword(users) {
        this.authenticationService.forgotPassword(users).subscribe(res => {
          this.toastr.success('Success!', 'Email Send Successfully');
        }, error => {
          this.toastr.error('Error!', 'Something went wrong');
        });

    }

}
