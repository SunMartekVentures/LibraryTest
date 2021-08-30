'use strict';

import axios from 'axios';
import express = require("express");
import { request } from 'http';
import Utils from './Utils';
// import xml2js = require("xml2js");

export default class SfmcApiHelper
{
    // Instance variables
  private client_id="";
  private client_secret="";
  // private _accessToken = "";
  private oauthAccessToken=""; 
  private member_id = "514018007";
  private soap_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.soap.marketingcloudapis.com/";
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
            "client_id": process.env.clientids,
            "client_secret": process.env.clientsecret
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


    // public domainConfigurationDECheck(
    //   req: express.Request,
    //   res: express.Response,
      
    // ) {
    //   //this.getRefreshTokenHelper(this._accessToken, res);
    //   console.log("domainConfigurationDECheck:" + this.member_id);
    //   console.log("domainConfigurationDECheck:" + this.soap_instance_url );
    //  // Utils.logInfo("domainConfigurationDECheck1:" + req.body.FolderID);
    //  //console.log('domainConfigurationDECheck:'+req.body.ParentFolderID);
    //  //this.getRefreshTokenHelper(this._accessToken, res);
    //   // this.getOAuthAccessToken(this.client_id, this.client_secret )
    //   //   .then((response)=>{
    //   //     Utils.logInfo(
    //   //       "domainConfigurationDECheck:" + JSON.stringify(response.oauthAccessToken)
    //   //     )
    //   //   }
    //   // );
         
    //       let soapMessage =
    //         '<?xml version="1.0" encoding="UTF-8"?>' +
    //         '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
    //         "    <s:Header>" +
    //         '        <a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
    //         '        <a:To s:mustUnderstand="1">' +
    //         this.soap_instance_url +
    //         "Service.asmx" +
    //         "</a:To>" +
    //         '        <fueloauth xmlns="http://exacttarget.com">' +
    //         this.oauthAccessToken +
    //         "</fueloauth>" +
    //         "    </s:Header>" +
    //         '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
    //         '        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
    //         "            <RetrieveRequest>" +
    //         "                <ObjectType>DataExtension</ObjectType>" +
    //         "                <Properties>ObjectID</Properties>" +
    //         "                <Properties>CustomerKey</Properties>" +
    //         "                <Properties>Name</Properties>" +
    //         '                <Filter xsi:type="SimpleFilterPart">' +
    //         "                    <Property>Name</Property>" +
    //         "                    <SimpleOperator>equals</SimpleOperator>" +
    //         "                    <Value>Domain Configuration-" +
    //         this.member_id +
    //         "</Value>" +
    //         "                </Filter>" +
    //         "            </RetrieveRequest>" +
    //         "        </RetrieveRequestMsg>" +
    //         "    </s:Body>" +
    //         "</s:Envelope>";
  
    //       return new Promise<any>((resolve, reject) => {
    //         let headers = {
    //           "Content-Type": "text/xml",
    //           SOAPAction: "Retrieve",
    //         };
  
    //         axios({
    //           method: "post",
    //           url: "" + req.body.soapInstance + "Service.asmx" + "",
    //           data: soapMessage,
    //           headers: { "Content-Type": "text/xml" },
    //         })
    //           .then((response: any) => {
    //               response.data
                  

    //           },
    //           )},
    //        ) }
               
        
    //     // .catch((error: any,res:any) => {
    //     //   res
    //     //     .status(500)
    //     //     .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
    //     // });
     
    public creatingDomainConfigurationDE(
    req: express.Request,
    res: express.Response,
  
    ) {
      console.log('dename'+req.body.dataextensionname);
    //this.getRefreshTokenHelper(this._accessToken, res);
    console.log("creatingDomainConfigurationDE:" + this.member_id);
    console.log("creatingDomainConfigurationDE:" + this.soap_instance_url);
       //console.log('domainConfigurationDECheck:'+req.body.ParentFolderID);
   
       this.getOAuthAccessToken(this.client_id, this.client_secret)
      .then((response) => {       
        Utils.logInfo(
          "creatingDomainConfigurationDE:" + JSON.stringify(response.oauthAccessToken)
               );
        
        let DCmsg =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
          "    <s:Header>" +
          '        <a:Action s:mustUnderstand="1">Create</a:Action>' +
          '        <a:To s:mustUnderstand="1">' +
          this.soap_instance_url +
          "Service.asmx" +
          "</a:To>" +
          '        <fueloauth xmlns="http://exacttarget.com">' +
          response.oauthAccessToken +
          "</fueloauth>" +
          "    </s:Header>" +
          '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
          '        <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
          '            <Objects xsi:type="DataExtension">' +
          
          "                <CustomerKey>"+
          req.body.dataextensionname +
          this.member_id +
          "</CustomerKey>" +
          "                <Name>"+
          req.body.dataextensionname+
          this.member_id +
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
          "                         <DataType>Number</DataType>"+
          "                        <FieldType>Phone</FieldType>" +
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
          "                         <DataType>Number</DataType>"+
          "                        <FieldType>Number</FieldType>" +
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
            url: "" + this.soap_instance_url + "Service.asmx" + "",
            data: DCmsg,
            headers: headers,
          })
            .then((response: any) => {
             
               console.log(response);
               
              
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

