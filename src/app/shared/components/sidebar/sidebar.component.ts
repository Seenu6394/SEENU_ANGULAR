'use strict';
// Angular
import { Component, OnInit, AfterViewInit, ViewContainerRef, HostListener, ElementRef, ViewChild, Renderer2, ApplicationRef, ChangeDetectorRef, Input, Output, EventEmitter, ChangeDetectionStrategy   } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
// Services
import { KuService } from '../../services/ku.service';
import { DashboardService } from '../../services/dashboard.service';
import { IntentService } from '../../services/intent.service';
import { SettingsService } from '../../services/settings.service';
// Models
import { Ku } from '../../../models/ku';
import { Intent } from '../../../models/intent';
import { Keywords } from '../../../models/keywords';

import { NgbModal, NgbActiveModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TabsetComponent, ModalDirective } from 'ngx-bootstrap';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { saveAs as importedSaveAs } from "file-saver";
// uuid in build angular
import { v4 as uuid } from 'uuid';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    providers: [
        ToastsManager,
        ToastOptions,
        NgbActiveModal,
        NgbModal,
        IntentService,
        DashboardService,
        KuService,
        SettingsService
    ]

})
export class SidebarComponent implements OnInit {
    // Variables
    // UI Expand
    isActive = false;
    showMenu = '';
    showIntent = '';
    // hide and show Languages
    enableArabicLang: boolean;
    enableEnglishLang: boolean;
    hideview: boolean;
    disableSaveBtn: boolean;
    public view: any;
    isOpenPopOver: boolean;

    // Import/ Export Ku
    exportJson: any = {};
    exportFileName: any;
    importJsonData: any = {};
    viewEditTable: boolean;
    intentCount: any = {};
    entityCount: any = {};

    // Loading
    loading = false;

    // KU
    kus: Ku[];
    ku: Ku = new Ku();
    uku: any;
    selectedKu: any = {};

    // Intent
    intents: Intent[];
    intent: any = {};
    updatedIntents: any = {};
    removeIntent: any = {};
    intentValue: null;
    createIntentLangWarning: boolean;

    // keywords
    keywords: Keywords[] = [];
    postKeys = [];
    negaKeys = [];
    arabicPostKeys = [];
    arabicNegaKeys = [];

    // Modal ElementRef
    @ViewChild('removeIntent')
    private removeIntentModalTemplate: ElementRef;

    @ViewChild('deleteIntent')
    private deleteIntentTemplate: ElementRef;

    @ViewChild('intentListView')
    public intentListView: ElementRef;

    @Input() kuData: any

    // Ngb Modal Elements
    closeResult: string;
    modalReference: any;
    ngbModalOptions: NgbModalOptions = { backdrop: 'static', keyboard: true };

    // tag-input error messages
    public errorMessages = {
        'errorMessage': 'Keywords can have only letters numbers',
        'length': ' Limit Reached - maximum 25 letters '
    };

    public arabicErrorMessages = {
        'errorMessage': 'Keywords can have only Arabic letters numbers',
        'length': ' Limit Reached - maximum 25 letters '
    };

    public validators = [this.tagValidation, this.length];
    public arabicValidators = [this.tagValidationArabic, this.length];

    constructor(
        private route: ActivatedRoute,
        public dashboardService: DashboardService,
        public kuService: KuService,
        public router: Router,
        public ref: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        public activeModal: NgbActiveModal,
        private modalService: NgbModal,
        public appRef: ApplicationRef,
        private intentService: IntentService,
        private settingsService: SettingsService,
        public toastr: ToastsManager,
        private renderer: Renderer2,
        vcr: ViewContainerRef) {
        this.toastr.setRootViewContainerRef(vcr);
        this.view = this.intentListView;
       }
    // Init
    ngOnInit() {
        this.getKus();
        this.getLanguages();
        this.viewEditTable = false;
        this.disableSaveBtn = false;
    }

    // ****************************************** UI ******************************************

    eventCalled() { // Active Div
        this.isActive = !this.isActive;
    }

    getLanguages() {
        this.settingsService.getLanguages()
            .subscribe(success => {
                this.enableEnglishLang = success.english;
                this.enableArabicLang = success.arabic;
                localStorage.setItem("arabicLang", success.arabic)
            },
            error => {
                this.toastr.error("Service Error")
            });
    }

