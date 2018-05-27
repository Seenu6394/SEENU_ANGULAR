import { Questions } from './questions';

export class EntityDetails {
  public id: number;
  public kuId: number;
  public name: string;
  public entityType: string;
  public questions: Questions[] = [];
  public example: string;
  public required: string;
  public dataType: string;
}
