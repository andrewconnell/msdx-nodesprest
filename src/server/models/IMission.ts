export interface IMission {
  id: number;
  title: string;
  rocket: string;
  launchDate: string;
  commander: string;
  srPilotCmPilot: string;
  pilotLmPilot: string;
}

export interface ISpRestMission {
  'odata.type': string;
  'odata.id': string;
  'odata.editLink': string;
  'odata.etag': string;
  ID: string;
  Id: string;
  Title?: string;
  Rocket?: string;
  LaunchDate?: string;
  Commander: string;
  SrPilotCmPilot?: string;
  PilotLmPilot?: string;
}