    addExpandKuClass(element: any) { // expand ku class
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    hideExpandKuClass(ku, intent) { // hide ku class
        if (ku.id) {
            this.hideview = true;
            this.selectedKu = ku;
            this.intentService.getIntentByKu(ku.id)
                .subscribe(
                intents => {
                  this.updatedIntents = intents;
                  if (this.intents.length != 0) {
                    this.intents = [...this.intents, this.updatedIntents];
                  } else {
                      this.intents = this.intents;
                  }

                    this.updatedIntents = {};
                },
                error => {
                    this.toastr.error('Service Error');
                })
        }
    }

    trackByKus(index: number, ku): number { return index; }

    trackByIntents(index: number, intent): number { return index; }

    addExpandIntentClass(element: any) { // expand Inent class
        if (element == this.showIntent) {
            this.showIntent = '0';
        } else {
            this.showIntent = element;
        }
    }

    // General Function

    closeModal() {  // Close Modal
        this.modalReference.close();
    }

    tagValidation(control: FormControl) { // tag-input Validations RegEx

        const REGEXP = /^[A-Za-z0-9' ]*$/;

        const value = REGEXP.test(control.value) ? null : true;
        if (value) {
            return {
                'errorMessage': true
            };
        } else {
            return null;
        }
    }

    tagValidationArabic(control: FormControl) { // tag-input Validations Arabic RegEx

        const EMAIL_REGEXP = /^(?:[0-9\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF])){0,50}$/;
        const value = EMAIL_REGEXP.test(control.value) ? null : true;
        if (value) {
            return {
                'errorMessage': true
            };
        } else {
            return null;
        }
    }

    length(control: FormControl) { // tag-input Validations check length
        if (control.value.length >= 25) {
            return {
                'length': true
            };
        }
        return null;
    }

    changeTagOnAdding(tag) {   // tag-input all keywords to lower case
        tag.toLowerCase(tag)
        return Observable
            .of(tag.toLowerCase(tag));
    }

    checkImportIntentForm(errors, index) {
      if (errors != null ) {
        this.disableSaveBtn = true;
      } else {
        this.disableSaveBtn = false;
      }
    }

    getDismissReason(reason: any): string { // Modal Function catch Dismiss
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    // ****************************************** KU ******************************************

    getKus() { // Get KU
        this.kuService.getKus('002')
            .subscribe(
            kus => {
                this.kus = kus;
            },
            error => {
                this.loading = false;
                this.toastr.error('Service Error');
                this.router.navigate(['/login']);
            });
    }

    disableKuWarning(disableKu) { // disable Ku modal Warning message
        this.modalReference = this.modalService.open(disableKu, this.ngbModalOptions);
    }

    enableKuWarning(enableKu) { // enable Ku modal Warning message
        this.modalReference = this.modalService.open(enableKu, this.ngbModalOptions);
    }

    deleteConformation(modaldelete) { // delete Ku modal Warning message
        this.modalReference = this.modalService.open(modaldelete, this.ngbModalOptions);
    }

    deleteKu() { // Delete Ku
        this.kuService.deleteKuById(this.selectedKu.id)
            .subscribe(success => {
                this.getKus();
                this.modalReference.close();
                this.toastr.success('Knowledge Unit deleted successfully.');
                this.router.navigate(['/dashboard']);
            },
            error => {
                this.getKus();
                this.modalReference.close();
                this.toastr.error('Service Error');
            });
    }

    editKu(modalupdate) { // Edit View Knowledge Unit
        const copy = Object.assign({}, this.selectedKu);
        this.uku = copy;
        if (  this.uku.isRankable == 'Y') {
            this.uku.isRankable = true
        } else {
          this.uku.isRankable = false;
        }

        this.modalReference = this.modalService.open(modalupdate, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
        const inputElement = this.renderer.selectRootElement('#updatekuName');
        inputElement.focus();

    }

    addKu(content) { // Modal for Add Ku
        this.ku = new Ku();
        this.ku.isRankable = true;
        this.modalReference = this.modalService.open(content, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
        const inputElement = this.renderer.selectRootElement('#kuName');
        inputElement.focus();
    }

    createKu(ku) { // Create Knowledge Unit
        if (ku.isRankable) {
          ku.isRankable = 'Y';
        } else {
            ku.isRankable = 'N';
        }
        this.kuService.createKU(ku)
            .subscribe(data => {
                this.getKus();
                this.toastr.success('KU added Successfully');
                this.closeResult = `Dismissed ${this.getDismissReason('Success')}`;
                this.modalReference.close();
            },
            errorCode => {
                if (errorCode.errorCode == "DUPLICATE_ENTRY" || errorCode.errorCode == "KU_EXIST") {
                    this.toastr.error('Knowledge Unit already exists.');
                } else {
                    this.modalReference.close();
                    this.toastr.error('Service Error');
                }
            });
    }

    updateKu(ku) { // Update Knowledge Unit
      if (ku.isRankable) {
        ku.isRankable = 'Y';
      } else {
          ku.isRankable = 'N';
      }
        this.kuService.updateKu(ku)
            .subscribe(success => {
                this.getKus();
                this.toastr.success('KU updated Successfully');
                this.modalReference.close();
            },
            error => {
                if (error.errorCode == "DUPLICATE_ENTRY" || error.errorCode == "KU_EXIST") {
                    this.toastr.error('Knowledge Unit already exists.');
                } else {
                    this.closeResult = `Dismissed ${this.getDismissReason('Error')}`;
                    this.toastr.error('Service Error');
                }
            });
    }

    disableKnowledgeUnit(ku) { // Disable Knowledge Unit
      this.selectedKu.activeInd = 'N';
      this.kuService.updateKu(this.selectedKu)
            .subscribe(success => {
                this.getKus();
                this.toastr.success('KU updated Successfully');
                this.modalReference.close();
            },
            error => {
                if (error.errorCode == "DUPLICATE_ENTRY") {
                    this.toastr.error('Knowledge Unit already exists.');
                } else {
                    this.closeResult = `Dismissed ${this.getDismissReason('Error')}`;
                    this.toastr.error('Service Error');
                }
            });
    }

    enableKnowledgeUnit(ku) { // Enable Knowledge Unit
        this.selectedKu.activeInd = 'Y';
        this.kuService.updateKu(this.selectedKu)
            .subscribe(success => {
                this.getKus();
                this.toastr.success('KU updated Successfully');
                this.modalReference.close();
            },
            error => {
                if (error.errorCode == "DUPLICATE_ENTRY") {
                    this.toastr.error('Knowledge Unit already exists.');
                } else {
                    this.closeResult = `Dismissed ${this.getDismissReason('Error')}`;
                    this.toastr.error('Service Error');
                }
            });
    }

    exportKu(modaldownload) { // Export KU Data
      this.loading = true;
      this.kuService.getKuById(this.selectedKu.id)
          .subscribe(
          kus => {
              this.exportJson = kus;
              this.loading = false;
              this.modalReference = this.modalService.open(modaldownload, this.ngbModalOptions);
              this.modalReference.result.then((result) => {
                  this.closeResult = `Closed with: ${result}`;
              }, (reason) => {
                  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
              });
          },
          error => {
              this.loading = false;
          });
    }
    downloadKnowledgeUnit() {
      this.modalReference.close();
          if (this.exportJson.id) {
              this.exportFileName = this.exportJson.name + '.ku';
              const theJSON = JSON.stringify(this.exportJson);
              const file = new Blob([theJSON], { type: 'text/json;charset=utf-8' });
              importedSaveAs(file, this.exportFileName);
          }
    }

    import(importModal) { // import KU File upload modal
        this.modalReference = this.modalService.open(importModal, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    fileuploaderFileChange(event, modalimportNameChange) {   // file Upload Edit View For Duplicate Values
        this.viewEditTable = false;
        let file: File = null;
        let fileList: FileList = null;
        fileList = event.target.files;
        if (fileList.length > 0) {
            file = fileList[0];
            this.loading = true;
            this.dashboardService.getJson(file).subscribe(
                success => {
                    this.importJsonData = {};
                    this.entityCount = 0;
                    this.intentCount = 0;
                    this.viewEditTable = false;
                    this.importJsonData = success;
                    if (this.importJsonData.flag) {
                        this.viewEditTable = true;
                    }

                    for (const intent of this.importJsonData.intents) {
                        if (intent.flag) {
                            this.intentCount++;
                            this.viewEditTable = true;
                        }
                    }

                    if (this.viewEditTable) {
                      this.loading = false;
                      this.modalReference = this.modalService.open(modalimportNameChange);
                      this.modalReference.result.then((result) => {
                          this.closeResult = `Closed with: ${result}`;
                      }, (reason) => {
                          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                      });
                    } else {
                      this.saveImportKu(this.importJsonData);
                    }
                },
                error => {
                    if (error) {
                        this.toastr.error('File Corrupted');
                    }
                }
            );
        }
    }

    saveImportKu(ku) { // Save Import data
        this.loading = true;
        this.dashboardService.saveImportKu(ku)
            .subscribe(success => {
                this.loading = false;
                this.modalReference.close();
                this.getKus();
                this.toastr.success('KU Successfully Imported');
                this.viewEditTable = false;
            },
            error => {
                this.modalReference.close();
                this.viewEditTable = false;
                this.loading = false;
                this.toastr.error('Data is not imported properly please try again');
            });
    }

    validImportKu(ku, modalimportNameChange) {
      this.modalReference.close();
      this.viewEditTable = false;
      this.loading = true;
      this.dashboardService.validImportKu(ku)
          .subscribe(
            success => {
                this.entityCount = 0;
                this.intentCount = 0;
                this.viewEditTable = false;
                this.importJsonData = {};
                this.importJsonData = success;
                if (this.importJsonData.flag) {
                    this.viewEditTable = true;
                }

                for (const intent of this.importJsonData.intents) {
                    if (intent.flag) {
                        this.intentCount++;
                        this.viewEditTable = true;
                    }
                }

                if (this.viewEditTable) {
                  this.loading = false;
                  this.modalReference = this.modalService.open(modalimportNameChange);
                  this.modalReference.result.then((result) => {
                      this.closeResult = `Closed with: ${result}`;
                  }, (reason) => {
                      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                  });
                } else {
                  this.loading = true;
                  this.saveImportKu(this.importJsonData);
                }
            },
            error => {
                if (error) {
                    this.toastr.error('File Corrupted');
                }
            }
        );
    }

    // ****************************************** Intent ******************************************

    getIntentByKu(ku) { // get Intent By KU
        if (ku.id) {
            this.hideview = false;
            this.intents = [];
            this.selectedKu = ku;
            this.intentService.getIntentByKu(ku.id)
                .subscribe(
                intents => {
                    if (intents.length == 0) {
                        // this.router.navigate(['/mapping', {kuId: this.selectedKu.id}] );
                    } else {
                        this.loading = false;
                        if (this.intents.length != 0) {
                          this.intents = [...this.intents, intents];
                        } else {
                            this.intents = intents;
                        }
                    }
                },
                error => {
                    this.toastr.error('Service Error');
                })
        }
    }

    removeIntentModal(deleteIntent, removeIntentModal, intent) { // Remove Intent Modal Open - Warning Message Before Delete
        this.removeIntent = intent;
        this.modalReference = this.modalService.open(removeIntentModal, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    removeIntents() { // Remove Intent Mapping
        this.intentService.deleteIntentById(this.removeIntent.id)
            .subscribe(success => {
              this.getIntentByKu(this.selectedKu);
              this.removeIntent = null;
              this.modalReference.close();
              this.toastr.success('Intent Unit deleted successfully.');
              this.router.navigate(['/dashboard']);
            },
            error => {
                this.removeIntent = null;
                this.modalReference.close();
            });
    }

    deleteIntents() {
        this.deleteIntent(this.removeIntent.id);
    }

    deleteIntent(intentId) { // Delete Intent
        this.removeIntent.id = intentId;
        this.intentService.deleteIntentById(intentId)
            .subscribe(success => {
                this.getIntentByKu(this.selectedKu);
                this.removeIntent = null;
                this.modalReference.close();
                this.toastr.success('Intent Unit deleted successfully.');
                this.router.navigate(['/dashboard']);
            },
            error => {
            });
    }

    createIntentModal(intentCreateModal) { // Create intent modal
        this.isOpenPopOver = !this.isOpenPopOver;
        this.intent = {};
        this.keywords = [];
        this.postKeys = [];
        this.negaKeys = [];
        this.arabicPostKeys = [];
        this.arabicNegaKeys = [];
        this.modalReference = this.modalService.open(intentCreateModal, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    createIntent(intentName) { // check same set of keywords before create Intent
        this.loading = true;
        const names = [];
        const intentnames = Object.assign({}, this.intent);
        this.intent.keywords = this.keywords;
        this.intent.kuId = this.selectedKu.id;
        this.intent.name = intentName.name;
        this.intent.globalIdentifier = uuid();
        if (this.intent.arabicName) {
            names.push({ 'localeCode': 'ar', 'name': this.intent.arabicName })
        }
        names.push({ 'localeCode': 'en', 'name': this.intent.name })
        this.intent.names = names;
        this.intentService.checkIntent(this.intent).subscribe(success => {
            if (success.errorCode === "Keyword_Already_Exist") {
                this.toastr.error(success.errorDescription);
                this.loading = false;
            } else {
                this.createIntentsAfterkeywordCheck();
            }
        },
            error => {
                if (error.errorCode = "Keyword_Already_Exist") {
                    this.toastr.error(error.errorDescription);
                    this.loading = false;
                }
            });
    }

    createIntentsAfterkeywordCheck() {   // Create Intent After keyword Check
        this.intentService.createIntent(this.intent)
            .subscribe(success => {
                this.getIntentByKu(this.selectedKu);
                this.modalReference.close();
                this.toastr.success('Intent added Successfully');
                this.loading = false;
                this.modalReference.close();
                this.router.navigate(['/mapping', { intentId: success.id, kuId: this.selectedKu.id }]);
            },
            error => {
                if (error.errorCode === "INTENT_EXIST") {
                    this.toastr.error('Intent name already exists');
                    this.loading = false;
                    this.getIntentByKu(this.selectedKu);
                } else if (error.errorCode === "DUPLICATE_ENTRY") {
                      this.toastr.error('Intent name already exists');
                    this.loading = false;
                    this.getIntentByKu(this.selectedKu);
                } else if (error.errorCode === "KEYWORD_EXIST") {
                    this.toastr.error('Keyword already exists in the same Intent');
                    this.loading = false;
                    this.getIntentByKu(this.selectedKu);
                } else {
                    this.loading = false;
                    this.toastr.error('Service Error');
                }

            });
    }

    checkWithKeywordNames(intentname) {
        if (this.negaKeys.length != 0) {
            for (const key of this.negaKeys) {
                if (intentname.toLowerCase() == key.value) {
                    const index: number = this.negaKeys.indexOf(key);
                    this.negaKeys.splice(index, 1);
                    this.toastr.error('Intent Name will be added as postive or negative keywords');
                }
            }
        }
        if (this.postKeys.length != 0) {
            for (const key of this.postKeys) {
                if (intentname.toLowerCase() == key.value) {
                    const index: number = this.postKeys.indexOf(key);
                    this.postKeys.splice(index, 1);
                    this.toastr.error('Intent Name will be added as positive keyword, but not as negative keyword');
                }
            }
        }
    }

    createPosKeyword(postKeys) {   // Create positive keywords for Intent
        if (this.negaKeys.length != 0) {
            let keycount = 0;
            for (const key of this.negaKeys) {
                if (postKeys.value == key.value) {
                    const index: number = this.postKeys.indexOf(key);
                    this.postKeys.splice(index, 1);
                    this.toastr.error('Keyword already added in Negative Keywords');
                } else {
                    keycount++
                    if (this.negaKeys.length == keycount) {
                        this.keywords.push({
                            'id': null, 'keywordField': postKeys.value,
                            'polarity': 'P', 'intent': null, 'kuId': this.selectedKu.id, 'localeCode': "en"
                        })
                    }
                }
            }
        } else {
            this.keywords.push({
                'id': null, 'keywordField': postKeys.value,
                'polarity': 'P', 'intent': null, 'kuId': this.selectedKu.id, 'localeCode': "en"
            })
        }
    }

    createArabicPosKeyword(arabicPostKeys) {   // Create Arabic positive keywords for Intent
        if (this.arabicNegaKeys.length != 0) {
            let keycount = 0;
            for (const key of this.negaKeys) {
                if (arabicPostKeys.value == key.value) {
                    const index: number = this.arabicPostKeys.indexOf(key);
                    this.arabicPostKeys.splice(index, 1);
                    this.toastr.error('Keyword already added in Negative Keywords');
                } else {
                    keycount++
                    if (this.arabicNegaKeys.length == keycount) {
                        this.keywords.push({
                            'id': null, 'keywordField': arabicPostKeys.value,
                            'polarity': 'P', 'intent': null, 'kuId': this.selectedKu.id, 'localeCode': "ar"
                        })
                    }
                }
            }
        } else {
            this.keywords.push({
                'id': null, 'keywordField': arabicPostKeys.value,
                'polarity': 'P', 'intent': null, 'kuId': this.selectedKu.id, 'localeCode': "ar"
            });
        }
    }

    createNegKeyword(negaKeys) { // Create negative keywords for Intent
        const intentName = Object.assign(new Intent(), this.intent);
        if (negaKeys.value.toLowerCase() == intentName.name.toLowerCase()) {
            for (const key of this.negaKeys) {
                if (negaKeys.value == key.value) {
                    const index: number = this.negaKeys.indexOf(key);
                    this.negaKeys.splice(index, 1);
                }
            }
            this.toastr.error('Intent Name will be added as  postive keyword');
        } else {
            if (this.postKeys.length != 0) {
                let keycount = 0;
                for (const key of this.postKeys) {
                    if (negaKeys.value == key.value) {
                        const index: number = this.negaKeys.indexOf(key);
                        this.negaKeys.splice(index, 1);
                        this.toastr.error('Keyword already added in positive Keywords');
                        break;
                    } else {
                        keycount++;
                        if (keycount == this.postKeys.length) {
                            this.keywords.push({
                                'id': null, 'keywordField': negaKeys.value,
                                'polarity': 'N', 'intent': null, 'kuId': this.selectedKu.id, 'localeCode': "en"
                            })
                        }
                    }
                }
            } else {
                let keycount = 0;
                for (const key of this.negaKeys) {
                    if (negaKeys.value == key.value) {
                        const index: number = this.negaKeys.indexOf(key);
                        this.negaKeys.splice(index, 1);
                        break;
                    } else {
                        keycount++;
                        if (keycount == this.negaKeys.length) {
                            this.keywords.push({
                                'id': null, 'keywordField': negaKeys.value,
                                'polarity': 'N', 'intent': null, 'kuId': this.selectedKu.id, 'localeCode': "en"
                            })
                        }
                    }
                }
            }
        }
    }

    createArabicNegKeyword(arabicNegaKeys) {   // Create Arabic negative keywords for Intent
        if (this.arabicPostKeys.length != 0) {
            let keycount = 0;
            for (const key of this.arabicPostKeys) {
                if (arabicNegaKeys.value == key.value) {
                    const index: number = this.negaKeys.indexOf(key);
                    this.negaKeys.splice(index, 1);
                    this.toastr.error('Keyword already added in positive Keywords');
                    break;
                } else {
                    keycount++;
                    if (keycount == this.arabicPostKeys.length) {
                        this.keywords.push({
                            'id': null, 'keywordField': arabicNegaKeys.value,
                            'polarity': 'N', 'intent': null, 'kuId': this.selectedKu.id, 'localeCode': "ar"
                        })
                    }
                }
            }
        } else {
            let keycount = 0;
            for (const key of this.negaKeys) {
                if (arabicNegaKeys.value == key.value) {
                    const index: number = this.negaKeys.indexOf(key);
                    this.negaKeys.splice(index, 1);
                    break;
                } else {
                    keycount++;
                    if (keycount == this.negaKeys.length) {
                        this.keywords.push({
                            'id': null, 'keywordField': arabicNegaKeys.value,
                            'polarity': 'N', 'intent': null, 'kuId': this.selectedKu.id, 'localeCode': "ar"
                        })
                    }
                }
            }
        }
    }

    sliceKeywordFromList(key) {   // delete keywords
        for (const keyword of this.keywords) {
            if (keyword.keywordField == key.value) {
                const index: number = this.keywords.indexOf(keyword);
                this.keywords.splice(index, 1);
            }
        }
    }

    checkArabicCreateIntent() {
        this.createIntentLangWarning = false;
        if ((this.intent.arabicName == undefined || this.intent.arabicName == "" || this.intent.arabicName == null)
            && (this.intent.name)) {
            this.createIntentLangWarning = true;
        }
        if (this.postKeys.length > 0 && this.arabicPostKeys.length == 0) {
            this.createIntentLangWarning = true;
        }
        if (this.negaKeys.length > 0 && this.arabicNegaKeys.length == 0) {
            this.createIntentLangWarning = true;
        }
    }
}
