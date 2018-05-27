import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { routerTransition } from '../router.animations';
import {AuthenticationService} from '../../app/shared/services/authentication.service';
import {ToastsManager, ToastOptions} from 'ng2-toastr/ng2-toastr';
@Component({
    selector: 'app-resetpassword',
    templateUrl: './resetpassword.component.html',
    styleUrls: ['./resetpassword.component.scss'],
    providers: [AuthenticationService, ToastsManager, ToastOptions, ],
    animations: [routerTransition()]
})
export class ResetPasswordComponent implements OnInit {
    user: any = {};
    constructor(
      private authenticationService: AuthenticationService,
      public router: Router ,
      private route: ActivatedRoute,
      public toastr: ToastsManager,
      vcr: ViewContainerRef) {
      this.toastr.setRootViewContainerRef(vcr);
      this.route.params.subscribe(params => {
        if (params['token']) {
          this.tokenVerification(params['token']);
        }

      });
    }

    ngOnInit() {
    }

    tokenVerification(token) {
        this.authenticationService.tokenVerification((token).subscribe(res => {
          this.toastr.success('Success!', 'valid Token');
        }, error => {
          this.toastr.error('Error!', 'Token Expired');
        }));
    }
    resetPassword(users) {
        this.authenticationService.resetPassword(users).subscribe(res => {
          this.toastr.success('Success!', 'Password reset Successfully');
          this.router.navigate(['login']);
        }, error => {
          this.toastr.error('Error!', 'Something went wrong');
        });
    }

}
