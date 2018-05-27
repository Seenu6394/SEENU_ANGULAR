import { EntityDetails } from './entityDetails';
import { Intent } from './intent';
export class Ku {
  public id: number;
  public name: string;
  public isRankable: boolean;
  public entities: EntityDetails [];
  public intents: Intent [];
}
