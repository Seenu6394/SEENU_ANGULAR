import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {routerTransition} from '../../router.animations';
import {NgbModal, NgbActiveModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/observable/throw';

import {ToastsManager, ToastOptions} from 'ng2-toastr/ng2-toastr';
import {ReService} from '../../shared/services/re.service';
import {KuService} from '../../shared/services/ku.service';

import {Keywords} from '../../models/keywords';
import {Intent} from '../../models/intent';
import {Ku} from '../../models/ku';
import {RegularExpression} from '../../models/regularexpression';
import * as $ from 'jquery-ui';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  providers: [KuService, ReService, ToastsManager, ToastOptions, NgbActiveModal],
  animations: [routerTransition()]

})

export class ConversationComponent implements OnInit {

  errorMessage: string;
  statusCode: number;
  kus: Ku[];
  regExPageLst: RegularExpression[];
  regExLst: RegularExpression[];
  reIdToUpdate = null;
  selectedKuId: any;
  idToBeDeleted: number;
  status: any;
  closeResult: string;
  modalReference: any;
  pager: any = {};
  pagedItems: any[];

  p = 1;
  noItemsPerPage = 5;
  nototalItems: number;

  searchValue: any;

  regEx: RegularExpression;
  updateRegEx: RegularExpression;
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private kuService: KuService,
    private reService: ReService,
    private route: ActivatedRoute,
    public toastr: ToastsManager, vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr);
    this.regEx = new RegularExpression();
    this.updateRegEx = new RegularExpression();

    this.route.params.subscribe(params => {
      if (params['kuId']) {
        this.selectedKuId = params['kuId'];
        this.getRegExLstBasedOnKu(params['kuId']);
      }
    });
  }
  ngOnInit() {
    this.selectedKuId = 'All KU';
    this.getkuLst(),
      this.getReLst()
  }

  getkuLst() {
    this.kuService.getKus('002')
      .subscribe(
      kus => this.kus = kus,
      error => this.errorMessage = <any>error);
  }

  getReLst() {
    this.reService.getReLst()
      .subscribe(
      regexs => this.regExLst = regexs,
      error => this.errorMessage = <any>error
      );
  }

  addRegEx(content) {
    this.modalReference = this.modalService.open(content);
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  editRegEx(modalupdate, regEx) {

    const copy = Object.assign({}, regEx);
    this.updateRegEx = copy;
    this.modalReference = this.modalService.open(modalupdate);
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

  }

  getRegExLstBasedOnKu(id) {
    if (id) {
      this.reService.getAllReByKu(this.selectedKuId)
        .subscribe(
        entitys => this.regExLst = entitys,
        error => this.errorMessage = <any>error)
    }
  }


  createRegEx(regEx) {

    this.reService.createRe(regEx)
      .subscribe(successCode => {
        this.statusCode = successCode;
        this.getReLst();
        this.modalReference.close();

        if (this.statusCode == 203) {
          this.toastr.error('Error!', 'regular expression already exists.');
        } else {
          this.toastr.success('Success!', 'regular expression added Successfully');
        }
      },
      errorCode => {
        if (errorCode.errorCode == "DUPLICATE_ENTRY") {
          this.toastr.error('Error!', 'Regular expression already exists');
        } else {
        this.modalReference.close();
          this.toastr.error('Error!', 'Something went wrong');
        }
      });

  }

  updateRegExMethod(regEx) {
    this.reService.updateRe(regEx)
      .subscribe(successCode => {
        this.statusCode = successCode;
        this.getReLst();
        this.modalReference.close();
        if (this.statusCode == 203) {
          this.toastr.error('Error!', 'regular expression already exists.');
        } else {
          this.toastr.success('Success!', 'regular expressionupdated Successfully');
        }
      },
      errorCode => {
        if (errorCode.errorCode == "DUPLICATE_ENTRY") {
          this.toastr.error('Error!', 'Regular expression already exists');
        } else {
          this.modalReference.close();
          this.toastr.error('Error!', 'Something went wrong');
        }
      });
  }

  deleteRe(reId: string) {
    this.reService.deleteReById(reId)
      .subscribe(successCode => {

        this.status = successCode;
        this.getReLst();
        if (this.status.Status == "Success") {
          this.toastr.success('Success!', 'regular expression deleted Successfully');
        } else if (this.status.Status == "Failure") {
          this.toastr.error('Error!', 'Regular Expression is mapped to the entity.');
        }
      },
      errorCode => {
        if (errorCode == "REGEX_MAPPED") {
          this.toastr.error('Error!', 'Regular Expression is mapped to the entity.');
        } else {
          this.modalReference.close();
          this.toastr.error('Error!', 'Something went wrong');
        }

      });
  }


  setIdToBeDeleted(modaldelete, id: number) {
    this.modalReference = this.modalService.open(modaldelete);
    this.idToBeDeleted = id;
  }
  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
