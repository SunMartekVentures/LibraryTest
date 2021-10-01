// module.exports exports the function getContests as a promise and exposes it as a module.
// we can import an exported module by using require().
import axios, { AxiosRequestConfig } from "axios";
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
                  domainName: domainName,
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
}
