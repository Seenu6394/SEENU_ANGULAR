import {Component, OnInit, ViewContainerRef} from '@angular/core';
import 'rxjs/add/observable/throw';
import { Router } from '@angular/router';
import {routerTransition} from '../../router.animations';
import {NgbModal, NgbActiveModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import {ToastsManager, ToastOptions} from 'ng2-toastr/ng2-toastr';
import {AuthenticationService} from '../../shared/services/authentication.service';
import * as $ from 'jquery-ui';

@Component({
  selector: 'app-ch',
  templateUrl: './ch.component.html',
  styleUrls: ['./ch.component.scss'],
  providers: [AuthenticationService, ToastsManager, ToastOptions, NgbActiveModal],
  animations: [routerTransition()]

})
export class ChComponent implements OnInit {

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

  changePassword(users) {
      this.authenticationService.changePassword(users).subscribe(res => {
        console.log(res);
        this.toastr.success('Success!', 'Password Changed Successfully');
      }, error => {
        this.toastr.error('Error!', 'Something went wrong');
          console.log(error);
      });

  }

}
