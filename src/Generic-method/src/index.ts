// module.exports exports the function getContests as a promise and exposes it as a module.
// we can import an exported module by using require().
import axios, { AxiosRequestConfig } from "axios";
import { resolve } from "dns";
import { url } from "inspector";
import { data } from "jquery";
import { updateRestTypeNode } from "typescript";
const xml2js = require("xml2js");

export default class mcGenericMethods {
  public async getOAuthAccessToken(
    clientId: any,
    clientSecret: any,
    grantType: string,
    code: any,
    redirect_uri: any,
    tssd:any
  ) {    
    // Importing the Axios module to make API requests
    let result: any;
    let postBody;
    let headers = {
      "Content-Type": "application/json",
    };

    if (grantType === "client_credentials") {
      postBody = {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      };
    } else if (grantType === "authorization_code") {
      postBody = {
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirect_uri,
      };
    }

    let sfmcAuthServiceApiUrl =
      "https://"+tssd+".auth.marketingcloudapis.com/v2/token";

    await axios // Making a GET request using axios and requesting information from the API
      .post(sfmcAuthServiceApiUrl, postBody, { headers: headers })
      .then((response: any) => {        
        result = response; // The response of the API call is passed on to the next block
      })
      .catch((err: any) => {
        result = "Error getting access token >>> ";
        result += err; // Error handler
      });
    return result; // The contest data is returned
  }

