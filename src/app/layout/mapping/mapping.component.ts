'use strict';
import { Component, OnInit, ViewContainerRef, HostListener, ElementRef, Input, Output, EventEmitter, ViewChild, Renderer2 } from '@angular/core';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { routerTransition } from '../../router.animations';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { NgbModal, NgbActiveModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TabsetComponent, ModalDirective } from 'ngx-bootstrap';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Http } from '@angular/http';

import { DashboardService } from '../../shared/services/dashboard.service';
import { IntentService } from '../../shared/services/intent.service';
import { MessageService } from '../../shared/services/message.service';
import { EntityService } from '../../shared/services/entity.service';
import { ServiceActionService } from '../../shared/services/service-action.service';
import { KuService } from '../../shared/services/ku.service';
import { ReService } from '../../shared/services/re.service';
import { SettingsService } from '../../shared/services/settings.service';

import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

import { EntityDetails } from '../../models/entitydetails';
import { EntityType } from '../../models/entitytype';
import { Ku } from '../../models/ku';
import { Questions } from '../../models/questions';
import { Keywords } from '../../models/keywords';
import { RegularExpression } from '../../models/regularexpression';
import { Action } from '../../models/action';
import { Intent } from '../../models/intent';
import { ErrorResponses } from '../../models/responses';
import { Response } from '../../models/response';
import { saveAs as importedSaveAs } from "file-saver";
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import * as go from 'gojs';
import { v4 as uuid } from 'uuid';

@Component({
    selector: 'app-mapping',
    templateUrl: './mapping.component.html',
    styleUrls: ['./mapping.component.scss'],
    providers: [DashboardService, KuService, ReService, ToastsManager, ToastOptions, SidebarComponent,
        NgbActiveModal, IntentService, EntityService, ServiceActionService, SettingsService, MessageService],
    animations: [routerTransition()]

})
export class MappingComponent implements OnInit {

    // UI Variables

    loading = false; // loading screen true or false
    rightSideView: any; // show right side view
    viewIntent: boolean; // view intent for update
    viewEntity: boolean; // view Entity for update
    viewAction: boolean; // view Action for update
    viewResponse: boolean; // view Response for update
    viewDecision: boolean; // view Decision for update

    enableArabicLang: boolean; // enable-disable arabic english view

    insideEntity: boolean; // click inside Entity
    insideIntent: boolean; // click inside Intent
    insideAction: boolean; // click inside Action
    insideResponse: boolean; // click inside Response
    insideDecision: boolean; // click inside Decision

    errorMessage: string; // error Messages

    closeResult: string; // modal close Result
    modalReference: any; // modal Reference

    ngbModalOptions: NgbModalOptions = { backdrop: 'static', keyboard: true }; // modal options to avoid outside click

    // tag-input validations

    public validators = [this.tagValidation, this.length];  // english validation

    public arabicValidators = [this.tagValidationArabic, this.length]; // arabic validation

    public arabicGenValidators = [this.tagQuestionsValidationArabic]

    public genValidators = [this.tagQuestionsValidationValidation]

    public errorMessages = { //  english Error Messages tag-input
        'errorMessage': 'Keywords can have only letters numbers',
        'length': ' Limit Reached - maximum 25 letters '
    };

    public arabicErrorMessages = { //  arabic Error Messages tag-input
        'errorMessage': 'Keywords can have only Arabic letters numbers',
        'length': ' Limit Reached - maximum 25 letters '
    };

    // Knowledge Unit Variables

    selectedKu: Ku = new Ku(); // selected ku value Init

    // Intent  Variables

    selectedIntent: Intent; // selected Intent object
    intent: any;  // intent object
    intentName: any; // error

    updateIntentLangWarning: boolean; // language warining icon view in update Intent
    createIntentLangWarning: boolean; // language warining icon view in create Intent

    // Intent - keywords

    updatePostKeys = []; // array of updated postive keywords
    updateNegaKeys = []; // array of updated negative keywords

    // Entity  Variables

    entityTypeLst: EntityType[]; // entity type list
    entity: any = {}; // entity object
    entityNew: EntityDetails = new EntityDetails(); // new entity object

    selectedEntitys: any = []; // list of entities data to show in acion

    entityArabicExample: string; // example string for english
    entityEnglishExample: string; // example string for arabic

    updateEntityLangWarning: boolean; // language warining icon view in update Entity
    createEntityLangWarning: boolean; // language warining icon view in create Entity

    updateEntityActionLangWarning: boolean; // language warining icon view in update Entity
    createEntityActionLangWarning: boolean; // language warining icon view in create Entity

    entityButtonText: any; // button text of Entity List
    entityQuestionSubTitle: any; // question sub Title of Entity List
    entityQuestionTitle: any; // question  title of Entity List
    entityImageUrl: any; // question  image url of Entity List

    // entity - questions
    questionsTag = []; // tag questions array view

    // Regular Expression
    showAddRegExModal: boolean; // modal view for crete Regular Expression
    regEx: RegularExpression; // regexs object for create

    mapRE: any = {}; // remove it based on condition c
    mapRegExs: RegularExpression[] = [];

    regExLst: RegularExpression[]; // list of all reg exs
    dropdownList: any = []; // list of all regexs in UI object

    // Mapping  Variables

    currentDiagram: any = {}; // the gojs json diagram object
    model = new go.GraphLinksModel(); // model object for creating mapping diagram
    node: go.Node; // gojs node object
    link: go.Link; // gojs link object
    lastNodeSelected: go.Node; // last node selected
    nodeDataArray: any;
    linkDataArray: any;

    workflowJson: any; // workflow diagram json object
    workflowId: any; // workflow diagram id
    workflowSequence: any = {};

    // validation Objects
    successObject: any; // get all data
    viewEditTable: boolean; // hide and show importKu intent table

    // Action  Variables

    callMethods = ['POST', 'GET']; // call methods  not for now ->'DELETE', 'PUT'
    selectedActions: any = [];
    serviceType = ['json', 'multipart/form-data', 'x-www-form-urlencoded'];
    importType = ['TEXT', 'FILE']
    // Response - Message Variables

    selectedResponses: Response[] = []; // Response array
    selectedMessages: any; // selected message node

    // KU  Variables

    ku: Ku = new Ku();
    selectedKuId: any;

    // Decision  Variables

    beg: any;
    operators = ['>', '<', '>=', '<=', '=', '!=']; // operators
    decisionConditions = [];
    selectedDecision: any = {};
    conditions = [];
    showError: any;

    exp: any
    i: any


    importJsonData: any = {};

    public keywords: Keywords[] = [];
    postKeys = [];
    negaKeys = [];
    arabicPostKeys = [];
    arabicNegaKeys = [];
    intents: Intent[];
    intentspage: Intent[];

    updateInt: Intent;

    maps: any = [];

    selectedEnitiyFlowChartId: any;

    errorMessageRegExs: any;
    arabicErrorMessageRegExs: any;
    updateRegexLangWarning: boolean;


    action: any = {};
    actionsPage: Action[] = [];
    selectedAction: any = {};
    selectedActionId: any = {};
    updateAction: Action = new Action();
    requestBodySample: any = '{"authCode":"[AccessCode]", "language":"[langCode]",  "nol":{ "number":"%1%","amount":"%2%" }}';

    er: any = {};
    erResponses: any = [];
    erResponse: ErrorResponses;

    errorResponses: ErrorResponses = new ErrorResponses();

    response: Response;
    resp: Response[] = [];
    updateResps: Response[] = [];
    deleteResps: any[] = [];
    editResponses: any;
    res: any = {};
    updateRes: any = {};
    resTag: any[] = [];
    resArabicTag: any[] = [];
    responseNodeKey: any;

    entityEnglishRequestBody: string;
    entityEnglishActionUrl: string;
    entityArabicRequestBody: string;
    entityArabicActionUrl: string;
    arabicActionUrl: string;
    arabicActionRequestBody: string;
    entityAction: any = {};
    entityCopy: any = {};
    selectedEntity: any = {};
    updateEntity = new EntityDetails();
    entityWorkflow = new EntityDetails();
    removeEntity: any = {};
    removeIntent: any = {};
    removeEntityIndex: number;
    editEntityKey: any;
    editEntityKeyName: any;
    entityRequired: boolean;
    newEntity: boolean;
    showRegExWarningMessage: boolean;

    questions: any = [];
    updateQuestions: any = [];

    questionsArabicTag = [];
    questionsTags = [];
    selectedMaps: any; // remove
    hideKuTab: boolean;
    isClickedIntent: any;
    isActive = false;
    showMenu = '';
    entityTypeSelected = 'GEN';
    intialModalView: boolean;

    selectedItems: any = [];
    dropdownSettings: any = {};

    actionConfirmMessageArabic: string
    actionConfirmMessageEnglish: string

    updateActionLangWarning: boolean;
    createActionLangWarning: boolean;

    updateActionUrlLangWarning: boolean;
    createActionUrlLangWarning: boolean;

    updateResponseLangWarning: boolean;
    createResponseLangWarning: boolean;

    header: any = {};
    headers: any = [];
    requestParam: any = {};
    requestParamArr: any = [];

    actionEntityError: boolean;
    closeBracketError: boolean;

    stack = new go.List(go.Node);
    coll = new go.List(go.Node);
    source: go.Node;



    @ViewChild('removeEntity')
    private removeEntityModalTemplate: ElementRef;

    @ViewChild('removeAction')
    private removeActionModalTemplate: ElementRef;

    @ViewChild('removeResponseModal')
    private removeResponseModalTemplate: ElementRef;

    @ViewChild('removeIntent')
    private removeIntentModalTemplate: ElementRef;

    @ViewChild('removeDecision')
    private removeDecisionModalTemplate: ElementRef;

    @ViewChild('removeMappingModal')
    private removeMappingModal: ElementRef; // remove Mapping modal

    @ViewChild('removeIntentMappingModal')
    private removeIntentMappingModal: ElementRef; // remove Intent Mapping modal

    @ViewChild('createEntityModal')
    private createEntityModal: ElementRef; // create Entity modal

    @ViewChild('createAction')
    private createActionModal: ElementRef; // create Action modal

    @ViewChild('createResponse')
    private createResponseModal: ElementRef; // create Response modal

    @ViewChild('createDecision')
    public createDecisionModal: ElementRef; // create Decision modal

    @ViewChild('domElementId') inlineEditControl: ElementRef;

    @HostListener('document:keyup', ['$event']) handleKeyUp(event) { // escape key to close modal
        if (event.keyCode === 27) {
            if (this.node) {
                if (this.node.data.intent || this.node.data.entity || this.node.data.action || this.node.data.response) {
                    this.modalReference.close();
                } else {
                    this.modalReference.close();
                    this.removeObject();
                }
            }

        }
    }

    constructor(
        private route: ActivatedRoute,
        private saService: ServiceActionService,
        private dashboardService: DashboardService,
        private entityService: EntityService,
        private kuService: KuService,
        private settingsService: SettingsService,
        private reService: ReService,
        private router: Router,
        private sanitizer: DomSanitizer,
        public activeModal: NgbActiveModal,
        private modalService: NgbModal,
        private intentService: IntentService,
        private messageService: MessageService,
        public toastr: ToastsManager,
        private _scrollToService: ScrollToService,
        private http: Http,
        private sidebar: SidebarComponent,
        private renderer: Renderer2,
        vcr: ViewContainerRef) {

        this.toastr.setRootViewContainerRef(vcr);   // toster ViewContainerRef
        this.getLanguages(); // get languages

        this.route.params.subscribe(params => {   // params values from url
            const intent = params['intentId'];
            const kuId = params['kuId'];
            if (intent == "undefined" && kuId != "undefined") {
                this.rightSideView = false; // hide view
                this.selectedIntent = null; // selected Intent clear
                this.clearMapping(); // clear current view
                this.selectedKuId = params['kuId'];
                this.getKuById(this.selectedKuId);
            } else if (intent != undefined && kuId != undefined) {
                this.getIntentById(params['intentId']);
                this.selectedKuId = params['kuId'];
                this.getKuById(this.selectedKuId);
            } else if (kuId) {
                this.getKuById(kuId);
            }
        });
    }

    // **************************************--->UI FUNCTIONS<----*******************************************


    closeRightView() { // close current side view
        this.rightSideView = false;
        this.node.isSelected = false;
    }

    closeModal() { // close modal button
        this.modalReference.close();
        this.viewEditTable = false;
    }

    getLanguages() { // get language
        this.settingsService.getLanguages()
            .subscribe(success => {
                this.enableArabicLang = success.arabic;
                localStorage.setItem("arabicLang", success.arabic)
            },
                error => {
                    this.toastr.error("Service Error")
                });
    }

    tagValidation(control: FormControl) { // tag-input english validations

        const EMAIL_REGEXP = /^[A-Za-z0-9' ]*$/;

        const value = EMAIL_REGEXP.test(control.value) ? null : true;
        if (value) {
            return {
                'errorMessage': true
            };
        } else {
            return null;
        }
    }

    tagQuestionsValidationValidation(control: FormControl) { // tag-input english validations

        const EMAIL_REGEXP = /^[A-Za-z0-9',?!-!@%$%^#&*()_+|~=`{}:";'<>?,. ]*$/;

        const value = EMAIL_REGEXP.test(control.value) ? null : true;
        if (value) {
            return {
                'errorMessage': true
            };
        } else {
            return null;
        }
    }

    tagValidationArabic(control: FormControl) {  // tag-input arabic validations

        const EMAIL_REGEXP = /^(?:[0-9\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF])){0,1000}$/;
        const value = EMAIL_REGEXP.test(control.value) ? null : true;
        if (value) {
            return {
                'errorMessage': true
            };
        } else {
            return null;
        }
    }

