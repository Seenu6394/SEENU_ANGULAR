import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatDetails } from './../../../models/chatDetails';
import { ChatService } from '../../../shared/services/chat.service';
import { Constants } from '../../../constants/constant';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

import * as $ from 'jquery';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    providers: [ChatService]
})
export class ChatComponent implements OnInit, AfterViewChecked {
    messages = [];
    connection: any;
    message: any;
    showDiv: any;
    msgs = [];
    statusCode: number;
    chat: any;
    private serverUrl = Constants.HOST + 'api/socket';
    private title = 'WebSockets chat';
    private stompClient;
     @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    ChatForm = new FormGroup({
        message: new FormControl('', Validators.required)
    });


    constructor(private chatService: ChatService) {
    this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection() {
  const ws = new SockJS(this.serverUrl);
  this.stompClient = Stomp.over(ws);
  const that = this;
  this.stompClient.connect({}, function(frame) {
    const sessionId = /\/([^\/]+)\/websocket/.exec(ws._transport.url)[1];
    console.log('connected, session id: ' + sessionId);
    that.stompClient.subscribe('/chat/' + sessionId , (message) => {
      if (message.body) {
      const txtmsg =  JSON.parse(message.body);
        $('.chats').append('<div class="direct-chat-msg" style="margin-top: 25px; margin-left: 7px;">' +
        '<div class="direct-chat-info clearfix" style="margin-bottom: -29px; "><span class="direct-chat-timestamp pull-left">Bot</span></div><div class="direct-chat-text" style="border-radius: 5px;  position: relative;  padding: 5px 10px;  background: #d2d6de;' +
        ' border: 1px solid #d2d6de;    margin: 5px 36px 30px 30px;    color: #444;">' + txtmsg.text
        + '</div>	</div>' );
      }
    });
  });
}

    sendMessage(mes) {
        if (mes != "" && mes != null) {
            this.message = null;
            this.messages.push(({ 'msgre': mes, 'message': 'user', 'action': false  }));
            $('.chats').append('<div class="direct-chat-msg right">	<div class="direct-chat-info clearfix" style="margin-bottom: -28px; margin-top: 12px; margin-right: 2px; ">' +
            '<span class="direct-chat-timestamp pull-right" style="margin-top: 4px; margin-right: 4px;  padding-top: 0px;">Admin</span>	</div><div class="direct-chat-text-right" style="border-radius: 5px;  position: relative; padding: 5px 10px; ' +
            'background: #a0f6f7; border: 1px solid #a0f6f7;  margin: -24px 50px 0px 26px;   color: #444;">' + mes   + '</div>	</div>' );
            this.stompClient.send('/app/send/message' , {}, mes);
        }
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom() {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    ngOnInit() {
        this.showDiv = true;
        this.scrollToBottom();
    }
}
