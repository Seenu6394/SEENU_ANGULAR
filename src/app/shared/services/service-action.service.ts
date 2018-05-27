// Observable Version
import {Constants} from '../../constants/constant';
import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions, Jsonp, RequestMethod, URLSearchParams} from '@angular/http';
import { Router } from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {Action} from '../../models/action';
import {ConfirmAction} from '../../models/confirmaction';
import {$} from 'protractor';

@Injectable()
export class ServiceActionService {

  constructor(private router: Router, private http: Http) {}

  getSALst(): Observable<Action[]> {
    const cpHeaders = new Headers();
    const options = new RequestOptions({headers: cpHeaders, withCredentials: true});
    return this.http.get(Constants.GET_ALL_SA_URL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createServiceAction(action, response): Observable<number> {

    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: cpHeaders, withCredentials: true});
    const body = JSON.stringify({
      'action': {
        'name': action.name,
        'kuId': action.kuId,
        'callMethod': action.callMethod,
        'url': action.url,
        'intentId': action.intentId,
        'requestBody': action.requestBody,
        'dataType': action.dataType,
        'errorResponses': action.errorResponses,
        'globalIdentifier': action.globalIdentifier,
        'actionExtn': action.actionExtn
      },
      'response': response,
      'errorNode': action.errorNode,
      'confirm': action.confirm,
    }
    );
    return this.http.post(Constants.SA_URL, body, options)
      .map(success => success.json())
      .catch(this.handleError);
  }

  createEntityServiceAction(action): Observable<number> {

    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: cpHeaders, withCredentials: true});
    const body = JSON.stringify({
      'action': {
        'kuId': action.kuId,
        'name': action.name,
        'callMethod': action.callMethod,
        'url': action.url,
        'intentId': null,
        'entityId': action.entityId,
        'requestBody': action.requestBody,
        'errorResponses': action.errorResponses,
        'globalIdentifier': action.globalIdentifier,
      },
      'errorNode': action.errorNode
    }
    );
    return this.http.post(Constants.SA_URL, body, options)
      .map(success => success.json())
      .catch(this.handleError);
  }

  updateEntityServiceAction(action): Observable<any> {
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
      const options = new RequestOptions({headers: cpHeaders, withCredentials: true});
    const body = JSON.stringify({
      'action': {
        'name': action.name,
        'id': action.id,
        'kuId': action.kuId,
        'callMethod': action.callMethod,
        'url': action.url,
        'intentId': null,
        'entityId': action.entityId,
        'requestBody': action.requestBody,
        'errorNode': action.errorNode,
        'errorResponses': action.errorResponses,
        'globalIdentifier': action.globalIdentifier,
      },
        'confirm': action.confirm,
    }
    );
    return this.http.put(Constants.SA_URL, body, options)
      .map(success => success.status)
      .catch(this.handleError);
  }


  getSAByKu(kuId: string): Observable<Action[]> {
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const cpParams = new URLSearchParams();
    cpParams.set('id', kuId);
    const options = new RequestOptions({headers: cpHeaders, params: cpParams, withCredentials: true});
    return this.http.get(Constants.GET_SA_BY_KU_URL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }


  deleteSAById(actionid): Observable<number> {
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const params: URLSearchParams = new URLSearchParams();
    params.set('id', actionid);
    const options = new RequestOptions();
    options.headers = cpHeaders;
    options.search = params;
    options.withCredentials = true;
    return this.http.delete(Constants.SA_URL, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }

  getSAById(actionId: string): Observable<Action> {
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const cpParams = new URLSearchParams();
    cpParams.set('id', actionId);
    const options = new RequestOptions({headers: cpHeaders, params: cpParams, withCredentials: true});
    return this.http.get(Constants.SA_URL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateServiceAction(action): Observable<any> {
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
      const options = new RequestOptions({headers: cpHeaders, withCredentials: true});
    const body = JSON.stringify({
      'action': {
        'name': action.name,
        'id': action.id,
        'kuId': action.kuId,
        'callMethod': action.callMethod,
        'url': action.url,
        'intentId': action.intentId,
        'requestBody': action.requestBody,
        'errorNode': action.errorCode,
        'dataType': action.dataType,
        'errorResponses': action.errorResponses,
        'globalIdentifier': action.globalIdentifier,
        'actionExtn': action.actionExtn
      },
        'confirm': action.confirm,
    }
    );
    return this.http.put(Constants.SA_URL, body, options)
      .map(success => success.status)
      .catch(this.handleError);
  }
  updateServiceActionMappingDelete(id): Observable<number> {
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
      const options = new RequestOptions({headers: cpHeaders, withCredentials: true});
    const body = JSON.stringify({
      'action': {
        'id': id,
        'intentId': null,
      }
    }
    );
    return this.http.put(Constants.SA_PUT, body, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    if ( error.status === 401) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedin');
      this.router.navigate(['/login']);
      location.reload()
    } else if ( error.status === 404) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedin');
      this.router.navigate(['/**']);
      location.reload()
    } else {
      const body = error.json();
      return Observable.throw(body);
    }
  }
}
