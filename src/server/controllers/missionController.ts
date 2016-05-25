import * as debug from 'debug';
let log: debug.IDebugger = debug('msdx:missionController');

import {Application, Request, Response} from 'express';
import {User} from '../models/user';
import {AzureAD} from '../auth/azureAD';
import * as config from 'nconf';
import {MissionService} from '../services/missionService';
import {IMission} from '../models/IMission';
import {MissionViewModel} from '../models/MissionViewModel';

export class MissionController {

  /**
   * @description
   *  Verifies the current user is logged in. If not, they are redirected to the login page.
   * 
   * @param  {Request} req   - Express HTTP Request object.
   * @param  {Response} res  - Express HTTP Response object.
   */
  private static verifyUserLoggedIn(req: Request, res: Response): void {
    let user: User = new User(req);
    if (!user.isAuthenticated()) {
      // redirect to login
      // save path to this page so after logging in, they come back here
      res.redirect('/login?redir=' + encodeURIComponent(req.route.path));
    }
  }

  /**
   * @description
   *  Retrieves an access token for SharePoint's REST API. 
   *  If this fails, it requests one from Azure AD.
   * 
   * @param  {Request} req   - Express HTTP Request object.
   * @param  {Response} res  - Express HTTP Response object.
   */
  private static getSpAccessToken(req: Request, res: Response): string {
    // ensure user is logged in
    this.verifyUserLoggedIn(req, res);

    // get the SP REST API resource ID
    let spoRestApiResourceId: string = config.get('spo-rest-api-resourceid');

    // get the access token to call the endpoint
    let accessToken: string = AzureAD.getAccessToken(req, spoRestApiResourceId);

    // if don't have token / it is expired...
    if (!accessToken || accessToken === 'EXPIRED') {
      // redirect to get token
      // save path to this page so after logging in, they come back here
      res.redirect('/login?' +
        'redir=' + encodeURIComponent(req.route.path) +
        '&resourceId=' + encodeURIComponent(spoRestApiResourceId));
    }

    return accessToken;
  }

  constructor(private app: Application) {
    this.loadRoutes();
  }

  /**
   * Setup routing for controller.
   */
  private loadRoutes(): void {
    log('configuring routes');

    this.app.get('/missions', this.handleGetMissions);
    this.app.get('/missions/:missionid', this.handleGetMission);
  }

  /**
   * @description
   *  Handler for the request for a list of missions.
   * 
   * @returns void
   */
  private handleGetMissions(req: Request, res: Response): void {
    log('handle GET /missions');

    // get access token for the SPO REST API
    let accessToken: string = MissionController.getSpAccessToken(req, res);

    // get missions from services
    let missionService: MissionService = new MissionService(accessToken);
    missionService.getMissions()
      .then((missions: IMission[]) => {
        log('missions received: ' + missions.length);

        let vm: MissionViewModel = new MissionViewModel(req);
        vm.missions = missions;

        // render the view
        res.render('missions/list', vm);
      });
  }

  /**
   * @description
   *  Handler for the request for a specific mission.
   * 
   * @returns void
   */
  private handleGetMission(req: Request, res: Response): void {
    let missionId: number = req.params.missionid;
    log('handle GET /missions/' + missionId);
    // if no mission id, redirect
    if (!missionId || (+missionId === NaN)) {
      res.redirect('/missions');
    }

    // get access token for the SPO REST API
    let accessToken: string = MissionController.getSpAccessToken(req, res);

    // get mission from services
    let missionService: MissionService = new MissionService(accessToken);
    missionService.getMission(missionId)
      .then((mission: IMission) => {
        log('mission received');

        let vm: MissionViewModel = new MissionViewModel(req);
        vm.mission = mission;

        // render the view
        res.render('missions/item', vm);
      });
  }
}
