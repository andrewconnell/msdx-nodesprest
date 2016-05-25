import {Request} from 'express';
import {BaseViewModel} from './BaseViewModel';
import {IMission} from './IMission';

export class MissionViewModel extends BaseViewModel {
  public missions: IMission[];
  public mission: IMission;

  constructor(protected request: Request) {
    super(request);
    this.missions = new Array<IMission>();
  }
}