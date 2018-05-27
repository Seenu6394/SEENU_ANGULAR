import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';

import { Constants } from '../../constants/constant';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions, Jsonp, RequestMethod, URLSearchParams } from '@angular/http';

@Injectable()
export class DashboardService {

    constructor(private router: Router, private http: Http) { }

    getMappingByKu(kuId: string): Observable<any[]> {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const cpParams = new URLSearchParams();
        cpParams.set('id', kuId);
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders, params: cpParams });
        return this.http.get(Constants.GET_MAP_BY_KU_URL, options)
            .map(this.extractData)
            .catch(this.handleError);
    }



    removeIntents(intent) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('id', intent.id);

        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.MAP_REMOVE_URL, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    removeEntities(entity, intent) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('entityid', entity.id);
        params.set('intentid', intent.id);

        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.MAP_ENT_RE_URL, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    removeMapping(key, flag, intentId) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('key', key);
        params.set('flag', flag);
        params.set('intentId', intentId);
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.put(Constants.REMOVE_MAPPING, null, options)
                .map(success => success.status)
                .catch(this.handleError);
    }

    removeIntentMapping(intentId, key, entryExpression) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('intentId', intentId);
        params.set('entryExpression', entryExpression);
        params.set('workflowSequenceKey', key);

        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.REMOVE_INTENT_MAPPING, options)
            .map(success => success.status)
            .catch(this.handleError);
    }


    deleteWorkflow(workfloId): Observable<any[]> {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const cpParams = new URLSearchParams();
        cpParams.set('id', workfloId);
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders, params: cpParams });
        return this.http.delete(Constants.MAP_FLOWCHART, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    getWorkFlow(intentId): Observable<any[]> {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const cpParams = new URLSearchParams();
        cpParams.set('id', intentId);
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders, params: cpParams });
        return this.http.get(Constants.MAP_FLOWCHART, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    createWorkFlow(intent, workFlow) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        const flowchartData = JSON.stringify(JSON.parse(workFlow));
        const body = JSON.stringify({
            'workFlow': {
                "metaData": flowchartData,
                "intentId": intent.id,
                "active": true,
                "name": "flowchart",
                "kuId": intent.kuId,
            }
        }
        );
        const finalBody = JSON.stringify(JSON.parse(body)); // to remove / symbol
        return this.http.post(Constants.MAP_FLOWCHART, finalBody, options)
            .map(success => success.json())
            .catch(this.handleError);
    }


    saveImportKu(ku) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        const body = JSON.stringify({ "kus": ku });
        return this.http.post(Constants.SAVE_JSON, body, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    flowchartUpdate(selectedFlowChartId, intent, flowChart) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        const flowchartData = JSON.parse(flowChart);
        const body = JSON.stringify({
            'workFlow': {
                "id": selectedFlowChartId,
                "metaData": flowChart,
                "intentId": intent.id,
                "active": true,
                "name": "flowchart",
                "kuId": intent.kuId
            }
        }
        );
        const finalBody = JSON.stringify(JSON.parse(body));
        return this.http.put(Constants.MAP_FLOWCHART, finalBody, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    removeRegex(regMapId, id) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('mapid', regMapId);
        params.set('id', id);
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.MAP_REG_RE_URL, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    removeErrorResponse(id) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('id', id);
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.DEL_ERROR_RES, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    createMapping(mapping): Observable<number> {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
            "workflowSequence": {
                "workflowid": 1234,
                "workflowSequenceKey": "POST",
                "intentId": 10901,
                "entryType": "ACTION",
                "entryExpression": "12",
                "primaryDestWorkflowId": 1234,
                "primaryDestSequenceKey": "15",
                "secondaryDestWorkflowId": "1234",
                "secondaryDestSequenceKey": "1551",
                "terminalType": "START",
                "required": "Y"
            }
        }
        );
        return this.http.post(Constants.MAP_EN_URL, body, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    createWorkflowSequence(workflowSequence): Observable<number> {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
          "workflowSequence": {
              "workflowId": workflowSequence.workflowId,
              "workflowSequenceKey": workflowSequence.workflowSequenceKey,
              "intentId": workflowSequence.intentId,
              "entryType": workflowSequence.entryType,
              "entryExpression": workflowSequence.entryExpression,
              "primaryDestWorkflowId": workflowSequence.primaryDestWorkflowId,
              "primaryDestSequenceKey": workflowSequence.primaryDestSequenceKey,
              "secondaryDestWorkflowId": workflowSequence.secondaryDestWorkflowId,
              "secondaryDestSequenceKey": workflowSequence.secondaryDestSequenceKey,
              "terminalType": workflowSequence.terminalType,
              "kuId": workflowSequence.kuId,
              "required": workflowSequence.required
          }
        });
        return this.http.post(Constants.WORKFLOW_SEQUENCE, body, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    updateWorkflowSequence(workflowSequence): Observable<number> {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
          "workflowSequence": {
              "id": workflowSequence.id,
              "workflowId": workflowSequence.workflowId,
              "workflowSequenceKey": workflowSequence.workflowSequenceKey,
              "intentId": workflowSequence.intentId,
              "entryType": workflowSequence.entryType,
              "entryExpression": workflowSequence.entryExpression,
              "primaryDestWorkflowId": workflowSequence.primaryDestWorkflowId,
              "primaryDestSequenceKey": workflowSequence.primaryDestSequenceKey,
              "secondaryDestWorkflowId": workflowSequence.secondaryDestWorkflowId,
              "secondaryDestSequenceKey": workflowSequence.secondaryDestSequenceKey,
              "terminalType": workflowSequence.terminalType,
              "kuId": workflowSequence.kuId,
              "required": workflowSequence.required
          }
        });
        return this.http.put(Constants.WORKFLOW_SEQUENCE, body, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    deleteWorkflowSequence(id) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('id', id);
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.WORKFLOW_SEQUENCE, options)
            .map(success => success.status)
            .catch(this.handleError);
    }


    createRegexMapping(map, mapRegExs): Observable<number> {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
            'mapRegExLst': mapRegExs,
            "mapping": {
                "id": map.id
            }
        }
        );
        return this.http.post(Constants.MAP_REG_URL, body, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    importKu(file) {
        const formData: FormData = new FormData();
        formData.append('file', file);
        const headers = new Headers();
        // /** No need to include Content-Type in Angular 4 */
        const options = new RequestOptions({ withCredentials: true, headers: headers });
        return this.http.post(Constants.IMPORT_KU, formData, options)
            .map(success => success.status)
            .catch(this.handleError);
    }

    getJson(file) {
        const formData: FormData = new FormData();
        formData.append('file', file);
        const headers = new Headers();
        // /** No need to include Content-Type in Angular 4 */
        const options = new RequestOptions({ withCredentials: true, headers: headers });
        return this.http.post(Constants.GET_JSON, formData, options)
            .map(success => success.json())
            .catch(this.handleError);
    }

    validImportKu(ku) {
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        const body = JSON.stringify({ "kus": ku });
        return this.http.post(Constants.VALIDATE_JSON, body, options)
            .map(success => success.json())
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        const body = res.json();
        return body.data || {};
    }
    private handleError(error: Response | any) {
        if (error.status === 401) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedin');
            location.reload();
            return Observable.throw(error.status);
        } else if (error.status === 404) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedin');
            location.reload();
            return Observable.throw(error.status);
        } else {
            const body = error.json();
            return Observable.throw(body);
        }
    }
}
