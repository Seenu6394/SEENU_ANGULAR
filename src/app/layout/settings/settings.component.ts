import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {routerTransition} from '../../router.animations';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import * as $ from 'jquery-ui';
import { FormControl, Validators } from '@angular/forms';
import { ToastsManager, ToastOptions} from 'ng2-toastr/ng2-toastr';

import { SettingsService } from '../../shared/services/settings.service';
import { saveAs as importedSaveAs } from "file-saver";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [SettingsService, ToastsManager, ToastOptions, ],
  animations: [routerTransition()]

})

export class SettingsComponent implements OnInit {

  // language checkbox
  enableArabicLang: boolean;
  enableEnglishLang: boolean;

  updateCancelLangWarning: boolean;
  updateFillerLangWarning: boolean;

  projectKeywords: any = [];
  fillerKeys: any = [];
  arabicFillerKeys: any = [];

  cancelKeywords: any = [];
  arabicCancelKeys: any = [];
  cancelKeys: any = [];

  // Loading
  loading = false;
  // export
  exportJson: any = {};
  exportFileName: any;

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
    private settingsService: SettingsService,
    public toastr: ToastsManager,
    vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.enableEnglishLang = true // default language
    this.enableArabicLang = false;
    this.getLanguages();
    this.getProjectKeywords();
  }

  // tag-input Validations RegEx
  tagValidation(control: FormControl) {

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

  tagValidationArabic(control: FormControl) {

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

  // tag-input Validations check length
  length(control: FormControl) {
      if (control.value.length >= 25) {
          return {
              'length': true
          };
      }
      return null;
  }


  changeTagOnAdding(tag) {
      tag.toLowerCase(tag)
      return Observable.of(tag.toLowerCase(tag));
  }

  getLanguages() {
    this.settingsService.getLanguages()
    .subscribe(success => {
      this.enableEnglishLang = success.english;
      this.enableArabicLang = success.arabic;
      localStorage.setItem("arabicLang", success.arabic)
    },
    error => {
      this.toastr.error("Service Error");
    });
  }

  updateLanguages() {
    const language = {'arabic': this.enableArabicLang, 'english': true};
    if (this.enableArabicLang) {
      localStorage.setItem("arabicLang", "true")
    } else {
      localStorage.setItem("arabicLang", "false")
    }
    this.settingsService.updateLanguages(language)
    .subscribe(success => {
      this.toastr.success("Languages Updated Successfully");
    },
    error => {
      this.toastr.error("Service Error");
    });
  }

  getProjectKeywords() { // get all project keywords
    this.settingsService.getProjectKeywords()
    .subscribe(success => {
        this.projectKeywords = [];
        this.fillerKeys = [];
        this.cancelKeys = [];
        this.arabicFillerKeys = [];
        this.arabicCancelKeys = [];
        this.projectKeywords = success;
       for (const projectKeywords  of this.projectKeywords) {
          if (projectKeywords.localeCode === "ar" && projectKeywords.keywordType === "FILLER") {
            this.arabicFillerKeys.push(projectKeywords.projectKeyword )
          } else if (projectKeywords.localeCode === "en" && projectKeywords.keywordType === "FILLER") {
            this.fillerKeys.push(projectKeywords.projectKeyword)
          } else if (projectKeywords.localeCode === "ar" && projectKeywords.keywordType === "CANCEL") {
            this.arabicCancelKeys.push(projectKeywords.projectKeyword)
          } else if (projectKeywords.localeCode === "en" && projectKeywords.keywordType === "CANCEL") {
            this.cancelKeys.push(projectKeywords.projectKeyword)
          }
       }
       this.checkArabicUpdateFiller();
    },
    error => {
      this.toastr.error("Service Error");
    });
  }

  createFillerKeyword(event) { // create english filler keywords
    event.localeCode = "en";
    event.projectKeyword = event.value;
    event.keywordType = "FILLER"
    this.settingsService.projectKeywords(event)
        .subscribe(success => {
            this.toastr.success('Filler Keywords Added Successfully');
        },
        error => {
          if (error.errorCode === "DUPLICATE_ENTRY") {
              this.toastr.error("Keyword already exist");
              this.getProjectKeywords();
          }
        });

  }

  createArabicFillerKeyword(event) { // create arabic filler keywords
    event.localeCode = "ar";
    event.projectKeyword = event.value;
    event.keywordType = "FILLER"
    this.settingsService.projectKeywords(event)
        .subscribe(success => {
            this.toastr.success('Filler Keywords Added Successfully');
        },
        error => {
         if (error.errorCode === "DUPLICATE_ENTRY") {
              this.toastr.error("Keyword already exist");
              this.getProjectKeywords();
          }
        });
  }

  sliceKeywordFromList(value) { // delete Project Keywords
    for (const keyword of this.projectKeywords) {
        if (keyword.projectKeyword == value) {
            const index: number = this.projectKeywords.indexOf(keyword);
            this.projectKeywords.splice(index, 1);
            this.settingsService.deleteProjectKeywords(keyword)
                .subscribe(success => {
                },
                error => {
                  this.toastr.error("Service Error");
                });
        }
    }
  }

  createCancelKeyword(event) {
    event.localeCode = "en";
    event.projectKeyword = event.value;
    event.keywordType = "CANCEL"
    this.settingsService.projectKeywords(event)
        .subscribe(success => {
            this.toastr.success('Cancel Keywords Added Successfully');
        },
        error => {
          if (error.errorCode === "DUPLICATE_ENTRY") {
              this.toastr.error("Keyword already exist");
              this.getProjectKeywords();
          }
        });
  }

  createArabicCancelKeyword(event) {
    event.localeCode = "ar";
    event.projectKeyword = event.value;
    event.keywordType = "CANCEL"
    this.settingsService.projectKeywords(event)
        .subscribe(success => {
            this.toastr.success('Cancel Keywords Added Successfully');
        },
        error => {
          if (error.errorCode === "DUPLICATE_ENTRY") {
              this.toastr.error("Keyword already exist");
              this.getProjectKeywords();
          }
        });
  }

  checkArabicUpdateCancel() {
      this.updateCancelLangWarning = false;
      if (this.cancelKeys.length > 0 && this.arabicCancelKeys.length == 0) {
          this.updateCancelLangWarning = true;
      }
  }

  checkArabicUpdateFiller() {
      this.updateFillerLangWarning = false;
      if (this.fillerKeys.length > 0 && this.arabicFillerKeys.length == 0) {
          this.updateFillerLangWarning = true;
      }
  }

  exportSettings() {
      this.loading = true;
      this.settingsService.getSettings()
          .subscribe(
          settings => {
              this.exportJson = settings
              if (this.exportJson) {
                  this.loading = false;
                  this.exportFileName = 'BC.settings';
                  const theJSON = JSON.stringify(this.exportJson);
                  const file = new Blob([theJSON], { type: 'text/json;charset=utf-8' });
                  importedSaveAs(file, this.exportFileName);
              }
          },
          error => {
              this.loading = false;
          });
  }

  // file Upload Edit View For Duplicate Values
  fileUploaderSettings(event) {
      this.loading = true;
      let file: File = null;
      let fileList: FileList = null;
      fileList = event.target.files;
      if (fileList.length > 0) {
          file = fileList[0];
          this.loading = true;
          this.settingsService.uploadSettings(file).subscribe(
              success => {
                this.loading = false;
                this.toastr.success('File upload success');
                this.getProjectKeywords();
              },
              error => {
                  if (error) {
                      this.loading = false;
                      this.toastr.error('File Corrupted');
                  }
              }
          );
      }
  }

}
