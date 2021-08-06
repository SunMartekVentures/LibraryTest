'use strict';

import express = require("express");
import jwt = require('jwt-simple');
import SfmcApiHelper from './SfmcApiHelper';
import Utils from './Utils';


// <!-- Integrate an externally hosted app via iframe. -->
export default class SfmcAppDemoRoutes
{
    // Instance variables
    private _apiHelper = new SfmcApiHelper();

    /**
     * login: called by Marketing Cloud when hosted app is launched. Decodes JWT in BODY passed by Marketing Cloud.
     * Handles POST on: /login
     * 
     * Marketing Cloud does a POST on the '/login' route with the following JSON BODY:
     * {
     *  "jwt" : "<encoded JWT from SFMC>"
     * }
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.mc-app-development.meta/mc-app-development/decode-jwt.htm
     * More info: https://developer.salesforce.com/docs/atlas.en-us.mc-app-development.meta/mc-app-development/explanation-decoded-jwt.htm
     * 
     */
    
    /**
     * GET handler for: /appdemooauthtoken
     * getOAuthAccessToken: called by demo app to get an OAuth access token
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     * 
     */
    
     public getOAuthAccessToken(req: express.Request, res: express.Response) {
        let self = this;
        let sessionId = req.session.id;
        let clientId = process.env.CLIENTID;
        let clientSecret = process.env.CLIENTSECRET;
        let session = req.session;
    
        req.session.oauthAccessToken = "";
        req.session.oauthAccessTokenExpiry = "";
    
        if (clientId && clientSecret) {
          // set the desired timeout in options
          console.log(clientId);
          self._apiHelper
            .getOAuthAccessToken(clientId, clientSecret, req, res)
            .then((result) => {
              // req.session.oauthAccessToken = result.oauthAccessToken;
              //req.session.oauthAccessTokenExpiry = result.oauthAccessTokenExpiry;
              res.status(result.status).send(result.statusText);
              req.setTimeout(0, () => {});
            })
            .catch((err) => {
              res.status(500).send(err);
            });
        } else {
          // error
          let errorMsg =
            "ClientID or ClientSecret *not* found in environment variables.";
          res.status(500).send(errorMsg);
        }
      }
    
      //to get authorization code for web app
      public getAuthorizationCode(req: express.Request, res: express.Response) {
        let self = this;
        let sessionId = req.session.id;
        let clientId = process.env.CLIENTID;
        let clientSecret = process.env.CLIENTSECRET;
        let redirectURL = process.env.REDIRECT_URL;
        console.log("Client ID:",clientId);
        if (clientId && redirectURL) {
          self._apiHelper
            .getAuthorizationCode(clientId, clientSecret, redirectURL)
            .then((result) => {
              res.send(result.statusText);
              req.setTimeout(0, () => {});
            })
            .catch((err) => {
              res.status(500).send(err);
            });
        } else {
          let errorMsg =
            "ClientID or ClientSecret *not* found in environment variables.";
          Utils.logError(errorMsg);
          res.status(500).send(errorMsg);
        }
      }
   
    public appUserInfo(req: express.Request, res: express.Response) {
        let self = this;
        self._apiHelper.appUserInfo(req, res);
      }
    // public domainConfigurationDECheck(
    //     req: express.Request,
    //     res: express.Response
    //   ) {
    //     let self = this;
    //     self._apiHelper.domainConfigurationDECheck(req, res);
    //   }
}