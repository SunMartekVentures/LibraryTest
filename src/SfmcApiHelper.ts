'use strict';

import axios from 'axios';
import express = require("express");
import Utils from './Utils';

export default class SfmcApiHelper
{
    
  private _accessToken = "";
  private member_id = "514018007";
  private soap_instance_url = "";
  private FolderID = "";
  private ParentFolderID = "";
  private userName = "";

    // Instance variables
    private _deExternalKey = "DF18Demo";
    private _sfmcDataExtensionApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";

    /**
     * getOAuthAccessToken: POSTs to SFMC Auth URL to get an OAuth access token with the given ClientId and ClientSecret
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     * 
     */
    public getOAuthAccessToken(client_id: string, client_secret: string) : Promise<any>
    {
        let self = this;
        Utils.logInfo("getOAuthAccessToken called.");
        Utils.logInfo("Using specified ClientID and ClientSecret to get OAuth token...");

        let headers = {
            'Content-Type': 'application/json',
        };

        let postBody = {

            "grant_type": "client_credentials",
            "client_id": process.env.CLIENTID,
            "client_secret": process.env.CLIENTSECRET
        };

        return self.getOAuthTokenHelper(headers, postBody);
    }

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
    public getOAuthTokenHelper(headers : any, postBody: any) : Promise<any>
    {
        return new Promise<any>((resolve, reject) =>
        {
            // POST to Marketing Cloud REST Auth service and get back an OAuth access token.
            let sfmcAuthServiceApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/v2/token";
            axios.post(sfmcAuthServiceApiUrl, postBody, {"headers" : headers})
            .then((response: any) => {
                // success
                let accessToken = response.data.access_token;
                let tokenExpiry = new Date();
                let jsonData = response.data.jsonData;
                tokenExpiry.setSeconds(tokenExpiry.getSeconds() + response.data.expiresIn);
                Utils.logInfo("Got OAuth token: " + accessToken + ", expires = " +  tokenExpiry);
                //console.log("token:",accessToken);
                
                console.log("response:",response.data);
                

                resolve(
                {
                    oauthAccessToken: accessToken,
                    oauthAccessTokenExpiry: tokenExpiry,
                    JSON:jsonData,
                    status: response.status,
                    statusText: response.statusText + "\n" + Utils.prettyPrintJson(JSON.stringify(response.data))
                });
            })
            .catch((error: any) => {
                // error
                let errorMsg = "Error getting OAuth Access Token.";
                errorMsg += "\nMessage: " + error.message;
                errorMsg += "\nStatus: " + error.response ? error.response.status : "<None>";
                errorMsg += "\nResponse data: " + error.response ? Utils.prettyPrintJson(JSON.stringify(error.response.data)) : "<None>";
                Utils.logError(errorMsg);

                reject(errorMsg);
            });
        });
    }
    public creatingDomainConfigurationDE(
    req: express.Request,
    res: express.Response,
    member_id: string,
    soap_instance_url: string,
    refreshToken: string,
    FolderID: string,
    tssd: string
  ) {
    //this.getRefreshTokenHelper(this._accessToken, res);
    console.log("creatingDomainConfigurationDE:" + member_id);
    console.log("creatingDomainConfigurationDE:" + soap_instance_url);
    console.log("creatingDomainConfigurationDE:" + refreshToken);
    Utils.logInfo("creatingDomainConfigurationDE:" + FolderID);
    console.log("creatingDomainConfigurationDE:" + tssd);

    //console.log('domainConfigurationDECheck:'+req.body.ParentFolderID);

    let refreshTokenbody = "";
    this.getRefreshTokenHelper(refreshToken, tssd, false, res)
      .then((response) => {
        Utils.logInfo(
          "creatingDomainConfigurationDE:" +
          JSON.stringify(response.refreshToken)
        );
        Utils.logInfo(
          "creatingDomainConfigurationDE:" + JSON.stringify(response.oauthToken)
        );
        refreshTokenbody = response.refreshToken;
        Utils.logInfo(
          "creatingDomainConfigurationDE1:" + JSON.stringify(refreshTokenbody)
        );

        let DCmsg =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
          "    <s:Header>" +
          '        <a:Action s:mustUnderstand="1">Create</a:Action>' +
          '        <a:To s:mustUnderstand="1">' +
          soap_instance_url +
          "Service.asmx" +
          "</a:To>" +
          '        <fueloauth xmlns="http://exacttarget.com">' +
          response.oauthToken +
          "</fueloauth>" +
          "    </s:Header>" +
          '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
          '        <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
          '            <Objects xsi:type="DataExtension">' +
          "                <CategoryID>" +
          FolderID +
          "</CategoryID>" +
          "                <CustomerKey>Pashtek Developer-" +
          member_id +
          "</CustomerKey>" +
          "                <Name>Pashtek Developer-" +
          member_id +
          "</Name>" +
          "                <Fields>" +
          "                    <Field>" +
          "                        <CustomerKey>Name</CustomerKey>" +
          "                        <Name>Name</Name>" +
          "                        <FieldType>Text</FieldType>" +
          "                        <MaxLength>50</MaxLength>" +
          "                        <IsRequired>true</IsRequired>" +
          "                        <IsPrimaryKey>false</IsPrimaryKey>" +
          "                    </Field>" +
          "                    <Field>" +
          "                        <CustomerKey>Phone NUmber</CustomerKey>" +
          "                        <Name>Phone Number</Name>" +
          "                        <FieldType>Number</FieldType>" +
          "                        <MaxLength>10</MaxLength>" +
          "                        <IsRequired>true</IsRequired>" +
          "                        <IsPrimaryKey>true</IsPrimaryKey>" +
          "                    </Field>" +
          "                    <Field>" +
          "                        <CustomerKey>Position</CustomerKey>" +
          "                        <Name>Position</Name>" +
          "                        <FieldType>Text</FieldType>" +
          "                        <MaxLength>20</MaxLength>" +
          "                        <IsRequired>true</IsRequired>" +
          "                        <IsPrimaryKey>false</IsPrimaryKey>" +
          "                    </Field>" +
          "                    <Field>" +
          "                        <CustomerKey>Years of Experience</CustomerKey>" +
          "                        <Name>Years of Experience</Name>" +
          "                        <FieldType>Number</FieldType>" +
          "                        <MaxLength>5</MaxLength>" +
          "                        <IsRequired>true</IsRequired>" +
          "                        <IsPrimaryKey>false</IsPrimaryKey>" +
          "                    </Field>" +       
          "                </Fields>" +
          "            </Objects>" +
          "        </CreateRequest>" +
          "    </s:Body>" +
          "</s:Envelope>";

        return new Promise<any>((resolve, reject) => {
          let headers = {
            "Content-Type": "text/xml",
          };

          axios({
            method: "post",
            url: "" + soap_instance_url + "Service.asmx" + "",
            data: DCmsg,
            headers: headers,
          })
            .then((response: any) => {
             
                response.data,
                (
                  err: any,
                  result: {
                    [x: string]: {
                      [x: string]: { [x: string]: { [x: string]: any }[] }[];
                    };
                  }
                ) => {
                  let DomainConfiguration =
                    result["soap:Envelope"]["soap:Body"][0][
                    "CreateResponse"
                    ][0]["Results"];

                  if (DomainConfiguration != undefined) {
                    let DEexternalKeyDomainConfiguration =
                      DomainConfiguration[0]["Object"][0]["CustomerKey"];

                    //this.DEexternalKeyDomainConfiguration =
                    // DomainConfiguration[0]["Object"][0]["CustomerKey"];
                    let sendresponse = {};
                    sendresponse = {
                      refreshToken: refreshTokenbody,
                      statusText:
                        "Domain Configuration Data extension has been created Successfully",
                      soap_instance_url: soap_instance_url,
                      member_id: member_id,
                      DEexternalKeyDomainConfiguration:
                        DEexternalKeyDomainConfiguration,
                    };
                    res.status(200).send(sendresponse);

                    /*  res
                  .status(200)
                  .send(
                    "Domain Configuration Data extension has been created Successfully"
                  );*/
                  }
                }
              
            })
            .catch((error: any) => {
              // error
              let errorMsg =
                "Error creating the Domain Configuration Data extension......";
              errorMsg += "\nMessage: " + error.message;
              errorMsg +=
                "\nStatus: " + error.response
                  ? error.response.status
                  : "<None>";
              errorMsg +=
                "\nResponse data: " + error.response.data
                  ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                  : "<None>";
              Utils.logError(errorMsg);

              reject(errorMsg);
            });
        });
      })
      .catch((error: any) => {
        res
          .status(500)
          .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
      });
  }

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
    }