    tagQuestionsValidationArabic(control: FormControl) {  // tag-input arabic validations

        const EMAIL_REGEXP = /^(?:[0-9\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF ',?!-!@%$#%^&*()_+|~=`{}:";'<>?,.]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF])){0,1000}$/;
        const value = EMAIL_REGEXP.test(control.value) ? null : true;
        if (value) {
            return {
                'errorMessage': true
            };
        } else {
            return null;
        }
    }

    length(control: FormControl) { // tag-input length validations
        if (control.value.length >= 25) {
            return {
                'length': true
            };
        }
        return null;
    }

    triggerScrollTo(element) { // scroll view based on sidebar
        const config: ScrollToConfigOptions = {
            target: element
        };
        this._scrollToService.scrollTo(config);
    }

    changeTagOnAdding(tag) { // tag - input change the word to lower case
        tag.toLowerCase(tag)
        return Observable.of(tag.toLowerCase(tag));
    }

    clearMapping() { // clear current diagram view
        this.model = new go.GraphLinksModel();
        this.model.linkFromPortIdProperty = "fromPort";
        this.model.linkToPortIdProperty = "toPort",
            this.model.nodeDataArray = [];
        this.model.linkDataArray = [];
    }

    getDismissReason(reason: any): string { // close modal reason
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    close(data) { // close right side view
        if (data == 'viewResponse') {
            this.viewResponse = false;
            this.hideKuTab = true
        }
        if (data == 'viewEntity') {
            this.viewEntity = false;
            this.hideKuTab = true
        }
        if (data == 'viewAction') {
            this.viewAction = false;
            this.hideKuTab = true
        }
        if (data == 'viewIntent') {
            this.viewIntent = false;
            this.hideKuTab = true
        }
        if (data == 'viewDecision') {
            this.viewDecision = false;
            this.hideKuTab = true
        }
    }

    // **************************************--->DECISION FUNCTIONS<----*******************************************


    converStringToCode(value): any {
      for (const data of this.nodeDataArray) {
          if (data.modelid == 2) {
              this.conditions.push({ name: data.text })
              value = value.replace(new RegExp(data.text, 'g'), "#%" + data.id + "%#");
          }
          if (data.modelid == 3) {
              this.conditions.push({ name: data.text })
              value = value.replace( new RegExp(data.text, 'g') , "#@" + data.id + "@#");
          }
      }

       value = value.replace( new RegExp('AND', 'g') , "&&");
       value = value.replace( new RegExp('and', 'g') , "&&");
       value = value.replace( new RegExp('OR', 'g') , "||");
       value = value.replace( new RegExp('or', 'g') , "||");
       value = value.replace( new RegExp('=', 'g') , "==");

       return value;

    }

    converCodeToString(value): any {
      for (const data of this.nodeDataArray) {
          if (data.modelid == 2) {
              this.conditions.push({ name: data.text })
              value = value.replace(new RegExp("#%" + data.entity.id + "%#", 'g'), data.text);
          }
          if (data.modelid == 3) {
              this.conditions.push({ name: data.text })
              value = value.replace(new RegExp("#@" + data.id + "@#", 'g'), data.text);
          }
      }

       value = value.replace(/&&/g , "and");
       value = value.replace(/\|\|/g , "or");
       value = value.replace(/==/g , "=");

       return value;

    }


    createNewDecision(exp) {

      exp = this.converStringToCode(exp);
      console.log(exp)
        // create workflow Sequence object
        this.workflowSequence.workflowId = this.workflowId;
        this.workflowSequence.workflowSequenceKey = this.node.key;
        this.workflowSequence.intentId = this.selectedIntent.id;
        this.workflowSequence.entryType = "DIAMOND";
        this.workflowSequence.entryExpression = exp;
        this.workflowSequence.primaryDestWorkflowId = this.workflowId;
        this.workflowSequence.primaryDestSequenceKey = null;
        this.workflowSequence.secondaryDestWorkflowId = null;
        this.workflowSequence.secondaryDestSequenceKey = null;
        this.workflowSequence.terminalType = null;
        this.workflowSequence.required = "Y";
        this.workflowSequence.kuId = this.selectedKuId;
        this.dashboardService.createWorkflowSequence(this.workflowSequence)
            .subscribe(successObject => {
                this.onCommitDetailsDecision(this.workflowSequence);
            },
                errorCode => {
                    if (errorCode.errorCode == "INVALIDREQUEST") {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    } else {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });
        this.modalReference.close();
    }

    updateDecision(exp) {
        this.conditions = [];
        exp = this.converStringToCode(exp);
        console.log(exp)
        this.workflowSequence.id = this.selectedDecision.workflowSequenceModel.id
        this.workflowSequence.workflowId = this.selectedDecision.workflowSequenceModel.workflowId;
        this.workflowSequence.workflowSequenceKey = this.selectedDecision.workflowSequenceModel.workflowSequenceKey;
        this.workflowSequence.intentId = this.selectedIntent.id;
        this.workflowSequence.entryType = this.selectedDecision.workflowSequenceModel.entryType;
        this.workflowSequence.entryExpression = exp;
        this.workflowSequence.primaryDestWorkflowId = this.workflowId;
        this.workflowSequence.primaryDestSequenceKey = this.selectedDecision.workflowSequenceModel.primaryDestSequenceKey;
        this.workflowSequence.secondaryDestWorkflowId = this.selectedDecision.workflowSequenceModel.secondaryDestWorkflowId;
        this.workflowSequence.secondaryDestSequenceKey = this.selectedDecision.workflowSequenceModel.secondaryDestSequenceKey;
        this.workflowSequence.terminalType = null;
        this.workflowSequence.required = "Y";
        this.workflowSequence.kuId = this.selectedKuId;
        this.updateWorkflowSequence(this.workflowSequence);
        this.onCommitDetailsDecision(this.workflowSequence);
    }

    onCommitDetailsDecision(decision) { // workflow json decision update
        if (this.node) {
            if (this.node.diagram != undefined && this.node.diagram != null) {
                const model = this.node.diagram.model;
                model.startTransaction();
                model.setDataProperty(this.node.data, "text", "Condition");
                if (decision.globalIdentifier !== null) {
                    model.setDataProperty(this.node.data, "key", this.node.key);
                }
                model.setDataProperty(this.node.data, "decision", { "workflowSequenceModel": decision });
                this.node.diagram.contentAlignment = go.Spot["Top"];
                model.commitTransaction("modified properties");
                this.currentDiagram = this.node.diagram;
                this.updateWorkflow();
            }
        }
    }

    onClickedOutsideDecision(event) {  // click Outside Responses Side Bar
        if (this.insideDecision === true) {
            if (this.exp == "" && this.exp == undefined) {
                this.toastr.error('Add expression');
            } else {
                this.updateDecision(this.exp);
            }
            this.insideDecision = false;
        }
    }

    onClickedInsideDecision() {  // click Insde Responses Side Bar
        this.insideDecision = true;
    }

    removeDecisionModalTemp() { // Decision delete warining modal
        if (this.workflowId) {
            this.modalReference = this.modalService.open(this.removeDecisionModalTemplate, this.ngbModalOptions);
            this.modalReference.result.then((result) => {
                this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
        }
    }

    deleteDecision() { // Decision delete
        this.node.data.modelid = 100;
        this.node.diagram.commandHandler.deleteSelection();
        this.dashboardService.deleteWorkflowSequence(this.selectedDecision.workflowSequenceModel.id)
            .subscribe(successCode => {
                this.successObject = successCode;
                if (this.successObject == 203) {
                } else {
                    this.modalReference.close();
                    this.toastr.success('Decision Removed Successfully');
                    this.close('viewDecision');
                }
            },
                errorCode => {
                    this.modalReference.close();
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });
    }

    // **************************************--->KU<----*****************************************************

    getKuById(kuId) { // get Ku Data By ku Id
        this.kuService.getKuById(kuId)
            .subscribe(
                ku => {
                    this.selectedKu = ku;
                    this.selectedKuId = ku.id;
                    this.getEntityTypeLst();
                    this.getReLst();
                },
                error => {
                    this.loading = false;
                })
    }

    // **************************************--->WORKFLOW <----******************************************

    getWorkflow(intent) { // get Workflow Data By Intent first time
        this.loading = true;
        this.rightSideView = false; // sidebar div
        this.workflowId = null; // workflow id
        this.workflowJson = null; // workflow json

        this.viewAction = false;
        this.viewIntent = false;
        this.viewResponse = false;
        this.viewEntity = false;
        this.viewDecision = false


        this.keywords = [];
        this.updatePostKeys = [];
        this.updateNegaKeys = [];

        this.node = new go.Node;
        this.link = new go.Link;
        this.clearMapping();
        if (this.node) {
            if (this.node.diagram) {
                this.node.diagram.allowDrop = true;
                this.node.diagram.allowDelete = true;
            }
        }
        this.dashboardService.getWorkFlow(intent.id)
            .subscribe(
                workflowJson => {
                    this.workflowJson = workflowJson;
                    this.workflowId = this.workflowJson.id;
                    if (this.workflowJson.id) {
                        if (this.workflowJson.metaData.nodeDataArray.length != 0) {
                            this.model.linkFromPortIdProperty = "fromPort";
                            this.model.linkToPortIdProperty = "toPort";
                            this.model.nodeDataArray = this.workflowJson.metaData.nodeDataArray;
                            this.nodeDataArray = this.workflowJson.metaData.nodeDataArray;
                            this.model.linkDataArray = this.workflowJson.metaData.linkDataArray;
                            this.linkDataArray = this.workflowJson.metaData.linkDataArray;
                            this.entitiesList(this.model.nodeDataArray);
                            this.actionsList(this.model.nodeDataArray);
                            this.selectIntentNode(this.model.nodeDataArray);
                            this.loadDecisionValues(this.model.nodeDataArray);
                            this.loading = false;
                        } else {
                            this.toastr.error('The Work flow is not proper Please update it ');
                        }
                    } else {
                        this.createWorkFlow(intent); // create new diagram
                        this.workflowId = null;
                        this.workflowJson = null;
                    }

                },
                error => {
                    this.loading = false;
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                    this.clearMapping();
                });
    }

    getUpdatedWorkFlow(intent) { // get workflow json when updating UI from mapping view
        this.node = new go.Node;
        this.link = new go.Link;
        this.loading = true;
        this.dashboardService.getWorkFlow(intent.id)
            .subscribe(
                workflowJson => {
                    this.loading = false;
                    this.workflowJson = workflowJson;
                    if (this.workflowJson.id) {
                        this.workflowId = this.workflowJson.id;
                        if (this.workflowJson.metaData.nodeDataArray.length != 0) {
                            this.model.linkFromPortIdProperty = "fromPort";
                            this.model.linkToPortIdProperty = "toPort";
                            this.model.nodeDataArray = this.workflowJson.metaData.nodeDataArray;
                            this.model.linkDataArray = this.workflowJson.metaData.linkDataArray;
                            this.lastNodeSelected.isSelected = true;
                            this.lastNodeSelected.selectionAdorned = true;
                            if (this.currentDiagram != null) {
                                this.currentDiagram.select(this.currentDiagram.findNodeForKey(this.lastNodeSelected.data.key));
                            }
                            this.entitiesList(this.model.nodeDataArray);
                            this.actionsList(this.model.nodeDataArray);
                            this.loadDecisionValues(this.model.nodeDataArray);
                        } else {
                            this.toastr.error('The Work flow is not proper Please update it ');
                        }
                    } else {
                        this.workflowId = null;
                        this.workflowJson = null;
                    }

                },
                error => {
                    this.loading = false;
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });
    }

    createWorkFlow(intents) { // create new workflow diagram
        this.model = new go.GraphLinksModel();
        this.model.linkFromPortIdProperty = "fromPort";
        this.model.linkToPortIdProperty = "toPort",
            this.model.nodeDataArray = [{
                modelid: 5, text: intents.name, id: intents.id, key: intents.globalIdentifier,
                category: "Intent", from: true, intent: intents, loc: "300 30"
            }];
        this.selectedIntent = intents;
        this.model.linkDataArray = [];
        this.dashboardService.createWorkFlow(this.selectedIntent, this.model.toJson())
            .subscribe(successObject => {
                if (this.successObject == 203) {
                    this.toastr.error('FLOWCHART  already exists.');
                } else {
                    this.workflowId = successObject.id
                    this.getWorkflow(this.selectedIntent);
                }
            },
                errorCode => {
                    if (errorCode.errorCode == "WORKFLOW_MAPPED") {
                    } else if (errorCode.errorCode == " INVALIDREQUEST") {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    } else {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });
    }

    updateWorkflow() { // update workflow json
        if (this.workflowId && this.selectedIntent && this.currentDiagram != null) {
            this.dashboardService.flowchartUpdate(this.workflowId, this.selectedIntent, this.currentDiagram.model.toJson())
                .subscribe(successObject => {
                    this.getUpdatedWorkFlow(this.selectedIntent);
                    this.insideEntity = false;
                    this.insideIntent = false;
                    this.insideAction = false;
                    this.insideResponse = false;
                },
                    errorCode => {
                        if (errorCode.errorCode == "INVALIDREQUEST") {
                            this.toastr.error('Service Error', null, { toastLife: 800 });
                        } else if (errorCode.errorCode == "WORKFLOW_MAPPED") {
                            this.toastr.error('This intent is already mapped with another flowchart.');
                        } else {
                            this.toastr.error('Service Error', null, { toastLife: 800 });
                        }
                    });
        }
    }

    deleteWorkflow() { // delete workflow
        this.dashboardService.deleteWorkflow(this.workflowId)
            .subscribe(successCode => {
                this.successObject = successCode;
                if (this.successObject === 203) {
                } else {
                    this.close('viewIntent');
                    this.removeEntity = null;
                    this.selectedEntitys = [];
                    this.selectedActions = [];
                    this.workflowJson = null;
                    this.removeIntent = null;
                    this.workflowId = null;
                    this.model = new go.GraphLinksModel();
                    this.model.linkFromPortIdProperty = "fromPort";
                    this.model.linkToPortIdProperty = "toPort",
                        this.model.nodeDataArray = [];
                    this.model.linkDataArray = [];
                    this.toastr.success('Intent Removed Successfully');
                    this.modalReference.close();
                }
            },
                errorCode => {
                    this.toastr.error('Something went wrong in flowchart');
                });
    }

    removeObject() { // delete current node
        if (this.node.diagram) {
            this.modalReference.close();
            this.viewEditTable = false;
            this.node.data.modelid = 100;
            this.node.diagram.commandHandler.deleteSelection();
            this.currentDiagram = this.node.diagram;
        }
    }

    createWorkflowSequence(workflowSequence) { // create workflow Sequence
        this.dashboardService.createWorkflowSequence(workflowSequence)
            .subscribe(successObject => {
            },
                errorCode => {
                    if (errorCode.errorCode == "INVALIDREQUEST") {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    } else {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });
    }

    updateWorkflowSequence(workflowSequence) { // update workflow Sequence
        this.dashboardService.updateWorkflowSequence(workflowSequence)
            .subscribe(successObject => {

            },
                errorCode => {
                    if (errorCode.errorCode == "INVALIDREQUEST") {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    } else {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });
    }

    removeIntentMapping() { // remove intent mapping link
        if (this.link.data.modelid == 1) {
            this.currentDiagram = this.link.toNode.diagram;
            const key = this.link.data.fromNode.workflowSequenceKey;
            const entryExpression = this.link.data.fromNode.entryExpression;
            this.link.data.modelid = 100;
            this.link.diagram.commandHandler.deleteSelection();
            this.dashboardService.removeIntentMapping(this.selectedIntent.id, key, entryExpression)
                .subscribe(successCode => {
                    this.successObject = successCode;
                    if (this.successObject == 203) {
                    } else {
                        this.modalReference.close();
                        this.toastr.success('Entity Mapping Remove Successfully');
                    }
                },
                    errorCode => {
                        this.modalReference.close();
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    });
        }
    }

    removeMapping() { // remove mapping link
        let flag = "Y";
        if (this.link.data.modelid == 11) {
            flag = "Y";
        } else if (this.link.data.modelid == 12) {
            flag = "N";
        }
        const key = this.link.data.fromNode.workflowSequenceKey;
        const toNodeData = this.link.toNode;
        this.currentDiagram = this.link.toNode.diagram;
        this.link.data.modelid = 100;
        this.link.diagram.commandHandler.deleteSelection();
        this.dashboardService.removeMapping(key, flag, this.selectedIntent.id)
            .subscribe(successCode => {
                this.successObject = successCode;
                if (this.successObject == 203) {
                } else {
                    this.modalReference.close();
                    this.toastr.success('Entity Mapping Remove Successfully');
                    this.close('viewEntity');
                }
            },
                errorCode => {
                    this.modalReference.close();
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });

    }

    removeMappingModalTemp() { // warining modal message before delete mapping link
        this.modalReference = this.modalService.open(this.removeMappingModal, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    removeIntentMappingModalTemp() {  // warining modal message before delete mapping intent link
        this.modalReference = this.modalService.open(this.removeIntentMappingModal, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    selectIntentNode(nodeDataArray) { // intent node will be selected as default

        for (const nodeData of nodeDataArray) {
            if (nodeData.modelid == 5) {
                this.currentDiagram.select(this.currentDiagram.findNodeForKey(nodeData.key));
            }
        }
    }

    // **************************************--->GOJS MAPPING FUNCTIONS<----*********************************

    onlinkDrawn(e) { // mapping link between two node
        if (e.subject.fromPortId == "intentBottom" && e.subject.toPortId == "entityTop") { // Intent Entity
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.toNode.data.entity.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.entity.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.entity.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.entity.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 1);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            const mod = e.subject.toNode.diagram.model;
            mod.startTransaction();
            mod.setDataProperty(e.subject.toNode.data, "order", true);
            mod.setDataProperty(e.subject.toNode.data, "orderId", 1);
            model.setDataProperty(e.subject.data, "visible", false);
            mod.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.toNode.data.entity.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.toNode.data.entity.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.toNode.data.entity.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ENTITY";
            this.workflowSequence.entryExpression = e.subject.toNode.data.entity.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.entity.workflowSequence.primaryDestSequenceKey;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            // START for first link
            this.workflowSequence.terminalType = "START";
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "entityBottom" && e.subject.toPortId == "entityTop") { // Entity Entity
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.entity.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.entity.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.key, "entryExpression": e.subject.toNode.data.entity.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.entity.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.entity.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.entity.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ENTITY";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.entity.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.entity.workflowSequence.terminalType;
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "entityBottom" && e.subject.toPortId == "actionTop") { // Entity Action
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.entity.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.entity.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.action.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.entity.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.entity.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.entity.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ENTITY";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.entity.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.entity.workflowSequence.terminalType;
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "intentBottom" && e.subject.toPortId == "actionTop") { // Intent Action
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.toNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.action.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.action.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 1);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.toNode.data.action.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.toNode.data.action.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.toNode.data.action.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ACTION";
            this.workflowSequence.entryExpression = e.subject.toNode.data.action.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.action.workflowSequence.primaryDestSequenceKey;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            // START for first link
            this.workflowSequence.terminalType = "START";
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "intentBottom" && e.subject.toPortId == "responseTop") { // Intent Response
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.toNode.data.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 1);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.toNode.data.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.toNode.data.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.toNode.data.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "MESSAGE";
            this.workflowSequence.entryExpression = e.subject.toNode.data.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.workflowSequence.primaryDestSequenceKey;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            // START for first link
            this.workflowSequence.terminalType = "START";
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "actionBottom" && e.subject.toPortId == "responseTop") { // Action Response
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.action.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");

            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.action.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.action.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ACTION";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.action.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.action.workflowSequence.terminalType;
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "entityBottom" && e.subject.toPortId == "responseTop") {  // Entity Response
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.entity.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.entity.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.entity.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.entity.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.entity.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ENTITY";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.entity.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.entity.workflowSequence.terminalType;
            this.workflowSequence.required = "Y"
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "actionBottom" && e.subject.toPortId == "entityTop") {  // Action Entity
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.action.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.entity.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.entity.workflowSequence.entryExpression };
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");

            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.action.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.action.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ACTION";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.action.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.action.workflowSequence.terminalType;
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "actionBottom" && e.subject.toPortId == "actionTop") { // Action Action
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.action.workflowSequence.terminalType };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.action.workflowSequence.terminalType };
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");

            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.action.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.action.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ACTION";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.action.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.action.workflowSequence.terminalType;
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.toPortId == "responseTop" && e.subject.fromPortId == "responseBottom") { // Response Top to Response Bottom
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "MESSAGE";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.workflowSequence.terminalType;
            this.workflowSequence.required = "Y"
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.toPortId == "actionTop" && e.subject.fromPortId == "responseBottom") { // action Top Port to response Bottom Port
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.action.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "MESSAGE";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.workflowSequence.terminalType;
            this.workflowSequence.required = "Y"
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.toPortId == "entityTop" && e.subject.fromPortId == "responseBottom") { // entity Top Port to response Bottom
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.entity.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.toNode.data.entity.workflowSequence.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "MESSAGE";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.workflowSequence.terminalType;
            this.workflowSequence.required = "Y"
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.toPortId == "actionLeft" && e.subject.fromPortId == "entityBottom") { // Action Left Port to Entity Bottom Port
            this.removeLink(e);
        } else if (e.subject.toPortId == "decisionTop" && e.subject.fromPortId == "intentBottom") { // Intent to  decision
            const model = e.diagram.model;
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 100);
            model.commitTransaction("modified properties");
            e.diagram.commandHandler.deleteSelection();
            this.toastr.error("Condition can't be linked with intent ");
        } else if (e.subject.toNode.data.modelid == 6 && e.subject.fromPortId == "intentBottom") { // Intent to  decision
            const model = e.diagram.model;
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 100);
            model.commitTransaction("modified properties");
            e.diagram.commandHandler.deleteSelection();
            this.toastr.error("Condition can't be linked with intent ");
        } else if (e.subject.fromPortId == "entityBottom" && e.subject.toPortId == "decisionTop") { // Entity to  decision
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.entity.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.entity.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.decision.workflowSequenceModel.workflowSequenceKey, "entryExpression": e.subject.toNode.data.decision.workflowSequenceModel.entryExpression }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");
            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.entity.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.entity.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.entity.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ENTITY";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.entity.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.entity.workflowSequence.terminalType;
            this.workflowSequence.required = "Y"
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);
            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.toPortId == "decisionTop" && e.subject.fromPortId == "responseBottom") { // response Bottom Port to decision top

            const respath = this.collectAllPaths(this.beg, e.subject.toNode);
            const path = this.isEntityOrActionAvilableInPath(respath);
            if (path) {
                const model = e.diagram.model;
                const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.workflowSequence.entryExpression };
                const toNode = { "workflowSequenceKey": e.subject.toNode.data.decision.workflowSequenceModel.workflowSequenceKey, "entryExpression": e.subject.toNode.data.decision.workflowSequenceModel.entryExpression }

                model.startTransaction();
                model.setDataProperty(e.subject.data, "modelid", 11);
                model.setDataProperty(e.subject.data, "fromNode", fromNode);
                model.setDataProperty(e.subject.data, "toNode", toNode);
                model.setDataProperty(e.subject.data, "visible", false);
                model.commitTransaction("modified properties");
                // update workflow Sequence object
                this.workflowSequence.id = e.subject.fromNode.data.workflowSequence.id
                this.workflowSequence.workflowId = e.subject.fromNode.data.workflowSequence.workflowId;
                this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.workflowSequence.workflowSequenceKey;
                this.workflowSequence.intentId = this.selectedIntent.id;
                this.workflowSequence.entryType = "MESSAGE";
                this.workflowSequence.entryExpression = e.subject.fromNode.data.workflowSequence.entryExpression;
                this.workflowSequence.primaryDestWorkflowId = this.workflowId;
                this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
                this.workflowSequence.secondaryDestWorkflowId = null;
                this.workflowSequence.secondaryDestSequenceKey = null;
                this.workflowSequence.terminalType = e.subject.fromNode.data.workflowSequence.terminalType;
                this.workflowSequence.required = "Y"
                this.workflowSequence.kuId = this.selectedKuId;
                this.updateWorkflowSequence(this.workflowSequence);

                this.currentDiagram = e.diagram;
                this.updateWorkflow();
            } else {
                const model = e.diagram.model;
                model.startTransaction();
                model.setDataProperty(e.subject.data, "modelid", 100);
                model.commitTransaction("modified properties");
                e.diagram.commandHandler.deleteSelection();
                this.toastr.error("Entity mapping needed before Condition");
            }
        } else if (e.subject.fromPortId == "actionBottom" && e.subject.toPortId == "decisionTop") { // Intent Bottom Port to Intent Bottom Port
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.action.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.decision.workflowSequenceModel.workflowSequenceKey, "entryExpression": e.subject.toNode.data.decision.workflowSequenceModel.id }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");

            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.action.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.action.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ACTION";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.action.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.action.workflowSequence.terminalType;
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "actionBottom" && e.subject.toPortId == "decisionTop") { // Intent Bottom Port to Intent Bottom Port
            const model = e.diagram.model;
            const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.action.workflowSequence.entryExpression };
            const toNode = { "workflowSequenceKey": e.subject.toNode.data.decision.workflowSequenceModel.workflowSequenceKey, "entryExpression": e.subject.toNode.data.decision.workflowSequenceModel.id }
            model.startTransaction();
            model.setDataProperty(e.subject.data, "modelid", 11);
            model.setDataProperty(e.subject.data, "fromNode", fromNode);
            model.setDataProperty(e.subject.data, "toNode", toNode);
            model.setDataProperty(e.subject.data, "visible", false);
            model.commitTransaction("modified properties");

            // update workflow Sequence object
            this.workflowSequence.id = e.subject.fromNode.data.action.workflowSequence.id
            this.workflowSequence.workflowId = e.subject.fromNode.data.action.workflowSequence.workflowId;
            this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.action.workflowSequence.workflowSequenceKey;
            this.workflowSequence.intentId = this.selectedIntent.id;
            this.workflowSequence.entryType = "ACTION";
            this.workflowSequence.entryExpression = e.subject.fromNode.data.action.workflowSequence.entryExpression;
            this.workflowSequence.primaryDestWorkflowId = this.workflowId;
            this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
            this.workflowSequence.secondaryDestWorkflowId = null;
            this.workflowSequence.secondaryDestSequenceKey = null;
            this.workflowSequence.terminalType = e.subject.fromNode.data.action.workflowSequence.terminalType;
            this.workflowSequence.required = "Y";
            this.workflowSequence.kuId = this.selectedKuId;
            this.updateWorkflowSequence(this.workflowSequence);

            this.currentDiagram = e.diagram;
            this.updateWorkflow();

        } else if (e.subject.fromPortId == "decisionLeft") { // decision Left Port to Entity Bottom Port

            const respath = this.collectAllPaths(e.subject.fromNode, e.subject.fromNode);
            const path = this.isEntityAvilableInPath(respath);
            if (path) {
                const model = e.diagram.model;
                const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.decision.workflowSequenceModel.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.decision.workflowSequenceModel.entryExpression };
                const toNode = { "workflowSequenceKey": null, "entryExpression": null }

                model.startTransaction();
                model.setDataProperty(e.subject.data, "modelid", 12);
                model.setDataProperty(e.subject.data, "text", "No");
                model.setDataProperty(e.subject.data, "fromNode", fromNode);
                model.setDataProperty(e.subject.data, "toNode", toNode);
                model.setDataProperty(e.subject.data, "visible", true);

                // update workflow Sequence object
                this.workflowSequence.id = e.subject.fromNode.data.decision.workflowSequenceModel.id
                this.workflowSequence.workflowId = e.subject.fromNode.data.decision.workflowSequenceModel.workflowId;
                this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.decision.workflowSequenceModel.workflowSequenceKey;
                this.workflowSequence.intentId = this.selectedIntent.id;
                this.workflowSequence.entryType = e.subject.fromNode.data.decision.workflowSequenceModel.entryType;
                this.workflowSequence.entryExpression = e.subject.fromNode.data.decision.workflowSequenceModel.entryExpression;
                this.workflowSequence.primaryDestWorkflowId = this.workflowId;
                this.workflowSequence.primaryDestSequenceKey = e.subject.fromNode.data.decision.workflowSequenceModel.primaryDestSequenceKey;
                this.workflowSequence.secondaryDestWorkflowId = this.workflowId;
                this.workflowSequence.secondaryDestSequenceKey = e.subject.toNode.data.key;
                this.workflowSequence.terminalType = e.subject.fromNode.data.decision.workflowSequenceModel.terminalType;
                this.workflowSequence.required = "Y"
                this.workflowSequence.kuId = this.selectedKuId;
                this.updateWorkflowSequence(this.workflowSequence);

                this.currentDiagram = e.diagram;
                this.updateWorkflow();
            } else {
                const model = e.diagram.model;
                model.startTransaction();
                model.setDataProperty(e.subject.data, "modelid", 100);
                model.commitTransaction("modified properties");
                e.diagram.commandHandler.deleteSelection();
                this.toastr.error("Entity mapping needed before Condition");
            }


        } else if (e.subject.fromPortId == "decisionRight") { // decision Right Port to Entity Bottom Port

            const respath = this.collectAllPaths(e.subject.fromNode, e.subject.fromNode);
            const path = this.isEntityAvilableInPath(respath);
            if (path) {
                const model = e.diagram.model;
                const fromNode = { "workflowSequenceKey": e.subject.fromNode.data.decision.workflowSequenceModel.workflowSequenceKey, "entryExpression": e.subject.fromNode.data.decision.workflowSequenceModel.entryExpression };
                const toNode = { "workflowSequenceKey": null, "entryExpression": null }

                model.startTransaction();
                model.setDataProperty(e.subject.data, "modelid", 11);
                model.setDataProperty(e.subject.data, "text", "Yes");
                model.setDataProperty(e.subject.data, "visible", true);
                model.setDataProperty(e.subject.data, "fromNode", fromNode);
                model.setDataProperty(e.subject.data, "toNode", toNode);

                // update workflow Sequence object
                this.workflowSequence.id = e.subject.fromNode.data.decision.workflowSequenceModel.id
                this.workflowSequence.workflowId = e.subject.fromNode.data.decision.workflowSequenceModel.workflowId;
                this.workflowSequence.workflowSequenceKey = e.subject.fromNode.data.decision.workflowSequenceModel.workflowSequenceKey;
                this.workflowSequence.intentId = this.selectedIntent.id;
                this.workflowSequence.entryType = e.subject.fromNode.data.decision.workflowSequenceModel.entryType;
                this.workflowSequence.entryExpression = e.subject.fromNode.data.decision.workflowSequenceModel.entryExpression;
                this.workflowSequence.primaryDestWorkflowId = this.workflowId;
                this.workflowSequence.primaryDestSequenceKey = e.subject.toNode.data.key;
                this.workflowSequence.secondaryDestWorkflowId = this.workflowId;
                this.workflowSequence.secondaryDestSequenceKey = e.subject.fromNode.data.decision.workflowSequenceModel.secondaryDestSequenceKey;
                this.workflowSequence.terminalType = e.subject.fromNode.data.decision.workflowSequenceModel.terminalType;
                this.workflowSequence.required = "Y"
                this.workflowSequence.kuId = this.selectedKuId;
                this.updateWorkflowSequence(this.workflowSequence);

                this.currentDiagram = e.diagram;
                this.updateWorkflow();
            } else {
                const model = e.diagram.model;
                model.startTransaction();
                model.setDataProperty(e.subject.data, "modelid", 100);
                model.commitTransaction("modified properties");
                e.diagram.commandHandler.deleteSelection();
                this.toastr.error("Entity mapping needed before Condition");
            }
        } else {
            this.removeLink(e);
        }
    }

    onReLinkDrawn(e) { // relink link between two removeLink
        const model = e.diagram.model;
        model.startTransaction();
        model.setDataProperty(e.subject.data, "modelid", 100);
        model.commitTransaction("modified properties");
        e.diagram.commandHandler.deleteSelection();
        this.toastr.error("Please link again");
    }

    showDetails(nodes) { // each node data details will show here
        if (nodes != null) {
            if (nodes.data) {
                if (nodes.data.modelid == 1 || nodes.data.modelid == 12 || nodes.data.modelid == 10 || nodes.data.modelid == 11) {
                    this.link = nodes;
                    this.node = null;
                } else {
                    this.node = nodes;
                    this.lastNodeSelected = nodes;
                    this.link = null;
                }
            }
        } else {
            this.lastNodeSelected.isSelected = true;
            this.lastNodeSelected.selectionAdorned = true;
            this.currentDiagram.select(this.currentDiagram.findNodeForKey(this.lastNodeSelected.data.key));
        }
        if (this.node) {
            if (this.node.diagram) {
                this.currentDiagram = this.node.diagram
                this.node.diagram.allowDrop = true;
                this.node.diagram.allowDelete = true; // false
            }
            if (this.node.data && nodes !== null) {
                if (this.node.data.modelid == 5) { // intent node selected
                    this.intent = this.node.data.intent;
                    if (this.node.data.intent) {
                        if (this.node.data.intent.names.length != 0) {
                            for (const names of this.node.data.intent.names) {
                                if (names.localeCode == "ar") {
                                    this.intent.arabicName = names.name;
                                } else if (names.localeCode == "en") {
                                    this.intent.name = names.name;
                                }
                            }
                        }
                        this.selectedIntent = this.intent;
                        this.keywords = [];
                        this.negaKeys = [];
                        this.postKeys = [];
                        this.arabicNegaKeys = [];
                        this.arabicPostKeys = [];
                        this.loadIntentToEdit(this.selectedIntent);
                        this.checkArabicUpdateIntent();
                    }
                    this.viewIntent = true;
                    this.rightSideView = true;
                    this.hideKuTab = false;
                    this.viewAction = false;
                    this.viewDecision = false;
                    this.viewResponse = false;
                    this.viewEntity = false;
                }
                if (this.node.data.modelid == 4) { // response node selected
                    localStorage.setItem("nodeKey", this.node.data.key)
                    if (this.node.data.message) {
                        this.viewResponse = true;
                        this.resTag = [];
                        this.resArabicTag = [];
                        this.deleteResps = [];
                        this.updateResps = [];
                        this.editResponses = "";
                        this.resp = [];
                        this.responseNodeKey = this.node.data.key;
                        this.selectedMessages = {};
                        this.selectedMessages = this.node.data.message;
                        this.selectedResponses = [];
                        this.selectedResponses = this.node.data.message.responses;
                        for (const res of this.node.data.message.responses) {
                            if (res.localeCode === "en") {
                                this.resTag.push(res.responseText)
                            } else if (res.localeCode === "ar") {
                                this.resArabicTag.push(res.responseText)
                            }
                        }
                        this.rightSideView = true;
                        this.checkArabicUpdateResponse();
                    } else {
                        this.modalReference = this.modalService.open(this.createResponseModal, this.ngbModalOptions);
                        this.modalReference.result.then((result) => {
                            this.closeResult = `Closed with: ${result}`;
                        }, (reason) => {
                            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                            if (this.closeResult === "Dismissed by pressing ESC") {
                                const nodekey = localStorage.getItem("nodeKey")
                                if (nodekey) {
                                    const node = this.currentDiagram.findNodeForKey(nodekey);
                                    this.currentDiagram.select(node);
                                    this.viewEditTable = false;
                                    this.node.data.modelid = 100;
                                    this.node.diagram.commandHandler.deleteSelection();
                                    localStorage.removeItem("nodeKey");
                                }
                            }
                        });

                        this.resTag = [];
                        this.resArabicTag = [];
                        this.selectedResponses = [];
                        this.updateResps = [];
                        this.deleteResps = [];
                        this.resp = [];
                        this.node.data.key = uuid();
                        this.responseNodeKey = this.node.data.key;
                        this.rightSideView = false;
                    }
                    this.hideKuTab = false;
                    this.viewAction = false;
                    this.viewDecision = false;
                    this.viewIntent = false;
                    this.viewEntity = false;

                }
                if (this.node.data.modelid == 2) { // entity node selected
                    this.editEntityKey = this.node.data.key;
                    if (this.node.data.entity) {
                        this.viewEntity = true;
                        this.rightSideView = true;
                        this.newEntity = false;
                        this.mapRegExs = [];
                        this.selectedItems = [];
                        this.selectedEntity = null;
                        this.updateQuestions = [];
                        this.resetQuestions();
                        this.selectedEntity = this.node.data.entity;
                        this.entity = this.selectedEntity;

                        this.loadEntityToEdit(this.selectedEntity);
                        if (this.node.data.entity.regex) {
                            this.mapRegExs = [];
                            this.selectedItems = [];
                            for (const re of this.node.data.entity.regex) {
                                this.selectedItems.push({
                                    itemName: re.regexname, id: re.id,
                                    expression: re.expression, message: re.message, kuId: re.kuId
                                });
                            }
                        } else {
                            this.mapRegExs = [];
                            this.selectedItems = [];
                        }
                        if (this.node.data.entity.required === "Y") {
                            this.entityRequired = true;
                        } else {
                            this.entityRequired = false;
                        }

                        if (this.node.data.entity.entityType === "ELS" || this.node.data.entity.entityType === "EILS" || this.node.data.entity.entityType === "EQRP") {
                            this.erResponses = this.node.data.entity.action.errorResponse;
                            for (const action of this.node.data.entity.action.actionExtn) {
                                this.entity.action.successCode = action.successCode;
                                this.entity.action.callMethod = action.callMethod;
                                this.entity.action.errorCode = action.errorCode;
                                if (this.entity.action.callMethod == 'POST' && action.requestBody != "") {
                                    const requestBody = JSON.parse(action.requestBody);
                                    if (requestBody.service_type == 'json') {
                                        action.requestBody = requestBody.req_body.request_string;
                                    }
                                }
                                if (action.localeCode === "en") {
                                    this.entityEnglishRequestBody = action.requestBody;
                                    this.entityEnglishActionUrl = action.url;
                                } else if (action.localeCode === "ar") {
                                    this.entityArabicRequestBody = action.requestBody;
                                    this.entityArabicActionUrl = action.url;
                                }
                            }
                        }
                        this.checkArabicUpdateEntity();
                    } else {
                        this.currentDiagram = this.node.diagram;
                        localStorage.setItem("nodeKey", this.node.data.key)
                        this.resetQuestions();
                        this.selectedEntity = null;
                        this.entityNew = new EntityDetails();
                        this.entityAction = {};
                        this.entityNew.entityType = "GEN";
                        this.entityNew.required = "Y";
                        this.entityNew.dataType = 'NUMERIC'
                        this.entityRequired = true;
                        this.mapRegExs = [];
                        this.questionsTag = [];
                        this.questionsArabicTag = [];
                        this.entityArabicExample = null;
                        this.entityEnglishExample = null;
                        this.newEntity = true;
                        this.viewEntity = false;
                        this.showAddRegExModal = false;
                        this.selectedItems = [];
                        this.erResponses = [];
                        this.updateQuestions = [];
                        this.entityButtonText = "";
                        this.entityQuestionSubTitle = "";
                        this.entityQuestionTitle = "";
                        this.entityImageUrl = "";
                        this.modalReference = this.modalService.open(this.createEntityModal, this.ngbModalOptions);
                        this.modalReference.result.then((result) => {
                            this.closeResult = `Closed with: ${result}`;
                        }, (reason) => {
                            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                            if (this.closeResult === "Dismissed by pressing ESC") {
                                const nodekey = localStorage.getItem("nodeKey")
                                if (nodekey) {
                                    const node = this.currentDiagram.findNodeForKey(nodekey);
                                    this.currentDiagram.select(node);
                                    this.viewEditTable = false;
                                    this.node.data.modelid = 100;
                                    this.node.diagram.commandHandler.deleteSelection();
                                    localStorage.removeItem("nodeKey");
                                }
                            }
                        });
                    }
                    this.viewAction = false;
                    this.hideKuTab = false;
                    this.viewIntent = false;
                    this.viewResponse = false;
                }
                if (this.node.data.modelid == 3) { // action node selected
                    this.arabicActionUrl = "";
                    this.arabicActionRequestBody = "";
                    this.actionConfirmMessageEnglish = "";
                    this.actionConfirmMessageArabic = "";
                    this.action = {};
                    this.headers = [];
                    this.requestParamArr = [];
                    if (this.node.data.action) {
                        this.viewAction = true;
                        if (this.node.data.action.globalIdentifier == null) {
                            this.node.data.action.globalIdentifier = this.node.data.key;
                        }
                        this.selectedAction = this.node.data.action;
                        this.action = this.selectedAction;
                        this.erResponses = this.selectedAction.errorResponses;
                        this.rightSideView = true;
                        if (this.node.data.action.confirm) {
                            for (const confirm of this.node.data.action.confirm) {
                                if (confirm.localeCode == "en") {
                                    this.actionConfirmMessageEnglish = confirm.text;
                                } else if (confirm.localeCode == "ar") {
                                    this.actionConfirmMessageArabic = confirm.text;
                                }
                            }
                        }
                        for (const action of this.node.data.action.actionExtn) {
                            this.action.successCode = action.successCode;
                            this.action.callMethod = action.callMethod;
                            this.action.errorCode = action.errorCode;
                            this.action.responsePath = action.responsePath;
                            if (action.localeCode === "en") {
                                this.action.requestBody = action.requestBody;
                                this.action.url = action.url;
                            } else if (action.localeCode === "ar") {
                                this.arabicActionUrl = action.url;
                            }
                            if (this.action.callMethod == 'POST' && action.requestBody != "") {
                                const requestBody = JSON.parse(action.requestBody);
                                if (requestBody.service_type == 'x-www-form-urlencoded' || requestBody.service_type == 'multipart/form-data') {
                                    this.action.serviceType = requestBody.service_type;
                                    this.headers = requestBody.headers;
                                    this.requestParamArr = requestBody.req_body.req_body_params;
                                } else if (requestBody.service_type == 'json') {
                                    this.action.serviceType = requestBody.service_type;
                                    this.headers = requestBody.headers;
                                    this.action.requestBody = requestBody.req_body.request_string;
                                }
                            }

                        }
                        this.checkArabicUpdateAction();
                    } else {
                        this.modalReference = this.modalService.open(this.createActionModal, this.ngbModalOptions);
                        this.modalReference.result.then((result) => {
                            this.closeResult = `Closed with: ${result}`;
                        }, (reason) => {
                            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                        });
                        const action = this.renderer.selectRootElement('#actionName');
                        setTimeout(() => action.focus(), 0);
                        this.action = new Action();
                        this.action.dataType = 'NUMERIC'
                        this.selectedAction = null;
                        this.erResponses = [];
                        this.rightSideView = false;
                    }
                    this.viewEntity = false;
                    this.viewIntent = false;
                    this.viewResponse = false;
                    this.viewDecision = false;
                    this.hideKuTab = false;

                }
                if (this.node.data.modelid == 1) { // link selected
                    this.viewAction = false;
                    this.viewDecision = false;
                    this.viewIntent = false;
                    this.viewResponse = false;
                    this.viewEntity = false;
                    this.hideKuTab = false;
                    this.rightSideView = false;

                }
                if (this.node.data.modelid == 6) { // decision selected

                    if (this.node.data.decision) {
                        localStorage.setItem("nodeKey", this.node.data.key)
                        this.viewDecision = true;
                        this.rightSideView = true;
                        this.conditions = [];
                        this.selectedDecision = this.node.data.decision;
                        this.exp = this.converCodeToString(this.node.data.decision.workflowSequenceModel.entryExpression);

                    } else {
                        this.node.data.key = uuid();
                        this.exp = "";
                        this.conditions = [];
                        this.addexpression(this.exp)
                        this.modalReference = this.modalService.open(this.createDecisionModal, this.ngbModalOptions);
                        this.modalReference.result.then((result) => {
                            this.closeResult = `Closed with: ${result}`;
                        }, (reason) => {
                            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                        });
                        this.rightSideView = false;
                    }

                    this.viewAction = false;
                    this.viewIntent = false;
                    this.viewResponse = false;
                    this.viewEntity = false;
                    this.hideKuTab = false;

                }
            } else {
                if (this.lastNodeSelected.data.modelid == 5) {
                    this.onClickedOutsideIntent(event, this.intent, null);
                }
                if (this.lastNodeSelected.data.modelid == 3) {
                    this.onClickedOutsideAction(event, this.action, this.response);
                }
                if (this.lastNodeSelected.data.modelid == 2) {
                    this.onClickedOutsideEntity(event, this.entity);
                }
                if (this.lastNodeSelected.data.modelid == 4) {
                    this.updateWorkflow();
                }
            }

        } else {
            this.viewAction = false;
            this.viewIntent = false;
            this.viewResponse = false;
            this.viewEntity = false;
            this.rightSideView = false;
        }
    }

    onlayoutCompletd(e) { // Layout Completed after every loading
        if (e.diagram) {
            this.currentDiagram = e.diagram;
            const node0 = e.diagram.findPartForKey(0);
            if (node0 !== null) {
                node0.isSelected = true;
            }
        }
    }

    modelAfterDeleted(event) { // after node delete update diagram
        if (event.diagram) {
            this.currentDiagram = event.diagram;
            this.updateWorkflow();
        }
    }

    onModelDelete(event) { // before delete node warining message check
        let modalView = 0;
        let count = 0;
        if (event.diagram) {
            this.currentDiagram = event.diagram;
        }
        if (event.diagram.selection.count != 0) {
            event.subject.each(function(p) {
                if (p.part.data) {
                    count++;
                    switch (p.part.data.modelid) {
                        case 1: {
                            if (p.part.data.modelid == 1) {
                                event.cancel = true;
                                modalView = 1;
                            }
                            break;
                        }
                        case 2: {
                            if (p.part.data.entity) {
                                event.cancel = true;
                                modalView = 2;
                            }
                            break;
                        }
                        case 3: {
                            if (p.part.data.action) {
                                event.cancel = true;
                                modalView = 3;
                            }
                            break;
                        }
                        case 4: {
                            if (p.part.data.response) {
                                event.cancel = true;
                                modalView = 4;
                            }
                            break;
                        }
                        case 5: {
                            if (p.part.data.intent) {
                                event.cancel = true;
                                modalView = 5;
                            }
                            break;
                        }
                        case 6: {
                            if (p.part.data.decision) {
                                event.cancel = true;
                                modalView = 6;
                            }
                            break;
                        }
                        case 11: {
                            if (p.part.data.modelid == 11) {
                                event.cancel = true;
                                modalView = 11;
                            }
                            break;
                        }
                        case 12: {
                            if (p.part.data.modelid == 12) {
                                event.cancel = true;
                                modalView = 11;
                            }
                            break;
                        }
                        case 100: {
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                } else {
                    count++;
                }
            });
            if (event.diagram.selection.count == count) {
                switch (modalView) {
                    case 2: {
                        this.removeEntityModalTemp();
                        break;
                    }
                    case 3: {
                        this.removeActionModalTemp();
                        break;
                    }
                    case 4: {
                        this.removeResponseModalsTemps();
                        break;
                    }
                    case 5: {
                        this.removeIntentModalTemp();
                        break;
                    }
                    case 6: {
                        this.removeDecisionModalTemp();
                        break;
                    }
                    case 1: {
                        this.removeIntentMappingModalTemp();
                        break;
                    }
                    case 11: {
                        this.removeMappingModalTemp();
                        break;
                    }
                    case 12: {
                        this.removeMappingModalTemp();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        } else {
            this.modalReference.close();
            event.cancel = false;
        }
    }

    onModelChanged(e) {   // update diagram for each actions in node
        if (e.diagram) {
            this.currentDiagram = e.diagram;
        }
    }

    removeLink(e) { // remove link and display error message
        const model = e.diagram.model;
        model.startTransaction();
        model.setDataProperty(e.subject.data, "modelid", 100);
        model.commitTransaction("modified properties");
        e.diagram.commandHandler.deleteSelection();
        this.toastr.error("The Mapping between this two nodes are resticted");
    }

    // **************************************--->INTENT SIDE VIEW (Update) FUNCTIONS<----********************

    getIntentById(intentId) { // get Intent Data By Intent Id
        this.selectedIntent = null;
        this.intentService.getIntentById(intentId)
            .subscribe(
                intents => {
                    if (intents.name) {
                        this.selectedIntent = intents;
                        this.getWorkflow(intents);
                    }
                },
                error => {
                    this.loading = false;
                })
    }

    onClickedOutsideIntent(event, intent, errors) { // function will call outside click of intent side view
        if (this.insideIntent === true) {
            if (intent.name != null && intent.name != undefined && intent.name != "") {
                const EMAIL_REGEXP = /^[a-zA-Z0-9][A-Za-z0-9 ]*$/;
                const EMAIL_REGEXP_AR = /^(?:[0-9\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF])){0,50}$/;

                const value = EMAIL_REGEXP.test(intent.name) ? null : true;
                let values = false;
                if (intent.arabicName != null && intent.arabicName != undefined && errors == null) {
                    values = EMAIL_REGEXP_AR.test(intent.arabicName) ? null : true;
                }
                if (!value && !values) {
                    this.updateIntent(intent);
                }
            } else {
                this.toastr.error("Some Mandatory felids are missing")
            }
            this.insideIntent = false;
        }
    }

    onClickedOutsideIntentKey(event, intent, errors) { // function will call outside click of intent side view
        if (intent.name != null && intent.name != undefined && intent.name != "") {
            const EMAIL_REGEXP = /^[a-zA-Z0-9][A-Za-z0-9 ]*$/;
            const EMAIL_REGEXP_AR = /^(?:[0-9\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF])){0,50}$/;

            const value = EMAIL_REGEXP.test(intent.name) ? null : true;
            let values = false;
            if (intent.arabicName != null && intent.arabicName != undefined && errors == null) {
                values = EMAIL_REGEXP_AR.test(intent.arabicName) ? null : true;
            }
            if (!value && !values) {
                this.updateIntent(intent);
            }
        } else {
            this.toastr.error("Some Mandatory felids are missing")
        }

    }

    onClickedInsideIntent() {  // function will call inside click of intent side view
        this.insideIntent = true;
    }

    updateIntent(intent) {   // updateIntent-keywords
        this.loading = true;
        if (this.selectedIntent.name != intent.name) {
            const intentCopy = Object.assign(new Intent(), intent);
            const keyword = new Keywords();
            keyword.keywordField = intentCopy.name.toLowerCase();
            intent.id = this.selectedIntent.id;
            keyword.polarity = "P";
            keyword.intent.id = intent.id;
            this.updatePostKeys.push(keyword);
        } else {
            this.selectedIntent.name = intent.name;
            this.selectedIntent.kuId = this.selectedKuId;
        }
        let pKeywords = [];
        let nKeywords = [];
        let keywords = [];
        if (this.updatePostKeys.length != 0) {
            pKeywords = this.updatePostKeys;
            this.updatePostKeys = [];
        }
        if (this.updateNegaKeys.length != 0) {
            nKeywords = this.updateNegaKeys;
            this.updateNegaKeys = [];
        }
        const names = [];
        keywords = keywords.concat(pKeywords);
        keywords = keywords.concat(nKeywords);
        const intentnames = Object.assign({}, intent);
        intent.keywords = intent.keywords.concat(keywords);
        intent.kuId = this.selectedKu.id;
        intent.name = intentnames.name;
        if (intent.arabicName && intent.names.length == 1) {
            names.push({ 'localeCode': 'ar', 'name': intent.arabicName })
        }
        for (const intentName of intent.names) {
            if (intent.arabicName && intentName.localeCode === "ar") {
                names.push({ 'id': intentName.id, 'localeCode': 'ar', 'name': intent.arabicName })
            }
            if (intentName.localeCode === "en") {
                names.push({ 'id': intentName.id, 'localeCode': 'en', 'name': intent.name })
            }
        }
        intent.names = names;
        this.intentService.checkIntentUpdate(this.intent).subscribe(success => {
            if (success.errorCode === "Keyword_Already_Exist") {
                this.toastr.error(success.errorDescription);
                this.loading = false;
            } else if (success.errorCode === "Something_Went_Wrong") {
                this.toastr.error(success.errorDescription);
                this.loading = false;
            } else {
                this.intentService.updateIntentKeywords(intent, keywords)
                    .subscribe(successObject => {
                        this.successObject = successObject;
                        if (this.successObject == 203) {
                            this.toastr.error('Intent name already exists.');
                        } else {
                            this.loading = false;
                            this.onCommitDetailsIntent(intent);
                            this.sidebar.getIntentByKu(this.selectedKu);
                            this.currentDiagram = this.node.diagram;
                            this.updateWorkflow();
                        }
                    },
                        error => {
                            if (error.errorCode === "INTENT_EXIST") {
                                this.loading = false;
                                this.toastr.error('Intent name already exists.');
                            } else if (error.errorCode === "KEYWORD_EXIST") {
                                this.toastr.error('Keyword already exists in the same Intent');
                                this.loading = false;
                            } else if (error.errorCode === "DUPLICATE_ENTRY") {
                                this.toastr.error('Intent name already exists');
                                this.loading = false;
                            } else {
                                this.loading = false;
                                this.toastr.error('Service Error', null, { toastLife: 800 });
                            }
                        });
            }
        },
            error => {
                if (error.errorCode = "Keyword_Already_Exist") { }
                this.toastr.error(error.errorDescription);
                this.loading = false;
            });
    }

    checkArabicUpdateIntent() { // check arabic language  is empty
        this.updateIntentLangWarning = false;
        if ((this.intent.arabicName === undefined || this.intent.arabicName === "" || this.intent.arabicName === null)
            && (this.intent.name)) {
            this.updateIntentLangWarning = true;
        }
        if (this.negaKeys.length > 0 && this.arabicNegaKeys.length == 0) {
            this.updateIntentLangWarning = true;
        }
    }

    updatePosKeyword(postKeys) { // postive keyword english update
        const keyword = new Keywords();
        const intent = new Intent();
        intent.id = this.intent.id;
        keyword.keywordField = postKeys.value.toLowerCase();
        keyword.polarity = "P";
        keyword.localeCode = "en";
        keyword.intent = intent;

        if (postKeys.value.toLowerCase() === this.intent.name.toLowerCase()) {
            for (const key of this.postKeys) {
                if (postKeys.value == key.value) {
                    const index: number = this.postKeys.indexOf(key);
                    this.postKeys.splice(index, 1);
                }
            }
            this.toastr.error('Intent Name will be added as  positive keyword');
        } else {
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
                            this.updatePostKeys.push(keyword);
                        }
                    }
                }
            } else {
                this.updatePostKeys.push(keyword);
            }
        }
    }

    updateNegKeyword(negKeys) { // negative keyword english update
        const intentName = Object.assign({}, this.intent);
        if (negKeys.value.toLowerCase() === intentName.name.toLowerCase()) {
            for (const key of this.negaKeys) {
                if (negKeys.value == key.value) {
                    const index: number = this.negaKeys.indexOf(key);
                    this.negaKeys.splice(index, 1);
                }
            }
            this.toastr.error('Intent Name will be added as Positive Keyword');
        } else {
            const keyword = new Keywords();
            const intent = new Intent();
            intent.id = this.intent.id;
            keyword.keywordField = negKeys.value;
            keyword.polarity = "N";
            keyword.intent = intent;
            keyword.localeCode = "en";
            this.updateNegaKeys.push(keyword);
        }
    }

    updateArabicPosKeyword(postKeys) { // positive keyword arabic update
        if (this.intent.arabicName != undefined && this.intent.arabicName != "") {
            const keyword = new Keywords();
            const intent = new Intent();
            intent.id = this.intent.id;
            keyword.keywordField = postKeys.value.toLowerCase();
            keyword.polarity = "P";
            keyword.localeCode = "ar";
            keyword.intent = intent;
            this.updatePostKeys.push(keyword);
        } else {
            this.toastr.error("Arabic Intent Name in Mandatory");
            this.arabicPostKeys = [];
        }
    }

    updateArabicNegKeyword(negKeys) { // negative keyword arabic update
        const intentName = Object.assign({}, this.intent);
        if (negKeys.value.toLowerCase() === intentName.name.toLowerCase()) {
            for (const key of this.negaKeys) {
                if (negKeys.value == key.value) {
                    const index: number = this.negaKeys.indexOf(key);
                    this.negaKeys.splice(index, 1);
                }
            }
            this.toastr.error('Intent Name will be added as Positive Keyword');
        } else {
            if (this.intent.arabicName != undefined && this.intent.arabicName != "") {
                const keyword = new Keywords();
                const intent = new Intent();
                intent.id = this.intent.id;
                keyword.keywordField = negKeys.value;
                keyword.polarity = "N";
                keyword.localeCode = "ar";
                keyword.intent = intent;
                this.updateNegaKeys.push(keyword);
            } else {
                this.toastr.error("Arabic Intent Name in Mandatory");
                this.arabicNegaKeys = [];
            }
        }
    }

    deleteKeyword(key) { // delete all keywords positive & negative
        this.insideIntent = true;
        for (const keyword of this.keywords) {
            if (keyword.keywordField == key) {
                if (key != this.intent.name) {
                    const index: number = this.keywords.indexOf(keyword);
                    this.keywords.splice(index, 1);
                    // call function to delete
                    this.deleteKeywordServiceCall(keyword.id.toString());
                    break;
                }
            }
        }
        if (this.updatePostKeys.length !== 0) {
            for (const keyword of this.updatePostKeys) {
                if (keyword.keywordField == key.value) {
                    const index: number = this.updatePostKeys.indexOf(keyword);
                    this.updatePostKeys.splice(index, 1);
                }
            }
        }
        if (this.updateNegaKeys.length !== 0) {
            for (const keyword of this.updateNegaKeys) {
                if (keyword.keywordField == key.value) {
                    const index: number = this.updateNegaKeys.indexOf(keyword);
                    this.updateNegaKeys.splice(index, 1);
                }
            }
        }
    }

    deleteKeywordServiceCall(keywordId) { // service call for delete
        this.intentService.deleteKeywordById(keywordId)
            .subscribe(successObject => { this.successObject = successObject; },
                errorCode => { });
    }

    onCommitDetailsIntent(data) { // workflow intent update
        if (this.node) {
            if (this.node.diagram != undefined && this.node.diagram != null) {
                const model = this.node.diagram.model;
                model.startTransaction();
                model.setDataProperty(this.node.data, "text", data.name);
                model.setDataProperty(this.node.data, "id", data.id);
                model.setDataProperty(this.node.data, "from", true);
                model.setDataProperty(this.node.data, "intent", data);
                this.node.diagram.contentAlignment = go.Spot.TopCenter;
                model.commitTransaction("modified properties");
                this.currentDiagram = this.node.diagram;
                this.updateWorkflow();
            } else {
                this.currentDiagram.select(this.currentDiagram.findNodeForKey(data.globalIdentifier));
                const model = this.currentDiagram.model;
                model.startTransaction();
                model.setDataProperty(this.node.data, "text", data.name);
                model.setDataProperty(this.node.data, "id", data.id);
                model.setDataProperty(this.node.data, "from", true);
                model.setDataProperty(this.node.data, "intent", data);
                this.node.diagram.contentAlignment = go.Spot.TopCenter;
                model.commitTransaction("modified properties");
                this.currentDiagram = this.node.diagram;
                this.updateWorkflow();
            }
        }
    }

    loadIntentToEdit(intent) { // intent update data
        this.keywords = [];
        this.negaKeys = [];
        this.postKeys = [];
        this.arabicNegaKeys = [];
        this.arabicPostKeys = [];
        this.keywords = intent.keywords;
        for (const keyword of intent.keywords) {
            if (keyword.polarity == "N" && keyword.localeCode == "en") {
                this.negaKeys.push(keyword.keywordField);
            } else if (keyword.polarity == "P" && keyword.localeCode == "en") {
                if (keyword.keywordField === intent.name.toLowerCase()) {
                    this.postKeys.push({ 'display': keyword.keywordField.toLowerCase(), readonly: true });
                } else {
                    this.postKeys.push(keyword.keywordField);
                }
            } else if (keyword.polarity == "P" && keyword.localeCode == "ar") {
                if (keyword.keywordField === this.intent.arabicName && keyword.keywordField !== undefined) {
                    this.arabicPostKeys.push({ 'display': keyword.keywordField.toLowerCase(), readonly: true });
                } else if (keyword.keywordField !== undefined) {
                    this.arabicPostKeys.push(keyword.keywordField);
                }
            } else if (keyword.polarity == "N" && keyword.localeCode == "ar") {
                this.arabicNegaKeys.push(keyword.keywordField);
            }
        }
    }

    deleteIntents() { // intent delete
        this.intentService.deleteIntentById(this.selectedIntent.id)
            .subscribe(successCode => {
                this.successObject = successCode;
                location.reload();
                this.removeIntent = null;
                this.modalReference.close();
                this.toastr.success('Intent Unit deleted successfully.');
                this.deleteWorkflow();
            },
                errorCode => {
                    this.successObject = errorCode;
                });
    }

    removeIntentModalTemp() { // intent delete warining modal
        if (this.workflowId) {
            this.removeIntent = this.selectedIntent;
            this.modalReference = this.modalService.open(this.removeIntentModalTemplate, this.ngbModalOptions);
            this.modalReference.result.then((result) => {
                this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
        }
    }

    // **************************************--->ENTITY  FUNCTIONS<----**************************************

    onClickedOutsideEntity(event, entity) { // click Outside Entity Side Bar
        if (this.insideEntity === true) {
            if (entity.name != null && entity.name != undefined) {
                if (entity.entityType == "ELS" && this.entityQuestionTitle != "" && this.entityQuestionSubTitle != "" && this.entityButtonText != "" && this.entityEnglishActionUrl != "" && this.questionsTag.length != 0) {
                    this.updateEntityMethod(entity);
                } else if (entity.entityType == "EILS" && this.entityQuestionTitle != "" && this.entityQuestionSubTitle != "" && this.entityButtonText != "" && this.entityImageUrl != "" && this.entityEnglishActionUrl != "" && this.questionsTag.length != 0) {
                    this.updateEntityMethod(entity);
                } else if (entity.entityType == "EQRP" && this.entityQuestionTitle != "" && this.entityButtonText != "" && this.entityEnglishActionUrl != "" && this.questionsTag.length != 0) {
                    this.updateEntityMethod(entity);
                } else if (entity.entityType == "GEN" && this.questionsTag.length != 0) {
                    this.updateEntityMethod(entity);
                } else if (entity.entityType == "ATCMT" && this.questionsTag.length != 0) {
                    this.updateEntityMethod(entity);
                } else {
                    this.toastr.error("Please fill all  Mandatory felids")
                }
            } else {
                this.toastr.error("Please fill all  Mandatory felids")
            }
            this.insideEntity = false;
        }
    }

    onClickedInsideEntity() { // click Insde Entity Side Bar
        this.insideEntity = true;
    }

    getEntityTypeLst() { //  Entity Type List
        this.entityService.getEntityTypeLst()
            .subscribe(
                list => this.entityTypeLst = list,
                error => this.errorMessage = <any>error);
    }

    checkArabicUpdateEntity() { // check arabic language  is empty
        this.updateEntityLangWarning = false;
        if ((this.entityArabicExample === undefined || this.entityArabicExample === "" || this.entityArabicExample === null)
            && (this.entityEnglishExample)) {
            this.updateEntityLangWarning = true;
        }
        if (this.questionsTag.length > 0 && this.questionsArabicTag.length == 0) {
            this.updateEntityLangWarning = true;
        }
    }

    checkArabicCreateEntity() { // check arabic language  is empty
        this.createEntityLangWarning = false;
        if ((this.entityArabicExample === undefined || this.entityArabicExample === "" || this.entityArabicExample === null)
            && (this.entityEnglishExample)) {
            this.createEntityLangWarning = true;
        }
        if (this.questionsTag.length > 0 && this.questionsArabicTag.length == 0) {
            this.createEntityLangWarning = true;
        }
    }

    checkCreateEntityActionLangWarning() { // service url check in external list
        this.createEntityActionLangWarning = false;
        if ((this.entityAction.arabicUrl === undefined || this.entityAction.arabicUrl === "" || this.entityAction.arabicUrl === null)
            && (this.entityAction.url)) {
            this.createEntityActionLangWarning = true;
        }
        if ((this.entityAction.arabicRequestBody === undefined || this.entityAction.arabicRequestBody === "" || this.entityAction.arabicRequestBody === null)
            && (this.entityAction.requestBody)) {
            this.createEntityActionLangWarning = true;
        }
    }

    entitiesList(nodeDataArray) { // list of entities in the diagram
        this.selectedEntitys = [];
        for (const node of nodeDataArray) {
            if (node.modelid == 2) {
                this.selectedEntitys.push(node)
            }
        }
    }

    onCommitDetailsEntity(en) { // workflow json Entity update
        if (this.node) {
            if (this.node.diagram != undefined && this.node.diagram != null) {
                const model = this.node.diagram.model;
                model.startTransaction();
                model.setDataProperty(this.node.data, "text", en.name);
                model.setDataProperty(this.node.data, "id", en.id);
                if (en.globalIdentifier !== null) {
                    model.setDataProperty(this.node.data, "key", en.globalIdentifier);
                }
                model.setDataProperty(this.node.data, "entity", en);
                this.node.diagram.contentAlignment = go.Spot["Top"];
                model.commitTransaction("modified properties");
                this.currentDiagram = this.node.diagram;
                this.updateWorkflow();
            } else {
                this.currentDiagram.select(this.currentDiagram.findNodeForKey(en.globalIdentifier));
                const model = this.node.diagram.model;
                model.startTransaction();
                model.setDataProperty(this.node.data, "text", en.name);
                model.setDataProperty(this.node.data, "id", en.id);
                if (en.globalIdentifier !== null) {
                    model.setDataProperty(this.node.data, "key", en.globalIdentifier);
                }
                model.setDataProperty(this.node.data, "entity", en);
                this.node.diagram.contentAlignment = go.Spot["Top"];
                model.commitTransaction("modified properties");
                this.currentDiagram = this.node.diagram;
                this.updateWorkflow();
            }
        }
    }

    loadEntityToEdit(entity) { // Bind entity data to Html view
        this.questions = entity.questions;
        for (const question of this.questions) {
            if (question.localeCode === "en") {
                this.entityButtonText = question.buttonText;
                this.entityQuestionTitle = question.title;
                this.entityQuestionSubTitle = question.subTitle;
                this.entityEnglishExample = question.example;
                this.entityImageUrl = question.imageUrl;
                this.questionsTag.push(question.question);
            } else if (question.localeCode === "ar") {
                this.entityArabicExample = question.example;
                this.questionsArabicTag.push(question.question);
            }
        }
    }

    onEntityTypeChange(event) { // reset questions based on change of Entity type to avoid null data in questions
        this.resetQuestions();
    }

    resetQuestions() { // reset all questions tag
        this.questions = [];
        this.questionsTag = [];
        this.questionsArabicTag = [];
        this.entityArabicExample = null;
        this.entityEnglishExample = null;
    }

    createNewEntity(entity) { // create entity
        if (this.questions.length != 0) {
            entity.questions = this.questions;
            entity.kuId = this.selectedKuId;
            entity.intentId = this.selectedIntent.id
            entity.globalIdentifier = uuid();
            entity.arExample = this.entityArabicExample;
            entity.engExample = this.entityEnglishExample;
            if (entity.entityType == "ELS" || entity.entityType == "EILS" || entity.entityType == "EQRP") {
                const actionExtnModel = []
                entity.action = {};
                this.entityAction.kuId = this.selectedKu.id;

                entity.action.intentId = null;
                entity.action.errorResponses = this.erResponses;
                entity.action.globalIdentifier = uuid();
                if (this.entityAction.callMethod == 'POST') {
                    this.headers = [];
                    this.headers.push({ header_key: 'Content-Type', header_value: 'application/json' });
                    const body = JSON.stringify({
                        'service_type': 'json',
                        'headers': this.headers,
                        'req_body': {
                            'request_string': this.entityAction.requestBody
                        }
                    });
                    this.entityAction.requestBody = body;
                } else if (this.entityAction.callMethod == 'GET') {
                    this.headers = [];
                    this.headers.push({ header_key: 'Content-Type', header_value: 'application/json' }, { header_key: "Authorization", header_value: "" });
                    const body = JSON.stringify({
                        'service_type': 'json',
                        'headers': this.headers,
                        'req_body': {}
                    });
                    this.entityAction.requestBody = body;
                }

                entity.action.kuId = this.selectedKu.id;
                const actionEng = {
                    'callMethod': this.entityAction.callMethod,
                    'url': this.entityAction.url,
                    'successCode': this.entityAction.successCode,
                    'localeCode': 'en',
                    'errorCode': this.entityAction.errorCode,
                    'requestBody': this.entityAction.requestBody,
                    'responsePath': ''
                }
                if (this.entityAction.arabicUrl != undefined && this.entityAction.arabicUrl != "") {
                    const actionArb = {
                        'callMethod': this.entityAction.callMethod,
                        'url': this.entityAction.arabicUrl,
                        'successCode': this.entityAction.successCode,
                        'localeCode': 'ar',
                        'errorCode': this.entityAction.errorCode,
                        'requestBody': this.entityAction.arabicRequestBody,
                        'responsePath': ''
                    }
                    actionExtnModel.push(actionArb);
                }
                actionExtnModel.push(actionEng);
                entity.action.actionExtn = actionExtnModel;
            }
            entity.regEx = this.mapRegExs;
            this.selectedEntity = null;
            this.entityService.createEntity(entity)
                .subscribe(success => {
                    this.successObject = success;
                    if (this.successObject == 203) {
                        this.toastr.error('Entity already exists.');
                    } else {
                        this.selectedEntity = this.successObject;
                        // create workflow Sequence object
                        this.workflowSequence.workflowId = this.workflowId;
                        this.workflowSequence.workflowSequenceKey = this.successObject.globalIdentifier;
                        this.workflowSequence.intentId = this.selectedIntent.id;
                        this.workflowSequence.entryType = "ENTITY";
                        this.workflowSequence.entryExpression = this.successObject.id;
                        this.workflowSequence.primaryDestWorkflowId = this.workflowId;
                        this.workflowSequence.primaryDestSequenceKey = null;
                        this.workflowSequence.secondaryDestWorkflowId = null;
                        this.workflowSequence.secondaryDestSequenceKey = null;
                        this.workflowSequence.terminalType = null;
                        this.workflowSequence.required = "Y";
                        this.workflowSequence.kuId = this.selectedKuId;
                        this.createWorkflowSequence(this.workflowSequence);
                        this.onCommitDetailsEntity(this.selectedEntity);

                        this.toastr.success('Entity added Successfully');
                        this.viewEntity = true;
                        this.hideKuTab = true;
                        this.modalReference.close();
                    }
                },
                    errorCode => {
                        if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                            this.toastr.error('Entity already exists');
                        } else {
                            this.modalReference.close();
                            this.toastr.error('Service Error', null, { toastLife: 800 });
                        }
                    });
        } else {
            this.toastr.error('Please Enter Questions ');
        }
    }

    updateEntityMethod(en) { // update entity
        this.loading = true;
        en.kuId = this.selectedKuId;
        en.intentId = this.selectedIntent.id;
        en.arExample = this.entityArabicExample;
        en.engExample = this.entityEnglishExample;
        en.title = this.entityQuestionTitle;
        en.subTitle = this.entityQuestionSubTitle;
        en.imageUrl = this.entityImageUrl;
        en.buttonText = this.entityButtonText;
        if (this.updateQuestions.length != 0) {
            this.updateQuestionsData(this.updateQuestions);
        }
        if (this.mapRegExs.length != 0) {
            this.createEntityRegExMapping(this.mapRegExs, en);
        }
        if (en.entityType == "ELS" || en.entityType == "EILS" || en.entityType == "EQRP") {
            const actionExtnModel = []
            this.entityAction.kuId = this.selectedKu.id;

            en.action.intentId = null;
            en.action.errorResponses = this.erResponses;
            en.action.globalIdentifier = uuid();
            en.action.kuId = this.selectedKu.id;

            if (en.action.callMethod == 'POST') {
                this.entityArabicRequestBody = this.entityEnglishRequestBody;
                this.headers = [];
                this.headers.push({ header_key: 'Content-Type', header_value: 'application/json' });
                const body = JSON.stringify({
                    'service_type': 'json',
                    'headers': this.headers,
                    'req_body': {
                        'request_string': this.entityArabicRequestBody
                    }
                });
                this.entityEnglishRequestBody = body;
            } else if (en.action.callMethod == 'GET') {
                this.headers = [];
                this.headers.push({ header_key: 'Content-Type', header_value: 'application/json' }, { header_key: "Authorization", header_value: "" });
                const body = JSON.stringify({
                    'service_type': 'json',
                    'headers': this.headers,
                    'req_body': {}
                });
                this.entityEnglishRequestBody = body;
            }
            for (const actionExtn of en.action.actionExtn) {
                if (actionExtn.localeCode == 'en') {
                    const actionEng = {
                        'id': actionExtn.id,
                        'callMethod': en.action.callMethod,
                        'url': this.entityEnglishActionUrl,
                        'successCode': en.action.successCode,
                        'localeCode': 'en',
                        'errorCode': en.action.errorCode,
                        'requestBody': this.entityEnglishRequestBody,
                        'responsePath': ''
                    }
                    actionExtnModel.push(actionEng);
                }
                if (this.entityArabicActionUrl != undefined && this.entityArabicActionUrl != "" && actionExtn.localeCode == 'ar') {
                    const actionArb = {
                        'id': actionExtn.id,
                        'callMethod': en.action.callMethod,
                        'url': this.entityArabicActionUrl,
                        'successCode': en.action.successCode,
                        'localeCode': 'ar',
                        'errorCode': en.action.errorCode,
                        'requestBody': this.entityEnglishRequestBody,
                        'responsePath': ''
                    }
                    actionExtnModel.push(actionArb);
                } else if (this.entityArabicActionUrl != undefined && this.entityArabicActionUrl != "") {
                    const actionArb = {
                        'id': null,
                        'callMethod': en.action.callMethod,
                        'url': this.entityArabicActionUrl,
                        'successCode': en.action.successCode,
                        'localeCode': 'ar',
                        'errorCode': en.action.errorCode,
                        'requestBody': this.entityArabicRequestBody,
                        'responsePath': ''
                    }
                    actionExtnModel.push(actionArb);
                }
            }
            en.action.actionExtn = actionExtnModel;
        }
        this.entityService.updateEntity(en)
            .subscribe(successCode => {
                this.onCommitDetailsEntity(en);
                this.insideEntity = false;
                this.loading = false;
                this.successObject = successCode;
                if (this.successObject == 203) {
                    this.toastr.error('Entity already exists.');
                } else {
                    this.viewEntity = true;
                }
            },
                errorCode => {
                    if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                        this.loading = false;
                        this.toastr.error('Entity already exists');
                    } else {
                        this.loading = false;
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });
    }

    removeEntityModalTemp() { // delete entity warining modal
        this.modalReference = this.modalService.open(this.removeEntityModalTemplate, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    removeEntities() { // delete entity node
        this.entityService.deleteEntityById(this.selectedEntity.id)
            .subscribe(successCode => {
                this.successObject = successCode;
                if (this.successObject == 203) {
                } else {
                    this.modalReference.close();
                    if (this.node.data.modelid == 2) {
                        this.node.diagram.allowDelete = true;
                        this.node.text = null;
                        this.node.data.modelid = null;
                        this.node.diagram.commandHandler.deleteSelection();
                        this.sliceSelectedEntitys(this.selectedEntity);
                        this.entity = new EntityDetails();
                        this.resetQuestions();
                        this.toastr.success('Entity Removed Successfully');
                        this.close('viewEntity');
                    }
                }
            },
                errorCode => {
                    this.modalReference.close();
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });
    }

    copyTitileToPayLooad(entity) { // copy the title to payload
        if (entity.entityType === 'EQRP') {
            this.entityButtonText = this.entityQuestionTitle;
        }
    }

    getReLst() { // Regular - Expression
        if (this.selectedKuId != undefined) {
            this.reService.getReLst()
                .subscribe(
                    regexs => {
                        this.regExLst = [];
                        this.dropdownList = [];
                        this.regExLst = regexs;
                        for (const re of this.regExLst) {
                            this.dropdownList.push({
                                itemName: re.regexname, id: re.id,
                                expression: re.expression, message: re.message, kuId: re.kuId
                            });
                        }
                    },
                    error => {
                        this.errorMessage = <any>error;
                        this.loading = false;
                    }
                );
        }
    }

    createEntityRegExMapping(regexs, entity) { // mapping regexs
        for (const re of regexs) {
            this.entityService.createRegexMapping(re, entity)
                .subscribe(successCode => {
                    if (this.successObject == 203) {
                        this.toastr.error('Entity already exists.');
                    }
                },
                    errorCode => {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    });
        }
    }

    onItemSelect(modalAddRegEx, re: any) { // regExs
        let value = 0;
        if (this.selectedEntitys.length != 0) {
            for (const entity of this.selectedEntitys) {
                if (entity.entity.regex.length != 0) {
                    for (const res of entity.entity.regex) {
                        if (re.id == res.id) {
                            value = 1
                            this.mapRE = re;
                            if (this.newEntity == true) {
                                this.showRegExWarningMessage = true;
                            } else {
                                this.modalReference = this.modalService.open(modalAddRegEx, this.ngbModalOptions);
                                this.modalReference.result.then((result) => {
                                    this.closeResult = `Closed with: ${result}`;
                                }, (reason) => {
                                    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                                });
                            }
                            break;
                        }
                    }
                }
            }
            if (value != 1) {
                const mapRegEx = {
                    regexname: re.itemName,
                    id: re.id, expression: re.expression, message: re.message, kuId: re.kuId, date: ""
                };
                if (this.mapRegExs.indexOf(mapRegEx) == -1) {
                    this.mapRegExs.push(mapRegEx);
                }
            }

        } else {
            const mapRegEx = {
                regexname: re.itemName,
                id: re.id, expression: re.expression, message: re.message, kuId: re.kuId, date: ""
            };
            if (this.mapRegExs.indexOf(mapRegEx) == -1) {
                this.mapRegExs.push(mapRegEx);
            }
        }
    }

    OnItemDeSelect(item: any) { // regExs mapping remove
        this.entityService.deleteRegexMapping(item, this.selectedEntity)
            .subscribe(successCode => {
                if (this.successObject == 203) {
                    this.toastr.error('Entity already exists.');
                }
            },
                errorCode => {
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });
        for (const re of this.mapRegExs) {
            if (re.id == item.id) {
                const index: number = this.mapRegExs.indexOf(re);
                this.mapRegExs.splice(index, 1);
            }
        }
    }

    onSelectAll(items: any) { // regExs
        for (const re of items) {
            this.mapRegExs.push({
                regexname: re.itemName,
                id: re.id, expression: re.expression, message: re.message, kuId: re.kuId, date: ""
            });
        }
    }

    onDeSelectAll(items: any) { // regExs
        this.mapRegExs = [];
        this.selectedItems = [];
    }

    addRegEX() { // add regexs after verficcation
        const mapRegEx = {
            regexname: this.mapRE.itemName,
            id: this.mapRE.id, expression: this.mapRE.expression, message: this.mapRE.message, kuId: this.mapRE.kuId, date: ""
        };
        if (this.mapRegExs.indexOf(mapRegEx) == -1) {
            this.mapRegExs.push(mapRegEx);
        }
        if (this.newEntity == true) {
            this.showRegExWarningMessage = false;
        } else {
            this.modalReference.close()
        }
    }

    removeRegex() { // remove regexs after verficcation
        if (this.newEntity == true) {
            this.showRegExWarningMessage = false;
        } else {
            this.modalReference.close();
        }
        for (const re of this.mapRegExs) {
            if (re.id == this.mapRE.id) {
                const index: number = this.mapRegExs.indexOf(re);
                this.mapRegExs.splice(index, 1);
            }
        }
        for (const re of this.selectedItems) {
            if (re.id == this.mapRE.id) {
                const index: number = this.selectedItems.indexOf(re);
                this.selectedItems.splice(index, 1);
            }
        }
    }

    // **************************************--->ACTION  VIEW  FUNCTIONS<----********************************

    onCommitDetailsAction(data) { // Workflow json Action Update
        if (this.node) {
            if (this.node.diagram != undefined && this.node.diagram != null) {
                const model = this.node.diagram.model;
                model.startTransaction();
                model.setDataProperty(this.node.data, "text", data.name);
                if (data.globalIdentifier !== null) {
                    model.setDataProperty(this.node.data, "key", data.globalIdentifier);
                }
                model.setDataProperty(this.node.data, "id", data.id);
                model.setDataProperty(this.node.data, "intentName", this.selectedIntent.name);
                model.setDataProperty(this.node.data, "action", data);
                model.commitTransaction("modified properties");
                this.currentDiagram = this.node.diagram;
                this.updateWorkflow();
            } else {
                this.currentDiagram.select(this.currentDiagram.findNodeForKey(data.globalIdentifier));
                const model = this.node.diagram.model;
                model.startTransaction();
                model.setDataProperty(this.node.data, "text", data.name);
                if (data.globalIdentifier !== null) {
                    model.setDataProperty(this.node.data, "key", data.globalIdentifier);
                }
                model.setDataProperty(this.node.data, "id", data.id);
                model.setDataProperty(this.node.data, "intentName", this.selectedIntent.name);
                model.setDataProperty(this.node.data, "action", data);
                model.commitTransaction("modified properties");
                this.currentDiagram = this.node.diagram;
                this.updateWorkflow();
            }
        }
    }

    onClickedOutsideAction(event, action, response) { // click Outside Action Side Bar
        if (this.insideAction === true) {
            if (action.name != null && action.name != "" && action.url != "" && action.url != null) {
                this.updateServiceAction(action);
            } else {
                this.toastr.error("Some Mandatory felids are missing")
            }
            this.insideAction = false;
        }
    }

    onClickedInsideAction() {  // click Insde Action Side Bar
        this.insideAction = true;
    }

    onActionTypeChange(serviceType) { // reset questions based on change of Entity type to avoid null data in questions
        this.headers = [];
        if (serviceType == "0: json") {
            this.headers.push({ header_key: 'Content-Type', header_value: 'application/json' });
            this.header = {};
        } else if (serviceType == "2: x-www-form-urlencoded") {
            this.headers.push({ header_key: 'Content-Type', header_value: 'application/x-www-form-urlencoded' });
            this.header = {};
        } else if (serviceType == "1: multipart/form-data") {
            this.headers.push({ header_key: 'Content-Type', header_value: 'multipart/form-data' });
            this.header = {};
        }
    }

    createServiceAction(action, response) { // create action
        action.intentId = this.selectedIntent.id;
        action.errorResponses = this.erResponses;
        action.globalIdentifier = uuid();
        if (action.callMethod == 'POST') {
            if (action.serviceType == 'x-www-form-urlencoded' || action.serviceType == 'multipart/form-data') {
                action.requestBody = JSON.stringify({
                    'service_type': action.serviceType,
                    'headers': this.headers,
                    'req_body': {
                        'req_body_params': this.requestParamArr
                    }
                });
            }
            if (action.serviceType == 'json') {
                const body = JSON.stringify({
                    'service_type': action.serviceType,
                    'headers': this.headers,
                    'req_body': {
                        'request_string': action.requestBody
                    }
                });
                action.requestBody = body;
            }
        } else if (action.callMethod == 'GET') {
            this.headers = [];
            this.headers.push({ header_key: 'Content-Type', header_value: 'application/json' }, { header_key: "Authorization", header_value: "" });
            const body = JSON.stringify({
                'service_type': 'json',
                'headers': this.headers,
                'req_body': {}
            });
            action.requestBody = body;
        }

        const confirm = [];
        if (this.actionConfirmMessageEnglish != "" && this.actionConfirmMessageEnglish != undefined
            && this.actionConfirmMessageEnglish != null) {
            confirm.push({
                "confirmationType": "ACTION",
                "text": this.actionConfirmMessageEnglish,
                "confirmationOption": "yes",
                "unConfirmationOption": "no",
                "localeCode": "en",
                "terminationText": "The Service Abort",
                "kuId": this.selectedKu.id
            })
        }

        if (this.actionConfirmMessageArabic != "" && this.actionConfirmMessageArabic != undefined
            && this.actionConfirmMessageArabic != null) {
            confirm.push({
                "confirmationType": "ACTION",
                "text": this.actionConfirmMessageArabic,
                "confirmationOption": "نعم",
                "unConfirmationOption": "لا",
                "localeCode": "ar",
                "terminationText": "تم ايقاف العملية ",
                "kuId": this.selectedKu.id
            })
        }
        const actionExtnModel = []
        action.kuId = this.selectedKu.id;
        const actionEng = {
            'callMethod': action.callMethod,
            'url': action.url,
            'successCode': action.successCode,
            'localeCode': 'en',
            'errorCode': action.errorCode,
            'requestBody': action.requestBody,
            'responsePath': action.responsePath
        }
        if (this.arabicActionUrl != undefined && this.arabicActionUrl != "") {
            const actionArb = {
                'callMethod': action.callMethod,
                'url': this.arabicActionUrl,
                'successCode': action.successCode,
                'localeCode': 'ar',
                'errorCode': action.errorCode,
                'requestBody': this.arabicActionRequestBody,
                'responsePath': action.responsePath
            }
            actionExtnModel.push(actionArb);
        }
        actionExtnModel.push(actionEng);
        action.confirm = confirm;
        action.actionExtn = actionExtnModel;
        this.selectedAction = action;
        response = this.resp;
        this.saService.createServiceAction(action, response)
            .subscribe(successObject => {
                this.successObject = successObject;
                if (this.successObject) {
                    // create workflow Sequence object
                    this.workflowSequence.workflowId = this.workflowId;
                    this.workflowSequence.workflowSequenceKey = this.successObject.globalIdentifier;
                    this.workflowSequence.intentId = this.selectedIntent.id;
                    this.workflowSequence.entryType = "ACTION";
                    this.workflowSequence.entryExpression = this.successObject.id;
                    this.workflowSequence.primaryDestWorkflowId = this.workflowId;
                    this.workflowSequence.primaryDestSequenceKey = null;
                    this.workflowSequence.secondaryDestWorkflowId = null;
                    this.workflowSequence.secondaryDestSequenceKey = null;
                    this.workflowSequence.terminalType = null;
                    this.workflowSequence.required = "Y";
                    this.workflowSequence.kuId = this.selectedKuId;
                    this.createWorkflowSequence(this.workflowSequence);
                    this.onCommitDetailsAction(successObject);
                    this.selectedAction = successObject;
                    this.modalReference.close();
                    this.close('viewAction');
                    this.toastr.success('Service Action added Successfully');
                    this.headers = [];
                    this.requestParam = [];
                }
            },
                errorCode => {
                    if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                        this.toastr.error('Service Action already exists', null, { toastLife: 800 });
                    } else {
                        this.modalReference.close();
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });
    }

    updateServiceAction(action) { // update Service Action
        this.loading = true;
        action.kuId = this.selectedKuId;
        action.intentId = this.selectedIntent.id;
        action.errorResponses = this.erResponses;
        const confirm = [];
        const actionExtnModel = [];
        if (action.callMethod == 'POST') {
            if (action.serviceType == 'x-www-form-urlencoded' || action.serviceType == 'multipart/form-data') {
                action.requestBody = JSON.stringify({
                    'service_type': action.serviceType,
                    'headers': this.headers,
                    'req_body': {
                        'req_body_params': this.requestParamArr
                    }
                });
            } else if (action.serviceType == 'json') {
                const body = JSON.stringify({
                    'service_type': action.serviceType,
                    'headers': this.headers,
                    'req_body': {
                        'request_string': action.requestBody
                    }
                });
                action.requestBody = body;
            }
        } else if (action.callMethod == 'GET') {
            this.headers = [];
            this.headers.push({ header_key: 'Content-Type', header_value: 'application/json' }, { header_key: "Authorization", header_value: "" });
            const body = JSON.stringify({
                'service_type': 'json',
                'headers': this.headers,
                'req_body': {}
            });
            action.requestBody = body;
        }

        if (action.confirm.length != 0) {
            for (const confirmAction of action.confirm) {
                if (confirmAction.localeCode == "en") {
                    confirm.push({
                        "confirmationType": "ACTION",
                        "text": this.actionConfirmMessageEnglish,
                        "confirmationOption": "yes",
                        "unConfirmationOption": "no",
                        "localeCode": "en",
                        "id": confirmAction.id,
                        "terminationText": "The Service Abort",
                        "kuId": this.selectedKu.id
                    })
                } if (this.actionConfirmMessageArabic != undefined
                    && this.actionConfirmMessageArabic != null && confirmAction.localeCode == "ar") {
                    confirm.push({
                        "confirmationType": "ACTION",
                        "text": this.actionConfirmMessageArabic,
                        "confirmationOption": "نعم",
                        "unConfirmationOption": "لا",
                        "localeCode": "ar",
                        "terminationText": "تم ايقاف العملية ",
                        "kuId": this.selectedKu.id,
                        "id": confirmAction.id,
                    })
                } else if (action.confirm.length == 1 && this.actionConfirmMessageArabic != undefined
                    && this.actionConfirmMessageArabic != null) {
                    confirm.push({
                        "confirmationType": "ACTION",
                        "text": this.actionConfirmMessageArabic,
                        "confirmationOption": "نعم",
                        "unConfirmationOption": "لا",
                        "localeCode": "ar",
                        "terminationText": "تم ايقاف العملية ",
                        "kuId": this.selectedKu.id
                    })
                }
            }
        } else {
            if (this.actionConfirmMessageArabic != undefined
                && this.actionConfirmMessageArabic != null) {
                confirm.push({
                    "confirmationType": "ACTION",
                    "text": this.actionConfirmMessageArabic,
                    "confirmationOption": "نعم",
                    "unConfirmationOption": "لا",
                    "localeCode": "ar",
                    "terminationText": "تم ايقاف العملية ",
                    "kuId": this.selectedKu.id
                })
            }
            confirm.push({
                "confirmationType": "ACTION",
                "text": this.actionConfirmMessageEnglish,
                "confirmationOption": "yes",
                "unConfirmationOption": "no",
                "localeCode": "en",
                "terminationText": "The Service Abort",
                "kuId": this.selectedKu.id
            })
        }

        for (const actionExtn of action.actionExtn) {
            if (actionExtn.localeCode == 'en') {
                const actionEng = {
                    'id': actionExtn.id,
                    'callMethod': action.callMethod,
                    'url': action.url,
                    'successCode': action.successCode,
                    'localeCode': 'en',
                    'errorCode': action.errorCode,
                    'requestBody': action.requestBody,
                    'responsePath': action.responsePath
                }
                actionExtnModel.push(actionEng);
            } if (this.arabicActionUrl != undefined && actionExtn.localeCode == 'ar') {
                const actionArb = {
                    'id': actionExtn.id,
                    'callMethod': action.callMethod,
                    'url': this.arabicActionUrl,
                    'successCode': action.successCode,
                    'localeCode': 'ar',
                    'errorCode': action.errorCode,
                    'requestBody': action.requestBody,
                    'responsePath': action.responsePath
                }
                actionExtnModel.push(actionArb);
            } else if (action.actionExtn.length == 1 && this.arabicActionUrl != undefined) {
                const actionArb = {
                    'callMethod': action.callMethod,
                    'url': this.arabicActionUrl,
                    'successCode': action.successCode,
                    'localeCode': 'ar',
                    'errorCode': action.errorCode,
                    'requestBody': action.requestBody,
                    'responsePath': action.responsePath
                }
                actionExtnModel.push(actionArb);
            }
        }
        action.actionExtn = [];
        action.actionExtn = actionExtnModel;
        action.confirm = [];
        action.confirm = confirm;
        action.globalIdentifier = this.selectedAction.globalIdentifier;
        this.selectedAction = action;
        this.onCommitDetailsAction(this.selectedAction);
        if (this.node) {
            if (this.node.diagram) {
                this.currentDiagram = this.node.diagram;
            }
        }
        this.saService.updateServiceAction(action)
            .subscribe(successCode => {
                this.successObject = successCode;
                this.insideAction = false;
                this.loading = false;
                if (this.successObject == 203) {
                    this.toastr.error('Service/Action already exists.');
                }
            },
                errorCode => {
                    if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                        this.toastr.error('Service/Action  already exists');
                    } else {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });
    }

    actionsList(nodeDataArray) { // list of entities in the diagram
        this.selectedActions = [];
        for (const node of nodeDataArray) {
            if (node.modelid == 3) {
                this.selectedActions.push(node)
            }
        }
    }

    // **************************************--->RESPONSE  VIEW  FUNCTIONS<----********************************

    onCommitDetailsResponse(resp) { // Workflow json Response Update
        if (this.node.diagram) {
            if (this.selectedIntent.name != null && this.selectedIntent.name != "") {
                const model = this.node.diagram.model;
                model.startTransaction();
                model.setDataProperty(this.node.data, "text", "Responses");
                model.setDataProperty(this.node.data, "id", resp.id);
                model.setDataProperty(this.node.data, "intentName", this.selectedIntent.name);
                model.setDataProperty(this.node.data, "message", resp);
                model.commitTransaction("modified properties");
                this.currentDiagram = this.node.diagram;
                this.updateWorkflow();
            }
        } else {
            this.currentDiagram.select(this.currentDiagram.findNodeForKey(this.responseNodeKey));
            const model = this.node.diagram.model;
            model.startTransaction();
            model.setDataProperty(this.node.data, "text", "Responses");
            model.setDataProperty(this.node.data, "id", resp.id);
            model.setDataProperty(this.node.data, "intentName", this.selectedIntent.name);
            model.setDataProperty(this.node.data, "message", resp);
            model.commitTransaction("modified properties");
            this.currentDiagram = this.node.diagram;
            this.updateWorkflow();
            this.currentDiagram.select(this.currentDiagram.findNodeForKey(this.responseNodeKey));
        }
    }

    createResponses() {  // create Response
        if (this.resp.length != 0) {
            this.messageService.createResponse(this.selectedIntent, this.resp)
                .subscribe(successCode => {
                    this.successObject = successCode;
                    if (this.successObject) {
                        // create workflow Sequence object
                        this.workflowSequence.workflowId = this.workflowId;
                        this.workflowSequence.workflowSequenceKey = this.node.key;
                        this.workflowSequence.intentId = this.selectedIntent.id;
                        this.workflowSequence.entryType = "MESSAGE";
                        this.workflowSequence.entryExpression = this.successObject.id;
                        this.workflowSequence.primaryDestWorkflowId = this.workflowId;
                        this.workflowSequence.primaryDestSequenceKey = null;
                        this.workflowSequence.secondaryDestWorkflowId = null;
                        this.workflowSequence.secondaryDestSequenceKey = null;
                        this.workflowSequence.terminalType = null;
                        this.workflowSequence.required = "Y";
                        this.workflowSequence.kuId = this.selectedKuId;
                        this.createWorkflowSequence(this.workflowSequence);
                        this.onCommitDetailsResponse(successCode);
                        this.close('viewResponse');
                        this.modalReference.close();
                        this.toastr.success('Response added Successfully');
                    }
                },
                    errorCode => {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    });
        } else {
            this.toastr.error('Add Responses');
        }

    }

    checkArabicCreateResponse() { // check arabic language  is empty on create
        this.createResponseLangWarning = false;
        if (this.resTag.length > 0 && this.resArabicTag.length == 0) {
            this.createResponseLangWarning = true;
        }
    }

    checkArabicUpdateResponse() { // check arabic language  is empty on update
        this.updateResponseLangWarning = false;
        if (this.resTag.length > 0 && this.resArabicTag.length == 0) {
            this.updateResponseLangWarning = true;
        }
    }

    onClickedOutsideResponses(event) {  // click Outside Responses Side Bar
        if (this.insideResponse === true) {
            if (this.resTag.length == 0) {
                this.toastr.error('Add Response');
            } else {
                this.getUpdatedWorkFlow(this.selectedIntent);
            }
            this.insideResponse = false;
        }
    }

    onClickedInsideResponses() {  // click Insde Responses Side Bar
        this.insideResponse = true;
    }

    editOneResponse(response) { // edit one response
        const resp = [];
        resp.push(response);
        this.messageService.updateOneResponse(this.selectedIntent, resp, this.selectedMessages)
            .subscribe(successCode => {
                this.insideResponse = false;
                this.successObject = successCode;
                if (this.successObject == 203) {
                    this.toastr.error('Response already exists.');
                } else {
                    this.updateWorkflow();
                }
            },
                errorCode => {
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });
    }

    onSelectResponse(response) { // load one response to edit
        if (this.selectedResponses.length != 0) {
            for (const re of this.selectedResponses) {
                if (response == re.responseText) {
                    this.editResponses = re;
                }
            }
        }
    }

    deleteOneResponse(response) { // delete one response
        if (this.resTag.length > 0) {
            for (const re of this.selectedResponses) {
                if (response == re.responseText) {
                    const responseId = re.id;
                    const index: number = this.selectedResponses.indexOf(re);
                    this.selectedResponses.splice(index, 1);
                    this.messageService.deleteOneResponse(responseId)
                        .subscribe(success => { });
                    break;
                }
            }
        } else {
            this.resTag.push(response);
            this.toastr.error('Response Should Be Mandatory ');
        }

    }

    updateResponse(response) { // update response
        this.updateRes = new Response();
        this.updateRes.responseText = response.value;
        this.updateRes.localeCode = "en";
        this.updateResps.push(this.updateRes);
        this.resp.push(this.updateRes);
        this.messageService.updateResponse(this.selectedIntent, this.updateResps, this.selectedMessages)
            .subscribe(successCode => {
                this.insideResponse = false;
                this.successObject = successCode;
                if (this.successObject == 203) {
                    this.toastr.error('Response already exists.');
                } else {
                    this.updateResps = [];

                }
            },
                errorCode => {
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });
    }

    updateArabicResponse(response) { // update arabic response
        this.updateRes = new Response();
        this.updateRes.responseText = response.value;
        this.updateRes.localeCode = "ar";
        this.updateResps.push(this.updateRes);
        this.resp.push(this.updateRes);
        this.messageService.updateResponse(this.selectedIntent, this.updateResps, this.selectedMessages)
            .subscribe(successCode => {
                this.insideResponse = false;
                this.successObject = successCode;
                if (this.successObject == 203) {
                    this.toastr.error('Response already exists.');
                } else {
                    this.updateResps = [];
                }
            },
                errorCode => {
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });
    }

    deleteResponse() { // delete response node
        this.node.data.modelid = 100;
        this.node.diagram.commandHandler.deleteSelection();
        this.messageService.deleteResponse(this.selectedIntent.id)
            .subscribe(successCode => {
                this.successObject = successCode;
                this.close('viewResponse');
                this.modalReference.close();
                this.toastr.success('Response deleted successfully.');

            },
                errorCode => {
                    this.modalReference.close();
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });
    }

    // **************************************--->DECISION  VIEW  FUNCTIONS<----******************************

    loadDecisionValues(nodeDataArray) {
        for (const nodeData of nodeDataArray) {
            if (nodeData.modelid == 5) {
                this.beg = nodeData;
            }
        }
    }

    // 8888888888888888888888888888888888888888--->END<----88888888888888888888888888888888888888888888888888

    ngOnInit() { // Init Function
        this.showAddRegExModal = false;
        this.viewEditTable = false;
        this.entityRequired = true;
        this.hideKuTab = true;
        this.rightSideView = false;
        this.showRegExWarningMessage = false;
        this.viewAction = false;
        this.viewIntent = false;
        this.viewResponse = false;
        this.viewEntity = false;
        this.intents = [];
        this.intent = {};
        this.updateInt = new Intent();
        this.selectedAction = new Action();
        this.regEx = new RegularExpression();
        this.entity.entityType = "GEN";
        this.dropdownSettings = {
            singleSelection: false,
            text: "Select RegularExpression",
            enableSearchFilter: false,
            limitSelection: 200,
            classes: "myclass custom-class"
        };
    }

    createMapRegEx(maps) {
        this.dashboardService.createRegexMapping(maps, this.mapRegExs).subscribe(success => {
            this.successObject = success;
        },
            errorCode => {
                this.toastr.error('Service Error', null, { toastLife: 800 });
            });
    }

    updateQuestion(questions, example) {
        if (this.entity.entityType == 'ELS' || this.entity.entityType == 'EILS' || this.entity.entityType == 'EQRP') {
            if (this.entityQuestionSubTitle != undefined && this.entityQuestionTitle != undefined && this.entityButtonText != undefined) {
                this.questions.push({
                    'id': null, 'question': questions.value, 'entity': { 'id': this.selectedEntity.id }, 'example': example,
                    'localeCode': "en", 'title': this.entityQuestionTitle, 'subTitle': this.entityQuestionSubTitle, 'buttonText': this.entityButtonText,
                    'imageUrl': this.entityImageUrl
                })
                this.updateQuestions.push({
                    'id': null, 'question': questions.value, 'entity': { 'id': this.selectedEntity.id }, 'example': example,
                    'localeCode': "en", 'title': this.entityQuestionTitle, 'subTitle': this.entityQuestionSubTitle, 'buttonText': this.entityButtonText,
                    'imageUrl': this.entityImageUrl
                });
            } else {
                this.toastr.error(" Please fill all the above feilds");
                for (const er of this.questionsTag) {
                    if (questions.value == er.value) {
                        const index: number = this.questionsTag.indexOf(er);
                        this.questionsTag.splice(index, 1);
                    }
                }
            }
        } else {
            const ques = {
                'id': null, 'localeCode': "en",
                'question': questions.value, 'example': example, 'entity': { 'id': this.selectedEntity.id }
            };
            this.updateQuestions.push(ques);
            this.questions.push(ques);
        }
    }

    updateQuestionArabic(questions, example) {
        if (this.entity.entityType == 'ELS' || this.entity.entityType == 'EILS' || this.entity.entityType == 'EQRP') {
            if (this.entityQuestionSubTitle != undefined && this.entityQuestionTitle != undefined && this.entityButtonText != undefined) {
                this.questions.push({
                    'id': null, 'question': questions.value, 'entity': { 'id': this.selectedEntity.id }, 'example': example,
                    'localeCode': "ar", 'title': this.entityQuestionTitle, 'subTitle': this.entityQuestionSubTitle, 'buttonText': this.entityButtonText,
                    'imageUrl': this.entityImageUrl
                })
                this.updateQuestions.push({
                    'id': null, 'question': questions.value, 'entity': { 'id': this.selectedEntity.id }, 'example': example,
                    'localeCode': "ar", 'title': this.entityQuestionTitle, 'subTitle': this.entityQuestionSubTitle, 'buttonText': this.entityButtonText,
                    'imageUrl': this.entityImageUrl
                });
            } else {
                this.toastr.error(" Please fill all the above feilds");
                for (const er of this.questionsTag) {
                    if (questions.value == er.value) {
                        const index: number = this.questionsTag.indexOf(er);
                        this.questionsTag.splice(index, 1);
                    }
                }
            }
        } else {
            const ques = {
                'id': null, 'question': questions.value,
                'localeCode': "ar", 'example': example, 'entity': { 'id': this.selectedEntity.id }
            };
            this.updateQuestions.push(ques);
            this.questions.push(ques);
        }
    }

    updateQuestionsData(questions) {
        this.entityService.updateQuestion(this.selectedEntity, questions)
            .subscribe(successCode => {
                this.successObject = successCode;
            },
                errorCode => {
                });
    }

    createMapping(mapping) {
        this.dashboardService.createMapping(mapping)
            .subscribe(successCode => {
                this.successObject = successCode;
                if (this.successObject == 203) {
                    this.toastr.error('Mapping already exists.');
                } else {
                    this.toastr.success('Mapping added Successfully');
                }
            },
                errorCode => {
                    if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                    } else {
                    }
                });
    }

    onRequiredChangeNew(value) {
        if (value) {
            this.entityNew.required = "Y";
        } else {
            this.entityNew.required = "N";
        }
    }

    onRequiredChange(value) {
        if (value) {
            this.entity.required = "Y";
        } else {
            this.entity.required = "N";
        }
    }

    addErrorResponse(response) {
        if (response.code != null && response.message != null && response.code != "" && response.message != "") {
            this.erResponse = new ErrorResponses();
            this.erResponse.errorCode = response.code;
            this.erResponse.errorResponse = response.message;
            this.erResponse.localeCode = "en";
            this.erResponses.push(this.erResponse);
            this.er = {};
        } else {
            this.toastr.error('Error code and Error Message is Mandatory.');
        }
    }

    addHeaders(header) {
        if (header.header_key != null && header.header_value != null && header.header_key != "" && header.header_value != "") {
            this.headers.push(header);
            this.header = {};
        } else {
            this.toastr.error('Header value and Header Code are Mandatory.');
        }
    }

    addRequestParams(requestParam) {
        if (requestParam.entitykey != null && requestParam.entityvalue != null && requestParam.entitykey != "" && requestParam.entityvalue != "") {
            this.requestParamArr.push(requestParam);
            this.requestParam = {};
        } else {
            this.toastr.error('RequestParam value and RequestParam Code are Mandatory.');
        }

    }

    addErrorResponseArabic(response) {
        if (response.code != null && response.message != null && response.code != "" && response.message != "") {
            this.erResponse = new ErrorResponses();
            this.erResponse.errorCode = response.code;
            this.erResponse.errorResponse = response.message;
            this.erResponse.localeCode = "ar";
            this.erResponses.push(this.erResponse);
            this.er = {};
        } else {
            this.toastr.error('Error code and Error Message is Mandatory.');
        }
    }

    createQuestion(question, example) {
        if (this.entityNew.entityType == 'ELS' || this.entityNew.entityType == 'EILS' || this.entityNew.entityType == 'EQRP') {
            if (this.entityNew.entityType == 'ELS' && this.entityQuestionSubTitle != undefined && this.entityQuestionTitle != undefined && this.entityButtonText != undefined &&
                this.entityQuestionSubTitle != "" && this.entityQuestionTitle != "" && this.entityButtonText != "") {
                this.questions.push({
                    'id': null, 'question': question.value, 'entity': null, 'example': example,
                    'localeCode': "en", 'title': this.entityQuestionTitle, 'subTitle': this.entityQuestionSubTitle, 'buttonText': this.entityButtonText,
                    'imageUrl': this.entityImageUrl
                })
            } else if (this.entityNew.entityType == 'EILS' && this.entityQuestionSubTitle != undefined && this.entityQuestionTitle != undefined && this.entityButtonText != undefined && this.entityImageUrl != undefined &&
                this.entityQuestionSubTitle != "" && this.entityQuestionTitle != "" && this.entityButtonText != "" && this.entityImageUrl != "") {
                this.questions.push({
                    'id': null, 'question': question.value, 'entity': null, 'example': example,
                    'localeCode': "en", 'title': this.entityQuestionTitle, 'subTitle': this.entityQuestionSubTitle, 'buttonText': this.entityButtonText,
                    'imageUrl': this.entityImageUrl
                })
            } else if (this.entityNew.entityType == 'EQRP' && this.entityQuestionTitle != undefined && this.entityButtonText != undefined &&
                this.entityQuestionTitle != "" && this.entityButtonText != "") {
                this.questions.push({
                    'id': null, 'question': question.value, 'entity': null, 'example': example,
                    'localeCode': "en", 'title': this.entityQuestionTitle, 'subTitle': this.entityQuestionSubTitle, 'buttonText': this.entityButtonText,
                    'imageUrl': this.entityImageUrl
                })
            } else {
                this.toastr.error(" Please fill all the above fields");
                for (const er of this.questionsTag) {
                    if (question.value == er.value) {
                        const index: number = this.questionsTag.indexOf(er);
                        this.questionsTag.splice(index, 1);
                    }
                }
            }
        } else {
            this.questions.push({
                'id': null, 'question': question.value, 'entity': null, 'example': example,
                "localeCode": "en"
            })
        }
    }

    createArabicQuestion(question, example) {
        if (this.entityNew.entityType == 'ELS' || this.entityNew.entityType == 'EILS' || this.entityNew.entityType == 'EQRP') {
            if (this.entityQuestionSubTitle != undefined && this.entityQuestionTitle != undefined && this.entityButtonText != undefined) {
                this.questions.push({
                    'id': null, 'question': question.value, 'entity': null, 'example': example,
                    'localeCode': "ar", 'title': this.entityQuestionTitle, 'subTitle': this.entityQuestionSubTitle, 'buttonText': this.entityButtonText,
                    'imageUrl': this.entityImageUrl
                })
            } else {
                this.toastr.error(" Please fill all the above feilds");
                for (const er of this.questionsArabicTag) {
                    if (question.value == er.value) {
                        const index: number = this.questionsArabicTag.indexOf(er);
                        this.questionsArabicTag.splice(index, 1);
                    }
                }
            }
        } else {
            this.questions.push({
                'id': null, 'question': question.value, 'entity': null, 'example': example,
                "localeCode": "ar"
            })
        }
    }

    removeErrorResponse(response) {
        if (this.erResponses.length != 0) {
            for (const er of this.erResponses) {
                if (response.errorResponse == er.errorResponse && response.errorCode == er.errorCode) {
                    if (er.id) {
                        this.dashboardService.removeErrorResponse(er.id)
                            .subscribe(success => {
                            });
                    }
                    const index: number = this.erResponses.indexOf(er);
                    this.erResponses.splice(index, 1);
                }
            }
        }
    }

    removeHeaders(response) {
        if (this.headers.length != 0) {
            for (const header of this.headers) {
                if (response.key == header.key && response.value == header.value) {

                    const index: number = this.headers.indexOf(header);
                    this.headers.splice(index, 1);
                }
            }
        }
    }

    removeRequestParams(response) {
        if (this.requestParamArr.length != 0) {
            for (const requestParam of this.requestParamArr) {
                if (response.entitykey == requestParam.entitykey && response.entityvalue == requestParam.entityvalue) {

                    const index: number = this.requestParamArr.indexOf(requestParam);
                    this.requestParamArr.splice(index, 1);
                }
            }
        }
    }

    sliceQuestionFromList(key) {
        for (const question of this.questions) {
            if (question.question == key.value) {
                const index: number = this.questions.indexOf(question);
                this.questions.splice(index, 1);
            }
        }
    }

    addResponse(response) {
        if (response.value) {
            const res = new Response()
            res.responseText = response.value;
            res.localeCode = "en";
            this.resp.push(res);
        } else {
            this.toastr.error('Response Message is Mandatory.');
        }
    }

    addArabicResponse(response) {
        if (response.value) {
            const res = new Response()
            res.responseText = response.value;
            res.localeCode = "ar";
            this.resp.push(res);
        } else {
            this.toastr.error('Response Message is Mandatory.');
        }
    }

    removeResponse(response) {
        for (const re of this.resp) {
            if (response.value == re.responseText) {
                const index: number = this.resp.indexOf(re);
                this.resp.splice(index, 1);
            }
        }
    }

    updateServiceActionMappingDelete() {
        this.saService.updateServiceActionMappingDelete(this.selectedActionId)
            .subscribe(successCode => {
                this.successObject = successCode;
                if (this.successObject == 203) {
                    this.toastr.error('Service/Action already exists.');
                } else {
                    this.modalReference.close();
                    this.link.data.modelid = 100;
                    this.link.diagram.commandHandler.deleteSelection();
                }
            },
                errorCode => {
                    if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                        this.toastr.error('Service/Action  already exists');
                    } else {
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });
    }

    deleteQuestion(key) {
        this.insideEntity = true;
        if (this.questionsTag.length > 0) {
            for (const question of this.questions) {
                if (question.question == key) {
                    const index: number = this.questions.indexOf(question);
                    this.questions.splice(index, 1);
                    this.deleteQuestionServiceCall(question.id.toString());
                    break;
                }
            }
        } else {
            this.questionsTag.push(key);
            this.toastr.error('At least one question  Should Be Mandatory');
        }
    }

    deleteQuestionServiceCall(questionId: string) { // delete the question from the db
        this.entityService.deleteQuestionById(questionId)
            .subscribe(successCode => {
                this.successObject = successCode;
            },
                errorCode => {
                });

    }

    resetKeywords() {
        this.postKeys = [];
        this.negaKeys = [];
        this.keywords = [];
    }


    sliceSelectedEntitys(en) {
        for (const entity of this.selectedEntitys) {
            if (en.id == entity.entity.id) {
                const index: number = this.selectedEntitys.indexOf(entity);
                this.selectedEntitys.splice(index, 1);
            }
        }
    }

    removeActionModal(removeAction) {
        if (this.node.data.modelid == 3) {
            this.modalReference = this.modalService.open(removeAction, this.ngbModalOptions);
            this.modalReference.result.then((result) => {
                this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
        } else {
            this.toastr.error('Please Select the node to delete');
        }
    }

    removeActionModalTemp() {
        this.modalReference = this.modalService.open(this.removeActionModalTemplate, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    deleteSA() {
        this.saService.deleteSAById(this.selectedAction.id)
            .subscribe(successCode => {
                this.successObject = successCode;
                if (this.node.data.modelid == 3) {
                    this.node.diagram.allowDelete = true;
                    this.node.text = null;
                    this.node.data.modelid = null;
                    this.node.diagram.commandHandler.deleteSelection();
                    // const connectedNode = this.node.findNodesConnected(this.node.portId);
                    this.modalReference.close();
                    this.close('viewAction');
                    this.toastr.success('Service Action deleted successfully.');
                }

            },
                errorCode => {
                    this.modalReference.close();
                    this.toastr.error('Service Error', null, { toastLife: 800 });
                });
    }

    removeResponseModals(removeResponse) {
        if (this.node.data.modelid == 4) {
            this.modalReference = this.modalService.open(removeResponse, this.ngbModalOptions);
            this.modalReference.result.then((result) => {
                this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
        } else {
            this.toastr.error('Please Select the node to delete');
        }
    }

    removeResponseModalsTemps() {
        this.modalReference = this.modalService.open(this.removeResponseModalTemplate, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
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
        regEx.kuId = this.selectedKuId;
        this.reService.createRe(regEx)
            .subscribe(successCode => {
                this.successObject = successCode;
                this.getReLst();
                this.modalReference.close();

                if (this.successObject == 203) {
                    this.toastr.error('regular expression already exists.');
                } else {
                    this.toastr.success('regular expression added Successfully');
                }
            },
                errorCode => {
                    if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                        this.toastr.error('Regular expression already exists');
                    } else {
                        this.modalReference.close();
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });

    }

    checkArabicCreateRegExs() {
        this.updateRegexLangWarning = false;
        if ((this.arabicErrorMessageRegExs === undefined || this.arabicErrorMessageRegExs === "")
            && (this.errorMessageRegExs)) {
            this.updateRegexLangWarning = true;
        }
    }

    createEntityRegEx(regEx) {
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
        regEx.kuId = this.selectedKuId;
        this.reService.createRe(regEx)
            .subscribe(successCode => {
                this.successObject = successCode;
                this.showAddRegExModal = false;
                this.getReLst();

                if (this.successObject == 203) {
                    this.toastr.error('regular expression already exists.');
                } else {
                    this.toastr.success('regular expression added Successfully');
                }
            },
                errorCode => {
                    if (errorCode.errorCode == "DUPLICATE_ENTRY") {
                        this.toastr.error('Regular expression already exists');
                    } else {
                        this.modalReference.close();
                        this.toastr.error('Service Error', null, { toastLife: 800 });
                    }
                });
    }

    addRegEx(content) {
        this.modalReference = this.modalService.open(content);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    showRegEx() {
        this.showAddRegExModal = true;
    }

    hideAddRegexView() {
        this.showAddRegExModal = false;
    }
    checkArabicUpdateAction() {
        this.updateActionLangWarning = false;
        if ((this.actionConfirmMessageArabic === undefined || this.actionConfirmMessageArabic === "")
            && (this.action.confirmation)) {
            this.updateActionLangWarning = true;
        }
    }

    checkArabicUrlCreateAction() {
        this.createActionUrlLangWarning = false;
        if ((this.arabicActionUrl === undefined || this.arabicActionUrl === ""
            || this.arabicActionUrl === null)
            && (this.action.url)) {
            this.createActionUrlLangWarning = true;
        }

        if ((this.arabicActionRequestBody === undefined || this.arabicActionRequestBody === ""
            || this.arabicActionRequestBody === null)
            && (this.action.requestBody)) {
            this.createActionUrlLangWarning = true;
        }
    }

    checkArabicCreateAction() {
        this.createActionLangWarning = false;
        if ((this.actionConfirmMessageArabic === undefined || this.actionConfirmMessageArabic === ""
            || this.actionConfirmMessageArabic === null)
            && (this.actionConfirmMessageEnglish)) {
            this.createActionLangWarning = true;
        }
    }

    collectAllPaths(begin, end) {

        const stack = new go.List(go.Node);
        const coll = new go.List(go.List);

        begin = this.currentDiagram.findNodeForKey(begin.key);
        end = this.currentDiagram.findNodeForKey(end.key);
        function find(begins, ends) {
            begins.findNodesOutOf().each(function(n) {
                if (n === begins) { return };  // ignore reflexive links
                if (n === ends) {  // success
                    const path = stack.copy();
                    path.add(ends);  // finish the path at the end node
                    coll.add(path);  // remember the whole path
                } else if (!stack.contains(n)) {  // inefficient way to check having visited
                    stack.add(n);  // remember that we've been here for this path (but not forever)
                    find(n, ends);
                    stack.removeAt(stack.count - 1);
                }  // else might be a cycle
            });
        }

        this.stack.add(begin);  // start the path at the begin node
        find(begin, end);
        return coll;
    }

    isEntityAvilableInPath(path) {
        let reValue = false;
        console.log(path.iterator.count);
        if (path.iterator.count != 0) {
            const it = path.iterator;
            while (it.next()) {
                const ds = it.value.iterator;
                while (ds.next()) {
                    if (ds.value.data.modelid == 2) {
                        reValue = true;
                    }
                }
            }
            return reValue;
        } else {
            return true;
        }
    }

    isEntityOrActionAvilableInPath(path) {
        let reValue = false;
        if (path.iterator.count != 0) {
            const it = path.iterator;
            while (it.next()) {
                const ds = it.value.iterator;
                while (ds.next()) {
                    if (ds.value.data.modelid == 2 || ds.value.data.modelid == 3) {
                        reValue = true;
                    }
                }
            }
            return reValue;
        } else {
            return true;
        }
    }

    addexpression(data) {
        this.showError = false;
        this.conditions = [];
        this.exp = this.exp + data;
        this.validateExpression(this.exp);
    }

    validateExpression(exp) {
        this.conditions = [];
        this.i = 0;
        this.exp = exp.toLowerCase();
        this.showError = false;
        this.expression();
    }

    expression() {
        this.condition();
        while (this.i < this.exp.length) {
            if (this.exp[this.i] == 'a' || this.exp[this.i] == 'o' || this.exp[this.i] == ' ') {
                this.logicalOperator();
                this.condition();
            } else {
                if (this.showError) { return }
                console.log(this.i + ": expected either End of sentance or  AND/OR logical operator");
                this.conditions = [];
                this.conditions.push({name : "and "});
                this.conditions.push({name : "or "});
                this.showError = true;
                this.i++;
                break;
            }

        }
    }

    and() {
      if (this.showError) { return }
        if (this.exp[this.i] == 'a') {
            this.i++;
        } else {
            console.log(this.i + ":And is expected")
            this.conditions = [];
            this.showError = true;
            this.conditions.push({ name: "and " });
        }
        if (this.exp[this.i] == 'n') {
            this.i++;
        } else {
            console.log(this.i + ":And is expected")
            this.conditions = [];
            this.showError = true;
            this.conditions.push({ name: "and " });
        }
        if (this.exp[this.i] == 'd') {
            this.i++;
        } else {
            console.log(this.i + ":And is expected")
            this.conditions = [];
            this.showError = true;
            this.conditions.push({ name: "and " });
        }
    }
    or() {
      if (this.showError) { return }
        if (this.exp[this.i] == 'o') {
            this.i++;
        } else {
            console.log(this.i + ":Or is expected")
            this.conditions = [];
            this.conditions.push({ name: "or " });
            this.showError = true;
        }
        if (this.exp[this.i] == 'r') {
            this.i++;
        } else {
            console.log(this.i + ":Or is expected")
            this.conditions = [];
            this.conditions.push({ name: "or " });
            this.showError = true;

        }
    }
    operator() {
      if (this.showError) { return }
        switch (this.exp[this.i]) {
            case '>': this.i++; if (this.exp[this.i] == '=') { this.i++; }; break;
            case '<': this.i++; if (this.exp[this.i] == '=') { this.i++; }; break;
            case '=': this.i++; break;
            case '!': this.i++; if (this.exp[this.i] == '=') { this.i++; }; break;
            default: console.log(this.i + ":Operator is expected"); this.conditions = []; this.showError = true; this.conditions.push({ name: '>' }, { name: '<' }, { name: '=' }, { name: '!' }); break;
        }
    }
    logicalOperator() {
      if (this.showError) { return }
        switch (this.exp[this.i]) {
            case 'a': this.and(); break;
            case 'o': this.or(); break;
            case ' ': this.i++; this.logicalOperator(); break;
            default: console.log(this.i + ":Logical Operator is expected"); this.conditions = []; this.showError = true; this.conditions.push({ name: "or " }, { name: "and " }); break;
        }
    }
    condition() {
      if (this.showError) { return }
        switch (this.exp[this.i]) {
            case ' ': this.i++; this.condition(); break;
            case '(': this.i++; this.condition();
                if (this.exp[this.i] == ')') {
                    this.i++;
                } else {
                    console.log(this.i + " ) is expected");
                    this.conditions = [];
                    this.showError = true;
                    this.conditions.push({ name: ") " });
                }
                ; break;
            default: this.alphaNumeric(); this.operator(); this.alphaNumeric(); break;
        }
    }
    alphaNumeric() {
      if (this.showError) { return }
        const index = this.i;
        const str = " 'abcdefghijklmnopqrstuvwxyz1234567890";
        while (str.includes(this.exp[this.i])) { this.i++; };
            if (index == this.i) {
                console.log(this.i + ":Action name , Entity name or value is expected");
                this.conditions = [];
                this.showError = true;
                for (const data of this.nodeDataArray) {
                    if (data.modelid == 2 || data.modelid == 3) {
                        this.conditions.push({ name: data.text })
                    }
                }
            }
    }

}
