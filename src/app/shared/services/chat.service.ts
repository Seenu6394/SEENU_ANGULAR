// Observable Version

import { Constants } from '../../constants/constant';
import { ChatDetails } from '../../models/chatDetails';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions, Jsonp, RequestMethod, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


@Injectable()
export class ChatService {
    constructor(private http: Http) { }



    sendMessage(message: String): Observable<ChatDetails> {

        const cpHeaders = new Headers({ 'Content-Type': 'application/json'});
        const options = new RequestOptions({ headers: cpHeaders });
        const body = JSON.stringify({
            'message': message,
            'userId': '222222222222222'
        });

        // const body = JSON.stringify({
        //     'id': '222222222222222',
        //     'time': '1509533899832',
        //     'messaging': [{
        //         'sender': {
        //             'id': '3333333333333333'
        //         },
        //         'recipient': {
        //             'id': '222222222222222'
        //         },
        //         'timestamp': '1509533899421',
        //         'message': {
        //             'mid': 'mid.$cAAIUGIGhRohlqICinVfdzq8AQRsa',
        //             'seq': '13046',
        //             'text': message
        //         }
        //     }]
        // });

        return this.http.post(Constants.CHAT_SEND_MES, body, options)
            .map(success => <ChatDetails[]>success.json())
            .catch(this.handleError);
    }


    private extractData(res: Response) {
        const body = res.json();
        return body.data || {};
    }
    private handleError(error: Response | any) {
        return Observable.throw(error.status);
    }

}
