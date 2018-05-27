import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { routerTransition } from '../../router.animations';
import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/observable/throw';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { ReService } from '../../shared/services/re.service';
import { KuService } from '../../shared/services/ku.service';

import { Keywords } from '../../models/keywords';
import { Intent } from '../../models/intent';
import { Ku } from '../../models/ku';
import { RegularExpression } from '../../models/regularexpression';
import * as $ from 'jquery-ui';

@Component({
    selector: 'app-re',
    templateUrl: './re.component.html',
    styleUrls: ['./re.component.scss'],
    providers: [KuService, ReService, ToastsManager, ToastOptions, NgbActiveModal],
    animations: [routerTransition()]

})

export class ReComponent implements OnInit {

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
    enableArabicLang: any;

    errorMessageRegExs: any;
    arabicErrorMessageRegExs: any;

    updateErrorMessageRegExs: any;
    arabicUpdateErrorMessageRegExs: any;

    updateRegexLangWarning: boolean;

    p = 1;
    noItemsPerPage = 5;
    nototalItems: number;
    space = '&nbsp';

    searchValue: any;
    public loading = false;

    regEx: any;
    updateRegEx: any;
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
    }
    ngOnInit() {
        this.getReLst();
        if (localStorage.getItem("arabicLang") === "true") {
          this.enableArabicLang = true;
        } else {
          this.enableArabicLang = false;
        }
    }

    getkuLst() {
        this.kuService.getKus('002')
            .subscribe(
            kus => this.kus = kus,
            error => this.errorMessage = <any>error);
    }

    getReLst() {
        this.loading = true;
        this.reService.getReIntentLst() // change later whaen intent comes
            .subscribe(
            regexs => {
                this.loading = false;
                this.regExLst = regexs;
            },
            error => {
                this.loading = false;
                this.errorMessage = <any>error;
            });
    }

    addRegEx(content) {
        this.regEx = new RegularExpression();
        this.modalReference = this.modalService.open(content);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    editRegEx(modalupdate, modalUpdateRegexs, regEx, intents) {
        this.updateErrorMessageRegExs = "";
        this.arabicUpdateErrorMessageRegExs = "";
        for (const regExs of regEx.regexes) {
            if (regExs.localeCode == "ar") {
              this.arabicUpdateErrorMessageRegExs = regExs.errorMessage;
            } else if (regExs.localeCode == "en") {
              this.updateErrorMessageRegExs = regExs.errorMessage;
            }
        }
        if (intents.length == 0) {
            const copy = Object.assign({}, regEx);
            this.updateRegEx = copy;
            this.modalReference = this.modalService.open(modalupdate);
            this.modalReference.result.then((result) => {
                this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
        } else {
            const copy = Object.assign({}, regEx);
            this.updateRegEx = copy;
            this.modalReference = this.modalService.open(modalUpdateRegexs);
            this.modalReference.result.then((result) => {
                this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
        }
    }
    updateRegExsModal(modalupdate) {
        this.modalReference.close();
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
        const regexs = [];
        const regexsEng = {
            "errorMessage": this.errorMessageRegExs,
            "localeCode": "en"
        }

        if (this.arabicErrorMessageRegExs != undefined && this.arabicErrorMessageRegExs != null) {
          const arabicRegexs = {
              "errorMessage": this.arabicErrorMessageRegExs,
              "localeCode": "ar"
          }
          regexs.push(arabicRegexs);
        }
        regexs.push(regexsEng);
        regEx.regexs = regexs;
        this.reService.createRe(regEx)
            .subscribe(successCode => {
                this.statusCode = successCode;
                this.getReLst();
                this.modalReference.close();

                if (this.statusCode == 203) {
                    this.toastr.error('Regular expression already exists.');
                } else {
                    this.toastr.success('Regular expression added Successfully');
                }
            },
            errorCode => {
                if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                    this.toastr.error('Regular expression already exists');
                } else {
                    this.modalReference.close();
                    this.toastr.error('Something went wrong');
                }
            });

    }

    updateRegExMethod(regEx) {
      const regexs = [];
      for (const regExs of regEx.regexes) {
              if (this.arabicUpdateErrorMessageRegExs != undefined && this.arabicUpdateErrorMessageRegExs != null && regExs.localeCode == "ar") {
                  const arabicRegexs = {
                      "errorMessage": this.arabicUpdateErrorMessageRegExs,
                      "localeCode": "ar",
                      "id": regExs.id
                  }
                  regexs.push(arabicRegexs);
              } else if (this.updateRegEx.regexes.length == 1 && regExs.localeCode == "en" && this.arabicUpdateErrorMessageRegExs != undefined && this.arabicUpdateErrorMessageRegExs != null) {
                const arabicRegexs = {
                    "errorMessage": this.arabicUpdateErrorMessageRegExs,
                    "localeCode": "ar"
                }
                regexs.push(arabicRegexs);
              }
              if (regExs.localeCode == "en") {
                  const regexsEng = {
                      "errorMessage": this.updateErrorMessageRegExs,
                      "localeCode": "en",
                      "id": regExs.id
                  }
                  regexs.push(regexsEng);
              }
      }
      regEx.regexs = regexs;
        this.reService.updateRe(regEx)
            .subscribe(successCode => {
                this.statusCode = successCode;
                this.getReLst();
                this.modalReference.close();
                if (this.statusCode == 203) {
                    this.toastr.error('Regular expression already exists.');
                } else {
                    this.toastr.success('Regular expression updated Successfully');
                }
            },
            errorCode => {
                if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                    this.toastr.error('Regular expression already exists');
                } else {
                    this.modalReference.close();
                    this.toastr.error('Something went wrong');
                }
            });
    }

    deleteRe(reId: string) {
        this.reService.deleteReById(reId)
            .subscribe(successCode => {

                this.status = successCode;
                this.getReLst();
                this.modalReference.close();
                if (this.status.Status == "Success") {
                    this.toastr.success('regular expression deleted Successfully');
                } else if (this.status.Status == "Failure") {
                    this.toastr.error('Regular Expression is mapped to the entity.');
                }
            },
            errorCode => {
                if (errorCode.errorCode == "REGEX_MAPPED") {
                    this.toastr.error('Regular Expression is mapped to the entity.');
                    this.modalReference.close();
                } else {
                    this.modalReference.close();
                    this.toastr.error('Something went wrong');
                }

            });
    }


    setIdToBeDeleted(modaldelete, modalwarning, id, intents) {
        if (intents.length == 0) {
            this.modalReference = this.modalService.open(modaldelete);
            this.idToBeDeleted = id;
        } else {
            this.modalReference = this.modalService.open(modalwarning);
        }

    }

    checkArabicCreateRegExs() {
        this.updateRegexLangWarning = false;
        if ((this.arabicErrorMessageRegExs === undefined || this.arabicErrorMessageRegExs === "")
            && (this.errorMessageRegExs)) {
            this.updateRegexLangWarning = true;
        }
    }
    checkArabicUpdateRegExs() {
        this.updateRegexLangWarning = false;
        if ((this.arabicUpdateErrorMessageRegExs === undefined || this.arabicUpdateErrorMessageRegExs === "")
            && (this.updateErrorMessageRegExs)) {
            this.updateRegexLangWarning = true;
        }
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
