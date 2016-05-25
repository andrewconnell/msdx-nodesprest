import * as debug from 'debug';
let log: debug.IDebugger = debug('msdx:missionService');

import * as http from 'http';
import * as config from 'nconf';
import * as request from 'request';
import * as Q from 'q';
import {IMission, ISpRestMission} from '../models/IMission';

export class MissionService {

  constructor(private accessToken: string) { }

  /**
   * Retrieves a list of missions from the remote data store & returns them within a promise.
   * 
   * @returns Q.Promise<IMission[]>
   */
  public getMissions(): Q.Promise<IMission[]> {
    let deferred: Q.Deferred<IMission[]> = Q.defer<IMission[]>();

    // create the query
    let queryEndpoint: string = config.get('spo-rest-api-endpoint') +
      '?$select=Id,Title,Rocket,Commander,SrPilotCmPilot,PilotLmPilot,LaunchDate' +
      '&$orderby=LaunchDate';
    log('SPREST API query: ' + JSON.stringify(queryEndpoint));

    // create request headers
    let requestHeaders: request.Headers = <request.Headers>{
      'Authorization': 'Bearer ' + this.accessToken,
      'Accept': 'application/json'
    };
    log('SPREST API request headers: ' + JSON.stringify(requestHeaders));

    // issue request
    request(
      queryEndpoint,
      <request.CoreOptions>{
        headers: requestHeaders,
        method: 'GET'
      },
      (error: any, response: http.IncomingMessage, body: string) => {
        if (error) {
          log('error submitting request to SPO REST API: ' + error);
          deferred.reject(error);
        } else if (response.statusCode !== 200) {
          // if not 200, return error
          let errorMessage: string = '[' + response.statusCode + ']' + response.statusMessage;
          log('error received from SPO REST API: ' + errorMessage);
          deferred.reject(new Error(errorMessage));
        } else {
          log('response body received from SPO REST API: ' + body);

          // collection of missions
          let missions: IMission[] = new Array<IMission>();

          // convert SPREST data => internal model
          let spMissions: ISpRestMission[] = <ISpRestMission[]>(JSON.parse(body)).value;
          for (let spMissionItem of spMissions) {
            missions.push(<IMission>{
              commander: spMissionItem.Commander,
              id: parseInt(spMissionItem.ID, 10),
              launchDate: spMissionItem.LaunchDate,
              pilotLmPilot: spMissionItem.PilotLmPilot,
              rocket: spMissionItem.Rocket,
              srPilotCmPilot: spMissionItem.SrPilotCmPilot,
              title: spMissionItem.Title
            });
          }

          // return collection of missions
          deferred.resolve(missions);
        }
      }
    );

    return deferred.promise;
  }

  /**
   * Retrieves a mission from the remote data store & returns it within a promise.
   * 
   * @returns Q.Promise<IMission>
   */
  public getMission(missionId: number): Q.Promise<IMission> {
    let deferred: Q.Deferred<IMission> = Q.defer<IMission>();

    // create the query
    let queryEndpoint: string = config.get('spo-rest-api-endpoint') +
      '(' + missionId + ')' +
      '?$select=Id,Title,Rocket,Commander,SrPilotCmPilot,PilotLmPilot,LaunchDate';
    log('SPREST API query: ' + JSON.stringify(queryEndpoint));

    // create request headers
    let requestHeaders: request.Headers = <request.Headers>{
      'Authorization': 'Bearer ' + this.accessToken,
      'Accept': 'application/json'
    };
    log('SPREST API request headers: ' + JSON.stringify(requestHeaders));

    // issue request
    request(
      queryEndpoint,
      <request.CoreOptions>{
        headers: requestHeaders,
        method: 'GET'
      },
      (error: any, response: http.IncomingMessage, body: string) => {
        if (error) {
          log('error submitting request to SPO REST API: ' + error);
          deferred.reject(error);
        } else if (response.statusCode !== 200) {
          // if not 200, return error
          let errorMessage: string = '[' + response.statusCode + ']' + response.statusMessage;
          log('error received from SPO REST API: ' + errorMessage);
          deferred.reject(new Error(errorMessage));
        } else {
          log('response body received from SPO REST API: ' + body);
          // convert SPREST data => internal model
          let spMission: ISpRestMission = <ISpRestMission>(JSON.parse(body));
          let mission: IMission = <IMission>{
            commander: spMission.Commander,
            id: parseInt(spMission.ID, 10),
            launchDate: spMission.LaunchDate,
            pilotLmPilot: spMission.PilotLmPilot,
            rocket: spMission.Rocket,
            srPilotCmPilot: spMission.SrPilotCmPilot,
            title: spMission.Title
          };

          // return collection of missions
          deferred.resolve(mission);
        }
      });

    return deferred.promise;

  }
}
