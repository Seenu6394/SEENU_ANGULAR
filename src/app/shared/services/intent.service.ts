// Observable Version
import { Constants } from '../../constants/constant';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions, Jsonp, RequestMethod, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Intent } from '../../models/intent';
import { Keywords } from '../../models/keywords';
import { $ } from 'protractor';

@Injectable()
export class IntentService {

    constructor(private router: Router, private http: Http) { }

    getIntentByKu(kuId: string) { // get intent based on ku
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const cpParams = new URLSearchParams();
        cpParams.set('id', kuId);
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders, params: cpParams });
        return this.http.get(Constants.GET_INTENTS_BY_KU_URL, options)
            .map(this.extractData)
            .catch(this.handleErrorData);
    }

    checkIntent(intent) { // check Intent keyword same set while create intent
      const intant = new Intent();
      const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
      const options = new RequestOptions({ withCredentials: false, headers: cpHeaders });
      const body = JSON.stringify({
          'intent': {
              'name': intent.name,
              'kuId': intent.kuId,
              'keywords': intent.keywords,
              'names': intent.names
          }
      }
      );
      return this.http.post(Constants.INTENT_CHECK, body, options)
          .map(success => success.json())
          .catch(this.handleErrorData);
    }

    checkIntentUpdate(intent) { // check Intent keyword same set while update intent
      const intant = new Intent();
      const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
      const options = new RequestOptions({ withCredentials: false, headers: cpHeaders });
      const body = JSON.stringify({
          'intent': {
              'name': intent.name,
              'intentId': intent.id,
              'kuId': intent.kuId,
              'keywords': intent.keywords,
              'names': intent.names
          }
      }
      );
      return this.http.post(Constants.INTENT_CHECK, body, options)
          .map(success => success.json())
          .catch(this.handleErrorData);
    }

    createIntent(intent) { // create Intent
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
            'intent': {
                'name': intent.name,
                'kuId': intent.kuId,
                'keywords': intent.keywords,
                'names': intent.names,
                'globalIdentifier': intent.globalIdentifier
            }
        }
        );
        return this.http.post(Constants.INTENT_URL, body, options)
            .map(success => success.json())
            .catch(this.handleErrorData);
    }

    createKeyword(keywords) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
            'keywords': keywords
        }

        );
        return this.http.post(Constants.KEYWORD_URL, body, options)
            .map(success => success.status)
            .catch(this.handleErrorData);
    }

    deleteKeywordById(keywordId: string) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('id', keywordId);
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.KEYWORD_URL, options)
            .map(success => success.status)
            .catch(this.handleErrorData);
    }

    deleteintentById(intentid: string) { // Delete article
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('id', intentid);
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.INTENT_URL, options)
            .map(success => success.status)
            .catch(this.handleErrorData);
    }

    deleteIntentById(intentId) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('id', intentId);
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.INTENT_URL, options)
            .map(success => success.status)
            .catch(this.handleErrorData);
    }

    getIntentById(intentId) {
        const cpHeaders = new Headers();
        const cpParams = new URLSearchParams();
        cpParams.set('id', intentId);
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders, params: cpParams });
        return this.http.get(Constants.INTENT_URL, options)
            .map(this.extractData)
            .catch(this.handleErrorData);
    }

    updateIntent(intent) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
            'intent': {
                'name': intent.name,
                'kuId': intent.kuId,
                'id': intent.id,
                'names': intent.names
            }
        }
        );
        return this.http.put(Constants.INTENT_URL, body, options)
            .map(this.extract)
            .catch(this.handleErrorData);
    }

    updateIntentKeywords(intent, keywords) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
            'intents': {
                'name': intent.name,
                'kuId': intent.kuId,
                'id': intent.id,
                'names': intent.names,
                'globalIdentifier': intent.globalIdentifier
            },
              'keywords': keywords
        }
        );
        return this.http.put(Constants.INTENT_URL, body, options)
            .map(this.extract)
            .catch(this.handleErrorData);
    }


    private extract(res: Response) {
        const body = res.json();
        return body || {};
    }

    private extractintentNames(res: Response) {
        const body = res.json();
        return body.names || {};
    }

    private extractData(res: Response) {
        const body = res.json();
        return body.data || {};
    }

    private handleErrorData(error: Response | any) {
      if ( error.status === 401) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedin');
        location.reload();
      } else if ( error.status === 404) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedin');
        location.reload();
      } else {
        const body = error.json();
        return Observable.throw(body);
      }
    }
}
