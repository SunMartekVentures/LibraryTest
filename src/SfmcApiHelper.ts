'use strict';

import axios from 'axios';
import express = require("express");
import { request } from 'http';
import Utils from './Utils';
import xml2js = require("xml2js");
import MC_Generic_Methods from "./Generic-method/src/";
import { access } from 'fs';

export default class SfmcApiHelper
{
    // Instance variables
  private client_id="";
  private client_secret="";
  // private _accessToken = "";
  private genericMethods = new MC_Generic_Methods();
  private oauthAccessToken=""; 
  private member_id = "514018007";
  private soap_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.soap.marketingcloudapis.com/";
  private _deExternalKey = "DF20Demo";
  private _sfmcDataExtensionApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";
  private refreshToken = "";
  private parentFolderId= "12785";
  private FolderID = "";
  private rest_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/";
  private datas =[ {
    "keys":{
            "id": "47"
            },
    "values":{
            "name": "alex",
            "email": "alex@gamil.com",
            }
}]
      /**
     * getOAuthAccessToken: POSTs to SFMC Auth URL to get an OAuth access token with the given ClientId and ClientSecret
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     * 
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

  public getOAuthTokenHelper(
    headers: any,
    postBody: any,
    res: any,
    tssd: string
  ): Promise<any> {
    this.genericMethods
      .getOAuthAccessToken(
        postBody.client_id,
        postBody.client_secret,
        postBody.grant_type,
        postBody.code,
        postBody.redirect_uri
      )
      .then((res: any) => {
        console.log("AccessToken Method from library", res.data.refresh_token);
        this.refreshToken = res.data.refresh_token;
        console.log("AccessToken Method  library", res);
       // res.status(200).send(res)


        if (res.data.refresh_token) {
          console.log(
            "Refresh token",
            this.refreshToken,
            "Refresh token from response",
            res.data.refresh_token
          );

          this.genericMethods
            .getRefreshToken(
              this.refreshToken,
              process.env.BASE_URL,
              postBody.client_id,
              postBody.client_secret
            )

            .then((response: any) => {
              console.log("Respo in refresh token generic method:",response)
              const paramData = {
                senderProfileID: "76441b26-df1a-ec11-a30a-48df373429c9",
                oauthToken: response.oauthToken,
                soapInstance: this.soap_instance_url,
                data:response.data
              };
             // response.status(200).send(paramData)
              //res.status(200).send(paramData)
              this.genericMethods
                .getSenderDomain(paramData)
                .then((response: any) => {
                  console.log(
                    "Sender Domain Response (Domain Name)::: " + JSON.stringify(response.domainName)
                  );
                  })

              this.genericMethods
              .userInfo(
                process.env.BASE_URL,
                response.oauthToken
              )
              .then((response:any)=>
              {
                console.log("UserInfo::>>",response);
               
                this.genericMethods
               .createFolder( 
                 paramData.oauthToken,
                response.soap_instance_url,
                response.member_id,
                this.parentFolderId
                 )
               .then((response:any)=>
               {
                 console.log("Data Extension Created...Check MC App")
               }
               )
               .catch((err:any)=>
               {
                 console.error("Error in creating folder",err)
               })


               this.genericMethods
               .getActiveJourney(
                 paramData.oauthToken,
                 process.env.BASE_URL
               )
               .then((response:any)=>
               {
                 console.log("Active Journeys:>>>:",JSON.stringify(response));
               })
               .catch((err:any)=>
               {
                 console.error(err)
               })
               

               this.genericMethods
               .getJourneyDetails(
                 paramData.oauthToken,
                 process.env.BASE_URL
               )
               .then((response:any)=>
               {
                 console.log("Journey Details:>>>:",JSON.stringify(response));
               })
               .catch((err:any)=>
               {
                 console.error(err)
               })
               
               this.genericMethods
               .dataFolderCheck(
                 paramData.oauthToken,
                 response.soap_instance_url,
                 response.member_id
               )
               .then((response:any)=>
               {
                 console.log("Response in dataFolderCheck >>>",response)
                 console.log("Folder id in use:",response.FolderID)
                  this.FolderID = response.FolderID
                  console.log(this.FolderID) 
                  console.log("FOlderID got!!")


                  const jsonArr=[
                    {
                      name:"LibraryName",
                      type:"text",
                      length:100,
                      isReq:true,
                      isKey:true
                    },
                    {
                      name:"LibraryModules",
                      type:"decimal",
                      precision:20,
                      scale:0,
                      isReq:true,
                      isKey:false
                    },
                    {
                      name:"Email",
                      type:"Email Address",
                      length:100,
                      isReq:true,
                      isKey:true
                    }
                  ]
                  this.genericMethods
               .createDataExtension
               (
                 response.member_id,
                response.soap_instance_url,
                paramData.oauthToken,
                this.FolderID,
                process.env.BASE_URL,
                jsonArr
               )
               .then((response:any)=>
               {
                 console.log("<><><Response in creating Data xtension><><>",response)
                 
               })
               .catch((err:any)=>
               {
                 console.log("Erroe in creatong data extension in folder",err)
               })
              })
              this.genericMethods
              .retrievingDataExtensionRows( paramData.oauthToken,
                response.soap_instance_url,
                response.member_id,
                this.parentFolderId)
                
              .then((response:any)=>
              {
                console.log("<<<<success>>>>");
                
                console.log("Journey Details:>>>:",JSON.stringify(response));
              })
            
              this.genericMethods
              .insertRowHelper(paramData.oauthToken,this.rest_instance_url,this._deExternalKey,this.datas)
                
              .then((response:any)=>
              {
                console.log("<<<<success>>>>");
                
                console.log("insert data:>>>:",JSON.stringify(response));
              })
              .catch((err:any)=>
              {
                console.error(err)
              })
              .catch((err:any)=>
              {
                console.error(err)
              })
               })
               .catch((err:any)=>
               {
                 console.log(err)
               })
                .catch((err: any) => {
                  console.error(
                    "error getting Sender Domain from library" + err
                  );
                });
              console.log(
                "Refresh token Method from library",
                response.refreshToken
              );
            })
            .catch((err: any) => {
              console.error("error getting refresh token from library" + err);
            });
        }
      })
      .catch((err: any) => {
        console.error("error getting access token from library" + err);
      });
      return 
    
  }
  
}