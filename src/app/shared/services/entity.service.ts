import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions, Jsonp, RequestMethod, URLSearchParams } from '@angular/http';

import { Constants } from '../../constants/constant';
import { EntityDetails } from '../../models/entityDetails';
import { EntityType } from '../../models/entitytype';
import { EntityQuestion } from '../../models/entityquestion';
import { Questions } from '../../models/questions';


@Injectable()
export class EntityService {

  constructor(private router: Router, private http: Http) {}

  getEntityTypeLst(): Observable<EntityType[]> { // get all entity type list
    const cpHeaders = new Headers();
    const options = new RequestOptions({ headers: cpHeaders,  withCredentials: true});
    return this.http.get(Constants.GET_ENTITY_TYPES_URL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createEntity(entity): Observable<number> { // create  entity
    const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: cpHeaders, withCredentials: true });
    const body = JSON.stringify({
      'entity': {
        'name': entity.name,
        'kuId': entity.kuId,
        'entityType': entity.entityType,
        'questions': entity.questions,
        'arExample': entity.arExample,
        'engExample': entity.engExample,
        'dataType': entity.dataType,
        'required': entity.required,
        'intentId': entity.intentId,
        'globalIdentifier': entity.globalIdentifier,
        'action': entity.action,
        'regex': entity.regEx
      }
    }
    );
    return this.http.post(Constants.ENTITY_URL, body, options)
      .map(success => success.json())
      .catch(this.handleError);
  }

  updateEntity(entity): Observable<number> { // update entity
    const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: cpHeaders, withCredentials: true });
    const body = JSON.stringify({
      'entity': {
        'name': entity.name,
        'entityType': entity.entityType,
        'id': entity.id,
        'kuId': entity.kuId,
        'arExample': entity.arExample,
        'engExample': entity.engExample,
        'required': entity.required,
        'intentId': entity.intentId,
        'globalIdentifier': entity.globalIdentifier,
        'title': entity.title,
        'dataType': entity.dataType,
        'subTitle' : entity.subTitle,
        'imageUrl': entity.imageUrl,
        'buttonText': entity.buttonText,
        'action': entity.action
      }
    }
    );
    return this.http.put(Constants.ENTITY_URL, body, options)
      .map(success => success.json())
      .catch(this.handleError);
  }

  deleteEntityById(entityId): Observable<number> { // delete Entity By Id
    const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    const params: URLSearchParams = new URLSearchParams();
    params.set('id', entityId);
    const options = new RequestOptions();
    options.headers = cpHeaders;
    options.withCredentials = true;
    options.search = params;
    return this.http.delete(Constants.ENTITY_URL, options)
      .map(success => success.json())
      .catch(this.handleError);
  }

  createQuestion(qustion: Questions): Observable<number> { // create Questions
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: cpHeaders, withCredentials: true});
    const body = JSON.stringify({
      'entityQuestion': {
        'question': qustion.question,
        'entity': qustion.entity
      }
    }
    );
    return this.http.post(Constants.ENTITY_QUESTION_URL, body, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  updateQuestion(entity, qustion): Observable<number> { // update Question
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: cpHeaders, withCredentials: true});
    const body = JSON.stringify({
      'entityQuestion': qustion }
    );
    return this.http.post(Constants.ENTITY_QUESTION_URL, body, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  deleteQuestionById(questionId: string): Observable<number> { // delete Question By Id
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const params: URLSearchParams = new URLSearchParams();
    params.set('id', questionId);
    const options = new RequestOptions();
    options.headers = cpHeaders;
    options.withCredentials = true;
    options.search = params;
    return this.http.delete(Constants.ENTITY_QUESTION_URL, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  createRegexMapping(regexs, entity): Observable<number> {
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const params: URLSearchParams = new URLSearchParams();
    params.set('entityId', entity.id);
    params.set('regexId', regexs.id);
    const options = new RequestOptions();
    options.headers = cpHeaders;
    options.withCredentials = true;
    options.search = params;
    return this.http.post(Constants.REGEX_MAPPING, null, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  deleteRegexMapping(regexs, entity): Observable<number> {
    const cpHeaders = new Headers({'Content-Type': 'application/json'});
    const params: URLSearchParams = new URLSearchParams();
    params.set('entityId', entity.id);
    params.set('regexId', regexs.id);
    const options = new RequestOptions();
    options.headers = cpHeaders;
    options.withCredentials = true;
    options.search = params;
    return this.http.delete(Constants.REGEX_MAPPING, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
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

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }
}
