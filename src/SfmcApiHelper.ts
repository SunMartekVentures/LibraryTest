'use strict';

import axios from 'axios';
import express = require("express");
import Utils from './Utils';

export default class SfmcApiHelper
{
    // Instance variables
    private _deExternalKey = "DF18Demo";
    private _sfmcDataExtensionApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";

    public getOAuthAccessToken(
        clientId: string,
        clientSecret: string,
        req: any,
        res: any
      ): Promise<any> {
        let self = this;
        var tssd = "";
        tssd = req.body.tssd ? req.body.tssd : process.env.BASE_URL;
        console.log("authorizetssd:" + tssd);
        let headers = {
          "Content-Type": "application/json",
        };
    
        let postBody = {
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code: req.body.authorization_code,
          redirect_uri: process.env.REDIRECT_URL,
        };
    
        return self.getOAuthTokenHelper(headers, postBody, res, tssd);
      }
    
      /**
       * getOAuthTokenHelper: Helper method to POST the given header & body to the SFMC Auth endpoint
       *
       */
      public getOAuthTokenHelper(
        headers: any,
        postBody: any,
        res: any,
        tssd: string
      ): Promise<any> {
        return new Promise<any>((resolve, reject) => {
          console.log("author" + JSON.stringify(tssd));
          let sfmcAuthServiceApiUrl =
            "https://" + tssd + ".auth.marketingcloudapis.com/v2/token";
          this.isAccessToken = true;
          console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
          axios
            .post(sfmcAuthServiceApiUrl, postBody, { headers: headers })
            .then((response: any) => {
              let refreshToken = response.data.refresh_token;
              this.getRefreshTokenHelper(refreshToken, tssd, true, res);
            })
            .catch((error: any) => {
              // error
              let errorMsg = "Error getting OAuth Access Token.";
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
      public getRefreshTokenHelper(
        refreshToken: string,
        tssd: string,
        returnResponse: boolean,
        res: any
      ): Promise<any> {
        return new Promise<any>((resolve, reject) => {
          console.log("tssdrefresh:" + tssd);
          console.log("returnResponse:" + returnResponse);
    
          let sfmcAuthServiceApiUrl =
            "https://" + tssd + ".auth.marketingcloudapis.com/v2/token";
          let headers = {
            "Content-Type": "application/json",
          };
          console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
          let postBody1 = {
            grant_type: "refresh_token",
            client_id: process.env.CLIENTID,
            client_secret: process.env.CLIENTSECRET,
            refresh_token: refreshToken,
          };
          axios
            .post(sfmcAuthServiceApiUrl, postBody1, { headers: headers })
            .then((response: any) => {
              let bearer = response.data.token_type;
              let tokenExpiry = response.data.expires_in;
              // this._accessToken = response.data.refresh_token;
              //this._oauthToken = response.data.access_token;
              Utils.logInfo("Auth Token:" + response.data.access_token);
              const customResponse = {
                refreshToken: response.data.refresh_token,
                oauthToken: response.data.access_token,
              };
              if (returnResponse) {
                res.status(200).send(customResponse);
              }
              resolve(customResponse);
            })
            .catch((error: any) => {
              let errorMsg = "Error getting refresh Access Token.";
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
    }
    /**
     * getOAuthAccessToken: POSTs to SFMC Auth URL to get an OAuth access token with the given ClientId and ClientSecret
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     * 
     */
    // public getOAuthAccessToken(client_id: string, client_secret: string) : Promise<any>
    // {
    //     let self = this;
    //     Utils.logInfo("getOAuthAccessToken called.");
    //     Utils.logInfo("Using specified ClientID and ClientSecret to get OAuth token...");

    //     let headers = {
    //         'Content-Type': 'application/json',
    //     };

    //     let postBody = {

    //         "grant_type": "client_credentials",
    //         "client_id": process.env.CLIENTID,
    //         "client_secret": process.env.CLIENTSECRET
    //     };

    //     return self.getOAuthTokenHelper(headers, postBody);
    // }

    /**
     * getOAuthAccessTokenFromRefreshToken: POSTs to SFMC Auth URL to get an OAuth access token with the given refreshToken
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     * 
     */
    // public getOAuthAccessTokenFromRefreshToken(client_id: string, clientSecret: string, refreshToken: string) : Promise<any>
    // {
    //     let self = this;
    //     Utils.logInfo("getOAuthAccessTokenFromRefreshToken called.");
    //     Utils.logInfo("Getting OAuth Access Token with refreshToken: " + refreshToken);
        
    //     let headers = {
    //         'Content-Type': 'application/json',
    //     };

    //     let postBody = {
    //       "grant_type": "client_credentials",
    //       "client_id": process.env.CLIENTID,
    //       "client_secret": process.env.CLIENTSECRET
    //     };

    //     return self.getOAuthTokenHelper(headers, postBody);
    // }

    /**
     * getOAuthTokenHelper: Helper method to POST the given header & body to the SFMC Auth endpoint
     * 
     */
    // public getOAuthTokenHelper(headers : any, postBody: any) : Promise<any>
    // {
    //     return new Promise<any>((resolve, reject) =>
    //     {
    //         // POST to Marketing Cloud REST Auth service and get back an OAuth access token.
    //         let sfmcAuthServiceApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/v2/token";
    //         axios.post(sfmcAuthServiceApiUrl, postBody, {"headers" : headers})
    //         .then((response: any) => {
    //             // success
    //             let accessToken = response.data.access_token;
    //             let tokenExpiry = new Date();
    //             let jsonData = response.data.jsonData;
    //             tokenExpiry.setSeconds(tokenExpiry.getSeconds() + response.data.expiresIn);
    //             Utils.logInfo("Got OAuth token: " + accessToken + ", expires = " +  tokenExpiry);
    //             //console.log("token:",accessToken);
                
    //             console.log("response:",response.data);
                

    //             resolve(
    //             {
    //                 oauthAccessToken: accessToken,
    //                 oauthAccessTokenExpiry: tokenExpiry,
    //                 JSON:jsonData,
    //                 status: response.status,
    //                 statusText: response.statusText + "\n" + Utils.prettyPrintJson(JSON.stringify(response.data))
    //             });
    //         })
    //         .catch((error: any) => {
    //             // error
    //             let errorMsg = "Error getting OAuth Access Token.";
    //             errorMsg += "\nMessage: " + error.message;
    //             errorMsg += "\nStatus: " + error.response ? error.response.status : "<None>";
    //             errorMsg += "\nResponse data: " + error.response ? Utils.prettyPrintJson(JSON.stringify(error.response.data)) : "<None>";
    //             Utils.logError(errorMsg);

    //             reject(errorMsg);
    //         });
    //     });
    // }

    /**
     * loadData: called by the GET handlers for /apidemoloaddata and /appdemoloaddata
     * 
     */
    // public loadData(req: express.Request, res: express.Response)
    // {
    //     let self = this;
    //     let sessionId = req.session.id;
    //     Utils.logInfo("loadData entered. SessionId = " + sessionId);

    //     console.log("Request Session:",req.session)
    //     if (req.session.oauthAccessToken)
    //     {
    //         Utils.logInfo("Using OAuth token: " + req.session.oauthAccessToken);
    //         self.loadDataHelper(req.session.oauthAccessToken, req.session.sampleJsonData)
    //         .then((result) => {
    //             res.status(result.status).send(result.statusText);
    //         })
    //         .catch((err) => {
    //             res.status(500).send(err);
    //         });
    //     }
    //     else
    //     {
    //         // error
    //         let errorMsg = "OAuth Access Token *not* found in session.\nPlease complete previous demo step\nto get an OAuth Access Token."; 
    //         Utils.logError(errorMsg);
    //         res.status(500).send(errorMsg);
    //     }
    // }

    // /**
    //  * loadDataHelper: uses the given OAuthAccessToklen to load JSON data into the Data Extension with external key "DF18Demo"
    //  * 
    //  * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/postDataExtensionRowsetByKey.htm
    //  * 
    //  */
    // private loadDataHelper(oauthAccessToken: string, jsonData: string) : Promise<any>    
    // {
    //     let self = this;
    //     Utils.logInfo("loadDataHelper called.");
    //     Utils.logInfo("Loading sample data into Data Extension: " + self._deExternalKey);
    //     Utils.logInfo("Using OAuth token: " + oauthAccessToken);
    //     Utils.logInfo("JSON :"+ jsonData);

    //     return new Promise<any>((resolve, reject) =>
    //     {
    //         let headers = {
    //             'Content-Type': 'application/json',
    //             'Authorization': 'Bearer ' + oauthAccessToken
    //         };

    //         // POST to Marketing Cloud Data Extension endpoint to load sample data in the POST body
    //         console.log("ApiUrl:",self._sfmcDataExtensionApiUrl);
    //         console.log("AuthTokken:",oauthAccessToken);
    //         console.log("Json data:",jsonData);
    //         axios.post(self._sfmcDataExtensionApiUrl, jsonData, {"headers" : headers})
    //         .then((response: any) => {
    //             // success
    //             Utils.logInfo("Successfully loaded sample data into Data Extension!");

    //             resolve(
    //             {
    //                 status: response.status,
    //                 statusText: response.statusText + "\n" + Utils.prettyPrintJson(JSON.stringify(response.data))
    //             });
    //         })
    //         .catch((error: any) => {
    //             // error
    //             let errorMsg = "Error loading sample data. POST response from Marketing Cloud:";
    //             errorMsg += "\nMessage: " + error.message;
    //             errorMsg += "\nStatus: " + error.response ? error.response.status : "<None>";
    //             errorMsg += "\nResponse data: " + error.response.data ? Utils.prettyPrintJson(JSON.stringify(error.response.data)) : "<None>";
    //             Utils.logError(errorMsg);

    //             reject(errorMsg);
    //         });
    //     });
    

