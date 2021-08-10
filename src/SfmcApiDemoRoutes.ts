'use strict';

import path = require('path');
import express = require("express");
import SfmcApiHelper from './SfmcApiHelper';
import Utils from './Utils';

export default class SfmcApiDemoRoutes
{
    // Instance variables
    private _apiHelper = new SfmcApiHelper();

    /**
     * GET handler for /apidemooauthtoken
     * getOAuthAccessToken: called by demo app to get an OAuth access token with ClientId/ClientSecret in environment variables
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     * 
     */
     public getAuthorizationCode(
        clientId: string,
        clientSecret: string,
        redirectURL: string
      ): Promise<any> {
        let self = this;
        return self.getAuthorizationCodeHelper(clientId, redirectURL);
      }
    
      /**
       * getAuthorizationCodeHelper: Helper method to get auth code
       *
       */
      public getAuthorizationCodeHelper(
        clientId: any,
        redirectURL: any
      ): Promise<any> {
        return new Promise<any>((resolve, reject) => {
          let sfmcAuthServiceApiUrl =
            "https://" +
            process.env.BASE_URL +
            ".auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id=" +
            clientId +
            "&redirect_uri=" +
            redirectURL +
            "&state=mystate";
          //https://YOUR_SUBDOMAIN.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id=vqwyswrlzzfk024ivr682esb&redirect_uri=https%3A%2F%2F127.0.0.1%3A80%2F
          axios
            .get(sfmcAuthServiceApiUrl)
            .then((response: any) => {
              resolve({
                statusText: response.data,
              });
            })
            .catch((error: any) => {
              // error
              let errorMsg = "Error getting Authorization Code.";
              errorMsg += "\nMessage: " + error.message;
              errorMsg +=
                "\nStatus: " + error.response ? error.response.status : "<None>";
              errorMsg +=
                "\nResponse data: " + error.response
                  ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                  : "<None>";
              Utils.logError(errorMsg);
    
              reject(errorMsg);
            });
        });
      }
    
    
    /**
     * GET handler for /apidemoloaddata
     * loadData: called by the demo app to load sample data into the Data Extension "DF18Demo";'
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/postDataExtensionRowsetByKey.htm
     * 
     */
    // public loadData(req: express.Request, res: express.Response)
    // {
    //     let self = this;
    //     Utils.logInfo("loadData route entered.");
    //     self._apiHelper.loadData(req, res);
    // }
