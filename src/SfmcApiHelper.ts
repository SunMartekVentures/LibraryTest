'use strict';

import axios from 'axios';
import express = require("express");
import Utils from './Utils';

export default class SfmcApiHelper
{
    // Instance variables
  private _accessToken = "";
  private member_id = "514018007";
  private soap_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.soap.marketingcloudapis.com/";
  private FolderID = "";
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
    Utils.logInfo("creatingDomainConfigurationDE:" + FolderID);
    

    //console.log('domainConfigurationDECheck:'+req.body.ParentFolderID);

    let refreshTokenbody = "";
    this.getOAuthAccessToken(refreshToken, tssd, false, res)
      .then((response) => {       
        Utils.logInfo(
          "creatingDomainConfigurationDE:" + JSON.stringify(response.oauthToken)
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

    }

