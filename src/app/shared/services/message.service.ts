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
export class MessageService { // message service

    constructor(private router: Router, private http: Http) { }

    createResponse(intent, response) { // create Response

        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: cpHeaders, withCredentials: true });

        const body = JSON.stringify({
          'message' : {
            'id': null
            } ,
            'intent': {
                'id': intent.id,
                'responses': response,
                'kuId': intent.kuId,
            }
        });
        return this.http.post(Constants.INTENT_RES, body, options)
            .map(success => success.json())
            .catch(this.handleErrorData);
    }

    updateResponse(intent, response, message) { // update Response
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: cpHeaders, withCredentials: true });
        const body = JSON.stringify({
          'message' : {
            'id': message.id
            } ,
            'intent': {
                'id': intent.id,
                'responses': response,
                'kuId': intent.kuId,
            }
        });
        return this.http.post(Constants.INTENT_RES, body, options)
            .map(this.extractData)
            .catch(this.handleErrorData);
    }

    updateOneResponse(intent, response, message) { // update only one response
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: cpHeaders, withCredentials: true });
        const body = JSON.stringify({
          'message' : {
            'id': message.id
            } ,
            'intent': {
                'id': intent.id,
                'responses': response,
                'kuId': intent.kuId,
            }
        });
        return this.http.put(Constants.UPDATE_INTENT_RES, body, options)
            .map(this.extractData)
            .catch(this.handleErrorData);
    }

    deleteResponse(intentId) { // delete response node
      const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
      const params: URLSearchParams = new URLSearchParams();
      params.set('id', intentId);
      const options = new RequestOptions();
      options.headers = cpHeaders;
      options.search = params;
      options.withCredentials = true;
      return this.http.delete(Constants.INTENT_RES, options)
          .map(success => success.status)
          .catch(this.handleErrorData);
    }

    deleteOneResponse(responseId) { // delete one response
      const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
      const params: URLSearchParams = new URLSearchParams();
      params.set('id', responseId);
      const options = new RequestOptions();
      options.headers = cpHeaders;
      options.search = params;
      options.withCredentials = true;
      return this.http.delete(Constants.RES_DEL, options)
          .map(success => success.status)
          .catch(this.handleErrorData);
    }

    private extractData(res: Response) { // handle success Data
        const body = res.json();
        return body.data || {};
    }

    private handleErrorData(error: Response | any) { // handle Error Data
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
