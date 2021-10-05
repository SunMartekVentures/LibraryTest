// module.exports exports the function getContests as a promise and exposes it as a module.
// we can import an exported module by using require().
import axios, { AxiosRequestConfig } from "axios";
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
    redirect_uri: any
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
      "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/v2/token";

    await axios // Making a GET request using axios and requesting information from the API
      .post(sfmcAuthServiceApiUrl, postBody, { headers: headers })
      .then((response: any) => {
        // If the GET request is successful, this block is executed
        result = response; // The response of the API call is passed on to the next block
        console.log("respo in lib oauth:",response);
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
      console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
      let postBody1 = {
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      };
      await axios
        .post(sfmcAuthServiceApiUrl, postBody1, { headers: headers })
        .then((response: any) => {
          const customResponse = {
            refreshToken: response.data.refresh_token,
            oauthToken: response.data.access_token,
          };
          console.log()
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
          "Content-Type": "text/xml",
        },
        data: FiltersoapMessage,
      };
      await axios(configs)
        .then(function (response: any) {
          console.log("Response in senderdomain lib:",response)
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
    console.log("UserInfo's tssd:",tssd," ","token:",token)
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
          // refreshToken: refreshTokenbody,
        };
        console.log("Response in lib app user info>>",JSON.stringify(getUserInfoResponse))
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
       // Utils.logError(errorMsg);

        // resolve
        //   .status(500)
        //   .send(JSON.stringify(error.response.data));
      });
  })
}
  public async createFolder(token:string,member_id:string,soap_instance_url:string,ParentFolderID:string)
  {
    console.log("createSparkpostIntegrationFolder:" + member_id);
    console.log("createSparkpostIntegrationFolder:" + soap_instance_url); 
    console.log("createSparkpostIntegrationFolder:" + ParentFolderID);

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
          "<ns1:CustomerKey>LibraryCreated - " +
          member_id +
          "</ns1:CustomerKey>" +
          "<ns1:ParentFolder>" +
          '<ns1:ModifiedDate xsi:nil="true"/>' +
          "<ns1:ID>" +
          ParentFolderID +
          "</ns1:ID>" +
          '<ns1:ObjectID xsi:nil="true"/>' +
          "</ns1:ParentFolder>" +
          "<ns1:Name>LibraryCreated - " +
          member_id +
          "</ns1:Name>" +
          "<ns1:Description>LibraryCreated- " +
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
          console.log("Headers in Creating Folder",JSON.stringify(headers));
          console.log("Create folder data:",createFolderData);

          // POST to Marketing Cloud Data Extension endpoint to load sample data in the POST body
          axios({
            method: "post",
            url: "" + soap_instance_url + "Service.asmx" + "",
            data: createFolderData,
            headers: headers,
          })
            .then((response: any) => {
              let sendresponse = {};
              console.log("Response after axios");
              console.log("Response in creating folder",response.data)

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
                  let SparkpostIntegrationsID =
                    result["soap:Envelope"]["soap:Body"][0][
                    "CreateResponse"
                    ][0]["Results"][0]["NewID"][0];
                  if (SparkpostIntegrationsID != undefined) {
                    //  this.FolderID = SparkpostIntegrationsID;
                    sendresponse = {
                     // refreshToken: refreshTokenbody,
                      statusText: true,
                      soap_instance_url: soap_instance_url,
                      member_id:member_id,
                      FolderID: SparkpostIntegrationsID,
                    };
                    resolve(sendresponse)
                    //res.status(200).send(sendresponse);
                  } else {
                    sendresponse = {
                     // refreshToken: refreshTokenbody,
                      statusText: false,
                      soap_instance_url: soap_instance_url,
                      member_id: member_id,
                      FolderID: SparkpostIntegrationsID,
                    };
                    resolve(sendresponse);
                  }
                }
              );
            })
            .catch((error: any) => {
              // error
              let errorMsg =
                "Error creating the Sparkpost Integrations folder......";
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
      // .catch((error: any) => {
      //   res
      //     .status(500)
      //     .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
      // });
  }



