import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import { Constants } from '../../constants/constant';
import * as $ from 'jquery';

@Injectable()
export class AuthenticationService {
  constructor(  private router: Router,
    private http: Http) {
     }
     getUser(username: String, password: String) {
             return this.http.get(`${Constants.LOGIN}?username=${username}&password=${password}`);
         }
  login(users) {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions({
      headers: headers,
      withCredentials: true

    });
    return this.http.post(Constants.LOGIN, $.param({username: users.email, password: users.password}), options)
      .map(this.extractDataJson)
      .catch(this.handleError);
  }

  forgotPassword(users) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({withCredentials: true , headers: headers});
    const body = JSON.stringify({
      'user': {
        'email': users.email
      }
    }
    );
    return this.http.post(Constants.FORGOTPASSWORD, body , options)
    .map(success => success.status)
    .catch(this.handleError);
  }
  tokenVerification(token) {
    const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    const params = new URLSearchParams();
        params.set('token', token);
    const options = new RequestOptions({withCredentials: true , headers: cpHeaders, params: params});
    return this.http.get(Constants.RESETPASSWORD, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  resetPassword(users) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({withCredentials: true , headers: headers});
    const body = JSON.stringify({
      'user': {
        'email': users.email
      }
    }
    );
    return this.http.post(Constants.RESETPASSWORD, body , options)
    .map(success => success.status)
    .catch(this.handleError);
  }

  changePassword(users) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({withCredentials: true , headers: headers});
  const body = JSON.stringify({
   "user": {
       "id": "",
       "userName": "admin",
       "password": users.confirmPassword,
       "currentPassword": users.oldpassword,
       "newPassword": users.password,
       "email": ""
   }
});
    return this.http.post(Constants.CHANGEPASSWORD, body , options)
    .map(success => success.status)
    .catch(this.handleError);
  }
  register(users) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({withCredentials: true , headers: headers});
    const body = JSON.stringify(users);
    return this.http.post(Constants.REGISTER, body , options)
    .map(success => success.status)
    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }

    private extractDataJson(res: Response) {
    const body = res.json();
    return body || {};
  }


  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.router.navigate(['Dashboard']);
  }
}
