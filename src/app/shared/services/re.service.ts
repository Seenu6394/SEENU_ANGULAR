// Observable Version
import { Constants } from '../../constants/constant';
import { RegularExpression } from '../../models/regularexpression';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions, Jsonp, RequestMethod, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';



@Injectable()
export class ReService {

  constructor(private router: Router, private http: Http) { }

  getReLst(): Observable<RegularExpression[]> {
    const cpHeaders = new Headers();
    const options = new RequestOptions({ headers: cpHeaders,  withCredentials: true});
    return this.http.get(Constants.GET_ALL_RE_URL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getReIntentLst(): Observable<RegularExpression[]> {
    const cpHeaders = new Headers();
    const options = new RequestOptions({ headers: cpHeaders,  withCredentials: true});
    return this.http.get(Constants.GET_ALL_INTENT_RE_URL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createRe(re): Observable<number> {
    const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: cpHeaders ,  withCredentials: true});
    const body = JSON.stringify({
      'regularExpression': {
        'expression': re.expression,
        'message': re.message,
        'regexname': re.regexname,
        'regexes': re.regexs
      }
    }
    );
    return this.http.post(Constants.RE_URL, body, options)
      .map(success => success.status)
      .catch(this.handleError);
  }


  deleteReById(reId: string): Observable<number> {
    const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    const params: URLSearchParams = new URLSearchParams();
    params.set('id', reId);
    const options = new RequestOptions();
    options.headers = cpHeaders;
    options.search = params;
    options.withCredentials = true;
    return this.http.delete(Constants.RE_URL, options)
      .map(success => success.json())
      .catch(this.handleError);
  }


  getReById(entityId: string): Observable<RegularExpression> {
    const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    const cpParams = new URLSearchParams();
    cpParams.set('id', entityId);
    const options = new RequestOptions({ headers: cpHeaders, params: cpParams,  withCredentials: true });
    return this.http.get(Constants.RE_URL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getAllReByKu(kuId: number): Observable<RegularExpression[]> {
    const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    const cpParams = new URLSearchParams();
    cpParams.set('id', kuId + '');
    const options = new RequestOptions({ headers: cpHeaders, params: cpParams,  withCredentials: true });
    return this.http.get(Constants.GET_RE_BY_KU_URL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateRe(re): Observable<number> {
    const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: cpHeaders,  withCredentials: true });
    const body = JSON.stringify({
      'regularExpression': {
        'expression': re.expression,
        'message': re.message,
        'regexname': re.regexname,
        'id': re.id,
        'regexes': re.regexs
      }
    }
    );

    return this.http.put(Constants.RE_URL, body, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    if ( error.status === 401) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedin');
      location.reload()
    } else if ( error.status === 404) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedin');
      location.reload()
    } else {
      const body = error.json();
      return Observable.throw(body);
    }
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }
}
