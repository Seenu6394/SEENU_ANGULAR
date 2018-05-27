import { ConfirmAction } from './confirmaction';
import {ErrorResponses} from './responses';
export class Action {
  public id: number;
  public name: string;
  public url: string;
  public requestBody: string;
  public kuId: string;
  public date: string;
  public intentId: number;
  public responseMessage: string;
  public callMethod = 'POST';
  public errorResponses: ErrorResponses [] = [];
  public confirmAction: ConfirmAction = new ConfirmAction();
  public errorNode: string;
}
