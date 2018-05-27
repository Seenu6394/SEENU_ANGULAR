import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions, Jsonp, RequestMethod, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Constants } from '../../constants/constant';
import { Ku } from '../../models/ku';


@Injectable()
export class SettingsService {
    constructor(private router: Router, private http: Http) {
    }

    getLanguages(): Observable<any> { // get languages
        const cpHeaders = new Headers();
        const cpParams = new URLSearchParams();
        const options = new RequestOptions({ headers: cpHeaders, withCredentials: true });
        return this.http.get(Constants.GET_LANG, options)
            .map(this.extractData)
            .catch(this.handleErrorData);
    }

    updateLanguages(language): Observable<any> { // update languages
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
            'language': {
                'id': 1,
                'english': language.english,
                'arabic': language.arabic
            }
        });
        return this.http.put(Constants.LANG, body, options)
            .map(this.extractData)
            .catch(this.handleErrorData);
    }

    getProjectKeywords(): Observable<any>  { // get project Keywords
      const cpHeaders = new Headers();
      const cpParams = new URLSearchParams();
      const options = new RequestOptions({ headers: cpHeaders, withCredentials: true });
      return this.http.get(Constants.GET_PRO_KEY, options)
          .map(this.extractData)
          .catch(this.handleErrorData);
    }

    projectKeywords(keyword): Observable<any> { // create  project Keywords
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
            'projectKeywords': [
                {
                    'projectKeyword': keyword.projectKeyword,
                    'localeCode': keyword.localeCode,
                    'keywordType': keyword.keywordType,
                }
            ]
        });
        return this.http.post(Constants.PRO_KEY, body, options)
            .map(this.extractData)
            .catch(this.handleErrorData);
    }

    deleteProjectKeywords(keyword) { // delete Project Keywords
      const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    //  const params: URLSearchParams = new URLSearchParams();
    //  params.set('id', keyword.id);
      const options = new RequestOptions();
      options.headers = cpHeaders;
      // options.search = params;
      options.withCredentials =  true;
      const body = JSON.stringify({
          'projectrKeyword':
              {   'id':  keyword.id,
                  'projectKeyword': keyword.projectKeyword,
                  'localeCode': keyword.localeCode,
                  'keywordType': keyword.keywordType,
              }
      });
      return this.http.post(Constants.PRO_KEY_DEL, body, options)
        .map(success => success.status)
        .catch(this.handleErrorData);
    }

    getSettings(): Observable<any>  {
      const cpHeaders = new Headers();
      const cpParams = new URLSearchParams();
      const options = new RequestOptions({ headers: cpHeaders, withCredentials: true });
      return this.http.get(Constants.GET_SETTINGS, options)
          .map(this.extractData)
          .catch(this.handleErrorData);
    }

    uploadSettings(file) {
        const formData: FormData = new FormData();
        formData.append('file', file);
        const headers = new Headers();
        // /** No need to include Content-Type in Angular 4 */
        const options = new RequestOptions({ withCredentials: true, headers: headers });
        return this.http.post(Constants.IMPORT_SETTINGS, formData, options)
        .map(success => success.status)
        .catch(success => success.status);
    }

    private extractData(res: Response) {
        const body = res.json();
        return body.data || {};
    }

    private handleErrorData(error: Response | any) {
        if (error.status === 401) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedin');
            location.reload()
        } else if (error.status === 404) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedin');
            location.reload()
        } else {
            const body = error.json();
            return Observable.throw(body);
        }
    }
}
