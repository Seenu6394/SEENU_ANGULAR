import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import {AuthenticationService} from '../../app/shared/services/authentication.service';
import {ToastsManager, ToastOptions} from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [AuthenticationService],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    user: any = {};
    public loading = false;
    constructor(
      private authenticationService: AuthenticationService,
      public router: Router,
      public toastr: ToastsManager,
      vcr: ViewContainerRef)  {
      this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
    }

    onLoggedin(users) {
        this.loading = true;
        this.authenticationService.login(users).subscribe(res => {
            if (res.ACCOUNT_LOCKED != null) {
                this.loading = false;
                this.toastr.error('Error!', res.ACCOUNT_LOCKED);
            } else if (res.INVALID_PASSWORD != null) {
                this.loading = false;
                this.toastr.error('Error!', res.INVALID_PASSWORD);
            } else {
                localStorage.setItem('isLoggedin', 'true');
                localStorage.setItem('currentUser', res);
                this.toastr.success('Success!', 'Login Successfully');
                this.loading = false;
                this.router.navigate(['/dashboard']);
            }
        }, error => {
            this.loading = false;
            this.toastr.error('Error!', 'Please check your login Credentials');
        });

    }

}