  //Helper method to get refresh token
  public async getRefreshToken(
    refreshToken: string,
    tssd: string,
    clientId: any,
    clientSecret: any
  ): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {     
      let sfmcAuthServiceApiUrl =
        "https://" + tssd + ".auth.marketingcloudapis.com/v2/token";
      let headers = {
        "Content-Type": "application/json",
      };      
      let postBody = {
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      };
      await axios
        .post(sfmcAuthServiceApiUrl, postBody, { headers: headers })
        .then((response: any) => {          
          const customResponse = {
            tssd: tssd,
            soap_instance_url : response.data.soap_instance_url,
            refreshToken: response.data.refresh_token,
            oauthToken: response.data.access_token,
          };          
          return resolve(customResponse);
        })
        .catch((error: any) => {
          let errorMsg = "Error getting refresh Access Token.";
          errorMsg += "\nMessage: " + error.message;
          errorMsg +=
            "\nStatus: " + error.response ? error.response.status : "<None>";
          errorMsg +=
            "\nResponse data: " + error.response
              ? JSON.stringify(error.response.data)
              : "<None>";
          return reject(errorMsg);
        });
    });
  }

  //To get senderdomainname
  public async getSenderDomain(mcVals: any) {
    let FiltersoapMessage: string;
    if (mcVals.senderProfileID != undefined && mcVals.senderProfileID != "") {
      FiltersoapMessage =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
        "    <s:Header>" +
        '        <a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
        '        <a:To s:mustUnderstand="1">' +
        mcVals.soapInstance +
        "Service.asmx" +
        "</a:To>" +
        '        <fueloauth xmlns="http://exacttarget.com">' +
        mcVals.oauthToken +
        "</fueloauth>" +
        "    </s:Header>" +
        '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
        '        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
        "            <RetrieveRequest>" +
        "                <ObjectType>SenderProfile</ObjectType>" +
        "      <Properties>ObjectID</Properties>" +
        "        <Properties>Name</Properties>" +
        "        <Properties>CustomerKey</Properties>" +
        '<Filter xsi:type="SimpleFilterPart">' +
        "<Property>ObjectID</Property>" +
        "<SimpleOperator>equals</SimpleOperator>" +
        "<Value>" +
        mcVals.senderProfileID +
        "</Value>" +
        "</Filter>" +
        "            </RetrieveRequest>" +
        "        </RetrieveRequestMsg>" +
        "    </s:Body>" +
        "</s:Envelope>";
    }
    return new Promise<any>(async (resolve, reject) => {
      const configs: AxiosRequestConfig = {
        method: "post",
        url: "" + mcVals.soapInstance + "Service.asmx" + "",
        headers: {
          "Content-Type": "text/xml"
        },
        data: FiltersoapMessage,
      };
      await axios(configs)
        .then(function (response: any) {
          let senderProfileResponse = response.data;
          var senderDomainData = "";
          var parser = new xml2js.Parser();
          parser.parseString(
            senderProfileResponse,
            function (err: any, result: any) {
              senderDomainData =
                result["soap:Envelope"]["soap:Body"][0][
                  "RetrieveResponseMsg"
                ][0]["Results"];
              if (senderDomainData != undefined) {
                let domainName =
                  result["soap:Envelope"]["soap:Body"][0][
                    "RetrieveResponseMsg"
                  ][0]["Results"][0]["Name"][0];
                let sendresponse = {
                  domainName: domainName  
                };
                resolve(sendresponse);                
              }
            }
          );
        })
        .catch(function (error: any) {
          let errorMsg = "Error getting the sender profile ID's domain";
          errorMsg += "\nMessage: " + error.message;
          errorMsg +=
            "\nStatus: " + error.response ? error.response.status : "<None>";
          errorMsg +=
            "\nResponse data: " + error.response.data
              ? JSON.stringify(error.response.data)
              : "<None>";
          reject(errorMsg);
        });
    });
  }

  public async userInfo(tssd:string,token:string):Promise<any>
{
  return new Promise<any>(async (resolve, reject) => {
  let userInfoUrl =
  "https://" + tssd + ".auth.marketingcloudapis.com/v2/userinfo";
  let headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };
      
    axios
      .get(userInfoUrl, { headers: headers })
      .then((response: any) => {
        const getUserInfoResponse = {
          member_id: response.data.organization.member_id,
          soap_instance_url: response.data.rest.soap_instance_url,
          rest_instance_url: response.data.rest.rest_instance_url,
          data:response.data         
        };       
        resolve(getUserInfoResponse);
        //Set the member_id into the session
        //console.log("Setting active sfmc mid into session:" + getUserInfoResponse.member_id);
        // req.session.sfmcMemberId = getUserInfoResponse.member_id;
        //this.CheckAutomationStudio(access_token, req.body.refreshToken, req.body.tssd, getUserInfoResponse.member_id);
       
      })
      .catch((error: any) => {
        // error
        let errorMsg = "Error getting User's Information.";
        errorMsg += "\nMessage: " + error.message;
        errorMsg +=
          "\nStatus: " + error.response ? error.response.status : "<None>";
        errorMsg +=
          "\nResponse data: " + error.response
            ? //Utils.prettyPrintJson
            JSON.stringify(error.response.data)
            : "<None>";

          reject(error)
       // Utils.logError(errorMsg);

        // resolve
        //   .status(500)
        //   .send(JSON.stringify(error.response.data));
      });
  })
}
  public async createFolder(token:string,soap_instance_url:string,member_id:string,ParentFolderID:string)
  {
    
        let createFolderData =
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
          "<soapenv:Header>" +
          "<fueloauth>" +
          token +
          "</fueloauth>" +
          "</soapenv:Header>" +
          "<soapenv:Body>" +
          '<CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
          "<Options/>" +
          '<ns1:Objects xmlns:ns1="http://exacttarget.com/wsdl/partnerAPI" xsi:type="ns1:DataFolder">' +
          '<ns1:ModifiedDate xsi:nil="true"/>' +
          '<ns1:ObjectID xsi:nil="true"/>' +
          "<ns1:CustomerKey>LibraryCreated-" +
          member_id +
          "</ns1:CustomerKey>" +
          "<ns1:ParentFolder>" +
          '<ns1:ModifiedDate xsi:nil="true"/>' +
          "<ns1:ID>" +
          ParentFolderID +
          "</ns1:ID>" +
          '<ns1:ObjectID xsi:nil="true"/>' +
          "</ns1:ParentFolder>" +
          "<ns1:Name>LibraryCreated-" +
          member_id +
          "</ns1:Name>" +
          "<ns1:Description>LibraryCreated-" +
          member_id +
          " Folder</ns1:Description>" +
          "<ns1:ContentType>dataextension</ns1:ContentType>" +
          "<ns1:IsActive>true</ns1:IsActive>" +
          "<ns1:IsEditable>true</ns1:IsEditable>" +
          "<ns1:AllowChildren>true</ns1:AllowChildren>" +
          "</ns1:Objects>" +
          "</CreateRequest>" +
          "</soapenv:Body>" +
          "</soapenv:Envelope>";

        return new Promise<any>((resolve, reject) => {
          let headers = {
            "Content-Type": "text/xml",
            SOAPAction: "Create",
          };

          // POST to Marketing Cloud Data Extension endpoint to load sample data in the POST body
          axios({
            method: "post",
            url: "" + soap_instance_url + "Service.asmx" + "",
            data: createFolderData,
            headers: headers,
          })
            .then((response: any) => {
              let sendresponse = {};
              var parser = new xml2js.Parser();
              parser.parseString(
                response.data,
                (
                  err: any,
                  result: {
                    [x: string]: {
                      [x: string]: { [x: string]: { [x: string]: any }[] }[];
                    };
                  }
                ) => {
                  let FolderID =
                    result["soap:Envelope"]["soap:Body"][0][
                    "CreateResponse"
                    ][0]["Results"][0]["NewID"][0];
                  if (FolderID != undefined) {
                    //  this.FolderID = FolderID;
                    sendresponse = {
                     // refreshToken: refreshTokenbody,
                      statusText: true,
                      soap_instance_url: soap_instance_url,
                      member_id:member_id,
                      FolderID: FolderID,
                    };
                    resolve(sendresponse)
                    //res.status(200).send(sendresponse);
                  } else {
                    sendresponse = {
                     // refreshToken: refreshTokenbody,
                      statusText: false,
                      soap_instance_url: soap_instance_url,
                      member_id: member_id,
                      FolderID: FolderID,
                    };
                    resolve(sendresponse);
                  }
                }
              );
            })
            .catch((error: any) => {
              // error
              let errorMsg =
                "Error creating the folder......";
              errorMsg += "\nMessage: " + error.message;
              errorMsg +=
                "\nStatus: " + error.response
                  ? error.response.status
                  : "<None>";
              errorMsg +=
                "\nResponse data: " + error.response.data
                  ? //Utils.prettyPrintJson
                  JSON.stringify(error.response.data)
                  : "<None>";
             // Utils.logError(errorMsg);

              reject(errorMsg);
            });
        });
      }

     public async getActiveJourney(token:string,tssd:string)
     {
       return new Promise<any>((resolve, reject) => {
          let headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          };
          // https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/
          let JourneyUrl =
            "https://" +
            tssd +
            ".rest.marketingcloudapis.com/interaction/v1/interactions?status=Published";
          axios({
            method: "get",
            url: JourneyUrl,
            headers: headers,
          })
            .then((response: any) => {
              let sendresponse = {
                // refreshToken: refreshTokenbody,
                journeys: response.data,
              };
              resolve(sendresponse);
            })
            .catch((error: any) => {
              // error
              let errorMsg = "Error getting the Active Journeys......";
              errorMsg += "\nMessage: " + error.message;
              errorMsg +=
                "\nStatus: " + error.response
                  ? error.response.status
                  : "<None>";
              errorMsg +=
                "\nResponse data: " + error.response.data
                  ? //Utils.prettyPrintJson(
                    JSON.stringify(error.response.data)
                  : "<None>";
              //Utils.logError(errorMsg);

              reject(errorMsg);
            });
        }); 
     } 


     public async getJourneyDetails(token:string,tssd:string)
     {      
          return new Promise<any>((resolve, reject) => {
            let headers = {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            };
            let JourneyUrl =
              "https://" +
               tssd +
              ".rest.marketingcloudapis.com/interaction/v1/interactions/" 
              //+
              //req.body.journeyId;
            axios({
              method: "get",
              url: JourneyUrl,
              headers: headers,
            })
              .then((response: any) => {
                let sendresponse = {
                  //refreshToken: refreshTokenbody,
                  activity: response.data,
                };
                resolve(sendresponse)
                //res.status(200).send(sendresponse);
                // res.status(200).send(response.data);
              })
              .catch((error: any) => {
                // error
                let errorMsg = "Error getting the Active Journeys......";
                errorMsg += "\nMessage: " + error.message;
                errorMsg +=
                  "\nStatus: " + error.response
                    ? error.response.status
                    : "<None>";
                errorMsg +=
                  "\nResponse data: " + error.response.data
                    ? //Utils.prettyPrintJson(
                      JSON.stringify(error.response.data)
                    : "<None>";
                //Utils.logError(errorMsg);
  
                reject(errorMsg);
              });
          });
        }
        public retrievingDataExtensionFolderId(
         soap_instance_url:string,
         oauthToken:string,
         member_id:string
        ) {
          
          let soapMessage = "";
              let headers = {
                "Content-Type": "text/xml",
                SOAPAction: "Retrieve",
              };
              soapMessage =
                '<?xml version="1.0" encoding="UTF-8"?>' +
                '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                "    <s:Header>" +
                '        <a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
                '        <a:To s:mustUnderstand="1">' +
                soap_instance_url +
                "Service.asmx" +
                "</a:To>" +
                '        <fueloauth xmlns="http://exacttarget.com">' +
                oauthToken +
                "</fueloauth>" +
                "    </s:Header>" +
                '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
                '        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
                "            <RetrieveRequest>" +
                "                <ObjectType>DataFolder</ObjectType>" +
                "                <Properties>ID</Properties>" +
                "                <Properties>CustomerKey</Properties>" +
                "                <Properties>Name</Properties>" +
                '                <Filter xsi:type="SimpleFilterPart">' +
                "                    <Property>Name</Property>" +
                "                    <SimpleOperator>equals</SimpleOperator>" +
                "                    <Value>Data Extensions</Value>" +
                "                </Filter>" +
                "            </RetrieveRequest>" +
                "        </RetrieveRequestMsg>" +
                "    </s:Body>" +
                "</s:Envelope>";
      
              return new Promise<any>((resolve, reject) => {
                axios({
                  method: "post",
                  url: "" + soap_instance_url + "Service.asmx" + "",
                  data: soapMessage,
                  headers: headers,
                })
                  .then((response: any) => {
                    var extractedData = "";
                    let sendresponse = {};
                    var parser = new xml2js.Parser();
                    parser.parseString(
                      response.data,
                      (
                        err: any,
                        result: {
                          [x: string]: {
                            [x: string]: { [x: string]: { [x: string]: any }[] }[];
                          };
                        }
                      ) => {
                        let ParentFolderID =
                          result["soap:Envelope"]["soap:Body"][0][
                          "RetrieveResponseMsg"
                          ][0]["Results"][0]["ID"][0];
      
                        if (ParentFolderID != undefined) {
                          //    this.ParentFolderID = ParentFolderID;
                          sendresponse = {
                           
                            statusText: true,
                            soap_instance_url: soap_instance_url,
                            member_id: member_id,
                            ParentFolderID: ParentFolderID,
                          };
                          resolve(sendresponse);
                        } else {
                          sendresponse = {
                            
                            statusText: false,
                            soap_instance_url: soap_instance_url,
                            member_id: member_id,
                            ParentFolderID: ParentFolderID,
                          };
                          resolve(sendresponse);
                        }
                        //this.creatingHearsayIntegrationFolder(ParentFolderID);
                      }
                    );
                  })
                  .catch((error: any) => {
                    // error
                    let errorMsg =
                      "Error getting the Data extensions folder properties......";
                    errorMsg += "\nMessage: " + error.message;
                    errorMsg +=
                      "\nStatus: " + error.response
                        ? error.response.status
                        : "<None>";
                    errorMsg +=
                      "\nResponse data: " + error.response.data
                        ? //Utils.prettyPrintJson(
                          JSON.stringify(error.response.data)
                        : "<None>";
      
                    reject(errorMsg);
                  });
              });
            }
          
        

      public async dataFolderCheck(token:string,soap_instance_url:string,member_id:string)
      {
        return new Promise<any>(async (resolve, reject) => {
        let self = this;
        self
          .getCategoryIDHelper(
            token,
            soap_instance_url,
            member_id
          )
          .then((result) => {
            const sendresponse = {
             // refreshToken: refreshTokenbody,
              statusText: result.statusText,
              soap_instance_url: soap_instance_url,
              member_id: member_id,
              FolderID: result.FolderID,
            };
            resolve(sendresponse)
            
          });
          // .catch((err) => {
          //   reject(err);
          // });
      });
    }
      // .catch((error: any) => {
      //   res
      //     .status(500)
      //     .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
      // });
    

  //Helper method for checking Data extension
  public getCategoryIDHelper(
    token:string,
    soap_instance_url:string,
    member_id:string
  ): Promise<any> {
    let soapMessage =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
      "    <s:Header>" +
      '        <a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
      '        <a:To s:mustUnderstand="1">' +
      soap_instance_url +
      "Service.asmx" +
      "</a:To>" +
      '        <fueloauth xmlns="http://exacttarget.com">' +
      token +
      "</fueloauth>" +
      "    </s:Header>" +
      '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
      '        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
      "            <RetrieveRequest>" +
      "                <ObjectType>DataFolder</ObjectType>" +
      "                <Properties>ID</Properties>" +
      "                <Properties>CustomerKey</Properties>" +
      "                <Properties>Name</Properties>" +
      "                <Properties>ParentFolder.ID</Properties>" +
      "                <Properties>ParentFolder.Name</Properties>" +
      '                <Filter xsi:type="SimpleFilterPart">' +
      "                    <Property>Name</Property>" +
      "                    <SimpleOperator>equals</SimpleOperator>" +
      "                    <Value>LibraryCreated-" +
      member_id +
      "</Value>" +
      "                </Filter>" +
      "            </RetrieveRequest>" +
      "        </RetrieveRequestMsg>" +
      "    </s:Body>" +
      "</s:Envelope>";

    return new Promise<any>((resolve, reject) => {
      let headers = {
        "Content-Type": "text/xml",
        SOAPAction: "Retrieve",
      };

      axios({
        method: "post",
        url: "" + soap_instance_url + "Service.asmx" + "",
        data: soapMessage,
        headers: headers,
      })
        .then((response: any) => {         
          var extractedData = "";
          var parser = new xml2js.Parser();
          parser.parseString(
            response.data,
            (
              err: any,
              result: {
                [x: string]: {
                  [x: string]: { [x: string]: { [x: string]: any }[] }[];
                };
              }
            ) => {
              let FolderID =
                result["soap:Envelope"]["soap:Body"][0][
                "RetrieveResponseMsg"
                ][0]["Results"];
              if (FolderID != undefined) {
                //    this.FolderID = FolderID[0]["ID"][0];
                
                resolve({
                  status: response.status,
                  statusText: true,
                  FolderID: FolderID[0]["ID"][0],
                });
              } else {
                resolve({
                  status: response.status,
                  statusText: false,
                });
              }
            }
          );
        })
        .catch((error: any) => {
          // error
          let errorMsg =
            "Error loading sample data. POST response from Marketing Cloud:";
          errorMsg += "\nMessage: " + error.message;
          errorMsg +=
            "\nStatus: " + error.response ? error.response.status : "<None>";
          errorMsg +=
            "\nResponse data: " + error.response.data
              ? //Utils.prettyPrintJson(
                JSON.stringify(error.response.data)
              : "<None>";
          //Utils.logError(errorMsg);

          reject(errorMsg);
        });
    });
      }


      public async retrievingDataExtensionRows(token:string,soap_instance_url:string,member_id:string,ParentFolderID:string) 
      {
             //console.log('domainConfigurationDECheck:'+req.body.ParentFolderID);
             let refreshTokenbody = "";
             let soapMessage = "";
                   let FiltersoapMessage =
                     '<?xml version="1.0" encoding="UTF-8"?>' +
                     '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                     "    <s:Header>" +
                     '        <a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
                     '        <a:To s:mustUnderstand="1">' +
                     soap_instance_url +
                     "Service.asmx" +
                     "</a:To>" +
                     '        <fueloauth xmlns="http://exacttarget.com">' +
                     token +
                     "</fueloauth>" +
                     "    </s:Header>" +
                     '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
                     '        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
                     "            <RetrieveRequest>" +
                     "                <ObjectType>DataExtensionObject[MCAPP44]</ObjectType>" +
                     "      <Properties>id</Properties>" +
                     "        <Properties>name</Properties>" +
                     "        <Properties>email</Properties>" +
                     "        <Properties>created_dts</Properties>" +
                     "            </RetrieveRequest>" +
                     "        </RetrieveRequestMsg>" +
                     "    </s:Body>" +
                     "</s:Envelope>";
                   soapMessage = FiltersoapMessage;
                 // }
                 return new Promise<any>((resolve, reject) => {
                   const configs: AxiosRequestConfig = {
                     method: "post",
                     url: "" + soap_instance_url + "Service.asmx" + "",
                     headers: {
                       "Content-Type": "text/xml",
                     },
                     data: soapMessage,
                   };
                   axios(configs)
                     .then(function (response: any) {                      
                       let rawdata = response.data;
                       var rawData = "";
                       var parser = new xml2js.Parser();
                       parser.parseString(rawdata, function (err: any, result: any) {
                         rawData =
                           result["soap:Envelope"]["soap:Body"][0][
                             "RetrieveResponseMsg"
                           ][0]["Results"];
                       });
                       let sendresponse = {
                         refreshToken: refreshTokenbody,
                         rawData: rawData,
                       };
                       resolve(sendresponse);
                     })
                     .catch(function (error: any) {
                       let errorMsg = "Error getting the Data extensions getting rows";
                       errorMsg += "\nMessage: " + error.message;
                       errorMsg +=
                         "\nStatus: " + error.response
                           ? error.response.status
                           : "<None>";
                       errorMsg +=
                         "\nResponse data: " + error.response.data
                           ? console.log(JSON.stringify(error.response.data))
                           : "<None>";
                       console.log("errormsg:" + errorMsg);
                       reject(errorMsg);
                     });
                 });
           };

           public async insertRowHelper(
             oauthAccessToken: string,
             rest_instance_url: string,
             DEexternalKeyDomainConfiguration: any,
             jsonData: any
           ): Promise<any> {
             let self = this;
             let _sfmcDataExtensionApiUrl =
               rest_instance_url +
               "/hub/v1/dataevents/key:" +
               DEexternalKeyDomainConfiguration +
               "/rowset";
             let ReqBody = jsonData;             
             let post_data = jsonData;
             return new Promise<any>((resolve, reject) => {
               let headers = {
                 "Content-Type": "application/json",
                 Authorization: "Bearer " + oauthAccessToken,
               };
               axios
                 .post(_sfmcDataExtensionApiUrl, post_data, { headers: headers })
                 .then((response: any) => {
                   // success
                   resolve({
                     status: response.status,
                     statusText:
                       response.statusText +
                       "\n" +
                       console.log(JSON.stringify(response.data)),
                   });
                 })
                 .catch((error: any) => {
                   // error
                   let errorMsg =
                     "Error loading sample data. POST response from Marketing Cloud:";
                   errorMsg += "\nMessage: " + error.message;
                   errorMsg +=
                     "\nStatus: " + error.response ? error.response.status : "<None>";
                   errorMsg +=
                     "\nResponse data: " + error.response.data
                       ? console.log(JSON.stringify(error.response.data))
                       : "<None>";
                       console.log(errorMsg);
                   reject(errorMsg);
                 });
             });
           };

              /**
               * 
               * @param member_id 
               * @param soap_instance_url 
               * @param token 
               * @param FolderID 
               * @param tssd 
               * @param jsonArr 
               * <-createDataExtension JSON->

               FieldRequired for text:
                name:string,
                type:string,
                length:number,
                isReq:boolean,
                isKey:boolean

               FieldRequired for Decimal:
                name:string,
                type:string,
                precision:number,
                scale:number,
                isReq:boolean,
                isKey:boolean

                FieldRequired for EmailAddress:
                name:string,
                type:string,
                isReq:boolean,
                isKey:boolean

                FieldRequired for Number:
                name:string,
                type:string,
                length:number,
                isReq:boolean,
                isKey:boolean
               * @returns 
               */
      public async createDataExtension   
      ( 
        member_id: string,
        soap_instance_url: string,
        token:string,
        FolderID: string,
        tssd: string,
        jsonArr:any,
        text:string
      ) {
        // console.log
        // (
        // "Param values>>> Mid:",member_id,
        // "soap-url:",soap_instance_url,
        // "token:",token,
        // "folderid:",FolderID,
        // "tssd:",tssd,
        // "JsonArr:",jsonArr,
        // "isSend Text:",text
        // );
        
        if(text=="true")
        {
          let OrgMsg = '<?xml version="1.0" encoding="UTF-8"?>'
  +'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'
  +'    <s:Header>'
  +'        <a:Action s:mustUnderstand="1">Create</a:Action>'
  +'        <a:To s:mustUnderstand="1">'+soap_instance_url+'Service.asmx'+'</a:To>'
  +'        <fueloauth xmlns="http://exacttarget.com">'+token+'</fueloauth>'
  +'    </s:Header>'
  +'    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
  +'        <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">'
  +'        <Options>'
  +'          <SaveOptions/>'
  +'          </Options>'
  +'            <Objects xsi:type="DataExtension">'
  +'                <CategoryID>25136</CategoryID>'
  +'                <CustomerKey>OrgSetup01</CustomerKey>'
  +'                <Name>Org Setup-01</Name>'
  +'                <IsSendable>true</IsSendable>'
  +'                <IsTestable>false</IsTestable>'
  +'            <DataRetentionPeriodLength>48</DataRetentionPeriodLength>'
  +'            <DataRetentionPeriod>Days</DataRetentionPeriod>'
  +'            <RowBasedRetention>false</RowBasedRetention>'
  +'            <ResetRetentionPeriodOnImport>true</ResetRetentionPeriodOnImport>'
  +'            <DeleteAtEndOfRetentionPeriod>false</DeleteAtEndOfRetentionPeriod>'
  +'                <SendableDataExtensionField>'
  +'                    <CustomerKey>Customer Unique ID</CustomerKey>'
  +'                    <Name>Customer Unique ID</Name>'
  +'                    <FieldType>Text</FieldType>'
  +'                </SendableDataExtensionField>'
  +'                <SendableSubscriberField>'
  +'                    <Name>Subscriber Key</Name>'
  +'                    <Value></Value>'
  +'                </SendableSubscriberField>'
  +'                <Fields>'
  +'                    <Field>'
  +'                        <CustomerKey>Customer Unique ID</CustomerKey>'
  +'                        <Name>Customer Unique ID</Name>'
  +'                        <FieldType>Text</FieldType>'
  +'                        <MaxLength>100</MaxLength>'
  +'                        <IsRequired>true</IsRequired>'
  +'                        <IsPrimaryKey>true</IsPrimaryKey>'
  +'                    </Field>'
  +'                    <Field>'
  +'                        <CustomerKey>Hearsay Org ID</CustomerKey>'
  +'                        <Name>Hearsay Org ID</Name>'
  +'                       <FieldType>Text</FieldType>'
  +'                        <MaxLength>50</MaxLength>'
  +'                        <IsRequired>true</IsRequired>'
  +'                        <IsPrimaryKey>false</IsPrimaryKey>'
  +'                    </Field>'
  +'                    <Field>'
  +'                        <CustomerKey>Hearsay User Reference ID</CustomerKey>'
  +'                        <Name>Hearsay User Reference ID</Name>'
  +'                        <FieldType>Text</FieldType>'
  +'                        <MaxLength>50</MaxLength>'
  +'                        <IsRequired>true</IsRequired>'
  +'                        <IsPrimaryKey>false</IsPrimaryKey>'
  +'                    </Field>'
  +'                    <Field>'
  +'                        <CustomerKey>Created or Modified Date</CustomerKey>'
  +'                        <Name>Created or Modified Date</Name>'
  +'                        <FieldType>Date</FieldType>'
  +'						<DefaultValue>getdate()</DefaultValue>'
  +'                       <IsRequired>true</IsRequired>'
  +'                        <IsPrimaryKey>false</IsPrimaryKey>'
  +'                    </Field>'
  +'                </Fields>'
  +'            </Objects>'
  +'        </CreateRequest>'
  +'    </s:Body>'
  +'</s:Envelope>'
      return new Promise<any>((resolve, reject) =>
      {
        let headers = {
                  'Content-Type': 'text/xml'
              };
              // POST to Marketing Cloud Data Extension endpoint to load sample data in the POST body
              axios({
          method: 'post',
          url: ''+soap_instance_url+'Service.asmx'+'',
          data: OrgMsg,
          headers: headers							
          })            
          .then((response: any) => {
          resolve("Sendable Data Extension created successfully");		          
          })
        .catch((error: any) => {
              // error
              let errorMsg = "Error creating the Org Setup Data extension......";
              errorMsg += "\nMessage: " + error.message;
              errorMsg += "\nStatus: " + error.response ? error.response.status : "<None>";
              errorMsg += "\nResponse data: " + error.response.data ? JSON.stringify(error.response.data) : "<None>";
              reject(errorMsg);
            });
          });
        }


        else if(text=="false")
        {
            let bodySoapData  = '';
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
              token +
              "</fueloauth>" +
              "    </s:Header>" +
              '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
              '        <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
              '            <Objects xsi:type="DataExtension">' +
              "                <CategoryID>"+
              FolderID+
              "</CategoryID>" +
              "                <CustomerKey>LibraryMethod"+
              "</CustomerKey>" +
              "                <Name>LibraryMethod"+
              "</Name>" +
              "                <Fields>" 
              for(var i=0;i<jsonArr.length;i++)
              {
                if(jsonArr[i].name != null && jsonArr[i].type=='text'|| jsonArr[i].type=="Text")
                {
                bodySoapData +="         <Field>" +
                "                        <CustomerKey>"+jsonArr[i].name+"</CustomerKey>" +
                "                        <Name>"+jsonArr[i].name+"</Name>" +
                "                        <FieldType>Text</FieldType>" +
                "                        <MaxLength>"+jsonArr[i].length+"</MaxLength>" +
                "                        <IsRequired>"+jsonArr[i].isReq+"</IsRequired>" +
                "                        <IsPrimaryKey>"+jsonArr[i].isKey+"</IsPrimaryKey>" +
                "                    </Field>" 
                }
                else if(jsonArr[i].name != null && jsonArr[i].type=='decimal'|| jsonArr[i].type=="Decimal")
                {
                  
                  bodySoapData +="         <Field>" +
                  "                        <CustomerKey>"+jsonArr[i].name+"</CustomerKey>" +
                  "                        <Name>"+jsonArr[i].name+"</Name>" +
                  "                        <FieldType>Decimal</FieldType>" +
                  "                        <Precision>"+jsonArr[i].precision+"</Precision>" +
                  "                          <Scale>0</Scale>" +
                  "                        <IsRequired>"+jsonArr[i].isReq+"</IsRequired>" +
                  "                        <IsPrimaryKey>"+jsonArr[i].isKey+"</IsPrimaryKey>" +
                  "                    </Field>"   
                }
                else if(jsonArr[i].name != null && jsonArr[i].type=='email address'|| jsonArr[i].type=="Email Address")
                {
                  bodySoapData +="        <Field>" +
                  "                        <CustomerKey>"+jsonArr[i].name+"</CustomerKey>" +
                  "                        <Name>"+jsonArr[i].name+"</Name>" +
                  "                        <FieldType>EmailAddress</FieldType>" +
                  "                        <MaxLength>254</MaxLength>" +
                  "                        <IsRequired>"+jsonArr[i].isReq+"</IsRequired>" +
                  "                        <IsPrimaryKey>"+jsonArr[i].isKey+"</IsPrimaryKey>" +
                  "                    </Field>"
                }
                else
                {
                  bodySoapData +="         <Field>" +
                  "                        <CustomerKey>"+jsonArr[i].name+"</CustomerKey>" +
                  "                        <Name>"+jsonArr[i].name+"</Name>" +
                  "                        <FieldType>Number</FieldType>" +                 
                  "                        <IsRequired>"+jsonArr[i].isReq+"</IsRequired>" +
                  "                        <IsPrimaryKey>"+jsonArr[i].isKey+"</IsPrimaryKey>" +
                  "                    </Field>" 
                }
               
              } 
              let footer=      
              "                </Fields>" +
              "            </Objects>" +
              "        </CreateRequest>" +
              "    </s:Body>" +
              "</s:Envelope>";

              let dataDE = DCmsg + bodySoapData + footer;              
              return new Promise<any>((resolve, reject) => {
              let headers = {
                "Content-Type": "text/xml",
              };
              axios({
                method: "post",
                url: "" + soap_instance_url + "Service.asmx" + "",
                data: dataDE,
                headers: headers,
              })
                .then((response: any) => {
                  var parser = new xml2js.Parser();
                  parser.parseString(
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
                         // refreshToken: refreshTokenbody,
                          statusText:
                            " Data extension has been created Successfully",
                          soap_instance_url: soap_instance_url,
                          member_id: member_id,
                          DEexternalKeyDomainConfiguration:
                            DEexternalKeyDomainConfiguration,
                          data:dataDE
                        };
                        resolve(sendresponse);
    
                        /*  res
                      .status(200)
                      .send(
                        "Domain Configuration Data extension has been created Successfully"
                      );*/
                      }
                    }
                  );
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
                      ? //Utils.prettyPrintJson(
                        JSON.stringify(error.response.data)
                      : "<None>";
                  //Utils.logError(errorMsg);
    
                  reject(errorMsg);
                });
            });
          }
          };

