import { Keywords } from './Keywords';

export class Intent {
  public id: number;
  public name: string;
  public kuId: number;
  public date: string;
  public keywords: Keywords [];
  public positiveKeywords: number;
  public negativeKeywords: number;
}
