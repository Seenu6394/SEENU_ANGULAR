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
export class KuService {
    constructor(private router: Router, private http: Http) {}

    getKus(kuLstType: string): Observable<Ku[]> { // get all Kus
        const cpHeaders = new Headers();
        const cpParams = new URLSearchParams();
        cpParams.set('kuLstType', kuLstType);
        const options = new RequestOptions({ headers: cpHeaders, withCredentials: true, params: cpParams });
        return this.http.get(Constants.GET_ALL_KUS, options)
            .map(this.extractData)
            .catch(this.handleErrorData);
    }

    getKuById(kuId: string): Observable<Ku> {  // get Ku by id
        const cpHeaders = new Headers();
        const cpParams = new URLSearchParams();
        cpParams.set('id', kuId);
        const options = new RequestOptions({ headers: cpHeaders, params: cpParams, withCredentials: true });
        return this.http.get(Constants.KNOWLEDGE_UNIT, options)
            .map(this.extractData)
            .catch(this.handleErrorData);
    }

    createKU(ku: Ku): Observable<number> { // create ku
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({

            'ku': {
                'name': ku.name,
                'activeInd': 'Y',
                'isRankable': ku.isRankable
            }

        });
        return this.http.post(Constants.KNOWLEDGE_UNIT, body, options)
            .map(success => success.json())
            .catch(this.handleErrorData);
    }

    updateKu(ku): Observable<number> { // update ku
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ withCredentials: true, headers: cpHeaders });
        const body = JSON.stringify({
            'ku': {
                'name': ku.name,
                'id': ku.id,
                'activeInd': ku.activeInd,
                'isRankable': ku.isRankable
            }
        }
        );
        return this.http.put(Constants.KNOWLEDGE_UNIT, body, options)
            .map(success => success.status)
            .catch(this.handleErrorData);
    }

    deleteKuById(kuid: string): Observable<number> {   // Delete ku
        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const params: URLSearchParams = new URLSearchParams();
        params.set('id', kuid);
        const options = new RequestOptions();
        options.headers = cpHeaders;
        options.search = params;
        options.withCredentials = true;
        return this.http.delete(Constants.KNOWLEDGE_UNIT, options)
            .map(success => success.status)
            .catch(this.handleErrorData);
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