//       public async createDEwithRetention
//       (
//         soap_instance_url: string,
//         token:string,
//         FolderID: string
//       )
//       {
//         let OrgMsg = '<?xml version="1.0" encoding="UTF-8"?>'
// +'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'
// +'    <s:Header>'
// +'        <a:Action s:mustUnderstand="1">Create</a:Action>'
// +'        <a:To s:mustUnderstand="1">'+soap_instance_url+'Service.asmx'+'</a:To>'
// +'        <fueloauth xmlns="http://exacttarget.com">'+token+'</fueloauth>'
// +'    </s:Header>'
// +'    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
// +'        <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">'
// +'        <Options>'
// +'          <SaveOptions/>'
// +'          </Options>'
// +'            <Objects xsi:type="DataExtension">'
// +'                <CategoryID>25136</CategoryID>'
// +'                <CustomerKey>OrgSetup01</CustomerKey>'
// +'                <Name>Org Setup-01</Name>'
// +'                <IsSendable>true</IsSendable>'
// +'                <IsTestable>false</IsTestable>'
// +'            <DataRetentionPeriodLength>48</DataRetentionPeriodLength>'
// +'            <DataRetentionPeriod>Days</DataRetentionPeriod>'
// +'            <RowBasedRetention>false</RowBasedRetention>'
// +'            <ResetRetentionPeriodOnImport>true</ResetRetentionPeriodOnImport>'
// +'            <DeleteAtEndOfRetentionPeriod>false</DeleteAtEndOfRetentionPeriod>'
// +'                <SendableDataExtensionField>'
// +'                    <CustomerKey>Customer Unique ID</CustomerKey>'
// +'                    <Name>Customer Unique ID</Name>'
// +'                    <FieldType>Text</FieldType>'
// +'                </SendableDataExtensionField>'
// +'                <SendableSubscriberField>'
// +'                    <Name>Subscriber Key</Name>'
// +'                    <Value></Value>'
// +'                </SendableSubscriberField>'
// +'                <Fields>'
// +'                    <Field>'
// +'                        <CustomerKey>Customer Unique ID</CustomerKey>'
// +'                        <Name>Customer Unique ID</Name>'
// +'                        <FieldType>Text</FieldType>'
// +'                        <MaxLength>100</MaxLength>'
// +'                        <IsRequired>true</IsRequired>'
// +'                        <IsPrimaryKey>true</IsPrimaryKey>'
// +'                    </Field>'
// +'                    <Field>'
// +'                        <CustomerKey>Hearsay Org ID</CustomerKey>'
// +'                        <Name>Hearsay Org ID</Name>'
// +'                       <FieldType>Text</FieldType>'
// +'                        <MaxLength>50</MaxLength>'
// +'                        <IsRequired>true</IsRequired>'
// +'                        <IsPrimaryKey>false</IsPrimaryKey>'
// +'                    </Field>'
// +'                    <Field>'
// +'                        <CustomerKey>Hearsay User Reference ID</CustomerKey>'
// +'                        <Name>Hearsay User Reference ID</Name>'
// +'                        <FieldType>Text</FieldType>'
// +'                        <MaxLength>50</MaxLength>'
// +'                        <IsRequired>true</IsRequired>'
// +'                        <IsPrimaryKey>false</IsPrimaryKey>'
// +'                    </Field>'
// +'                    <Field>'
// +'                        <CustomerKey>Created or Modified Date</CustomerKey>'
// +'                        <Name>Created or Modified Date</Name>'
// +'                        <FieldType>Date</FieldType>'
// +'						<DefaultValue>getdate()</DefaultValue>'
// +'                       <IsRequired>true</IsRequired>'
// +'                        <IsPrimaryKey>false</IsPrimaryKey>'
// +'                    </Field>'
// +'                </Fields>'
// +'            </Objects>'
// +'        </CreateRequest>'
// +'    </s:Body>'
// +'</s:Envelope>'
// 		return new Promise<any>((resolve, reject) =>
// 		{
// 			let headers = {
//                 'Content-Type': 'text/xml'
//             };
//             console.log("FolderId:",FolderID,"Soap_Ins_Url:",soap_instance_url,"Token:",token)
//             console.log("Data to send for retention :>>>",OrgMsg,"Headers:",headers)


//             // POST to Marketing Cloud Data Extension endpoint to load sample data in the POST body
//             axios({
// 				method: 'post',
// 				url: ''+soap_instance_url+'Service.asmx'+'',
// 				data: OrgMsg,
// 				headers: headers							
// 				})            
// 				.then((response: any) => {
//           console.log("Data in retention:>>>",response);
          
// 				resolve("Sendable Data Extension created successfully ");		
				
// 				})
// 			.catch((error: any) => {
// 						// error
// 						let errorMsg = "Error creating the Org Setup Data extension......";
// 						errorMsg += "\nMessage: " + error.message;
// 						errorMsg += "\nStatus: " + error.response ? error.response.status : "<None>";
// 						errorMsg += "\nResponse data: " + error.response.data ? JSON.stringify(error.response.data) : "<None>";
// 						reject(errorMsg);
// 					});
//         });
//       }
      }

     
        
          
     
  



