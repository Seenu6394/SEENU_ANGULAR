import { Intent } from './intent';
export class Keywords {
  public id: number
  public keywordField: string;
  public polarity: string;
  public intent: Intent = new Intent();
  public kuId: number;
  public localeCode: string;
}
