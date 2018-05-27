import { Intent } from './Intent';
import { MapEntities } from './MapEntities';

export class Mapping {
  public id: number;
  public kuId: number;
  public intent: Intent = new Intent();
  public entities: MapEntities = new MapEntities();
}
