'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("./Generic-method/src/");
class SfmcApiHelper {
    constructor() {
        // Instance variables
        this.client_id = "";
        this.client_secret = "";
        // private _accessToken = "";
        this.genericMethods = new src_1.default();
        this.oauthAccessToken = "";
        this.member_id = "514018007";
        this.soap_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.soap.marketingcloudapis.com/";
        this._deExternalKey = "DF20Demo";
        this._sfmcDataExtensionApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";
        this.refreshToken = "";
    }
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
    getOAuthAccessToken(clientId, clientSecret, req, res) {
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
    getOAuthTokenHelper(headers, postBody, res, tssd) {
        this.genericMethods
            .getOAuthAccessToken(postBody.client_id, postBody.client_secret, postBody.grant_type, postBody.code, postBody.redirect_uri)
            .then((res) => {
            console.log("AccessToken Method from library", res.data.refresh_token);
            this.refreshToken = res.data.refresh_token;
            console.log("AccessToken Method  library", res);
            if (res.data.refresh_token) {
                console.log("Refresh token", this.refreshToken, "Refresh token from response", res.data.refresh_token);
                this.genericMethods
                    .getRefreshToken(this.refreshToken, process.env.BASE_URL, postBody.client_id, postBody.client_secret)
                    .then((response) => {
                    console.log("Respo in refresh token generic method:", response);
                    const paramData = {
                        senderProfileID: "76441b26-df1a-ec11-a30a-48df373429c9",
                        oauthToken: response.oauthToken,
                        soapInstance: this.soap_instance_url,
                        data: response.data
                    };
                    //res.status(200).send(paramData)
                    this.genericMethods
                        .getSenderDomain(paramData)
                        .then((response) => {
                        console.log("Sender Domain Response ::: " + JSON.stringify(response));
                    })
                        .catch((err) => {
                        console.error("error getting Sender Domain from library" + err);
                    });
                    console.log("Refresh token Method from library", response.refreshToken);
                })
                    .catch((err) => {
                    console.error("error getting refresh token from library" + err);
                });
            }
        })
            .catch((err) => {
            console.error("error getting access token from library" + err);
        });
        return;
        // return new Promise<any>((resolve, reject) => {
        //   console.log("author" + JSON.stringify(postBody.code));
        //   console.log("headers", headers);
        //   let sfmcAuthServiceApiUrl =
        //     "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/v2/token";
        //   // this.isAccessToken = true;
        //   console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
        //   axios
        //     .post(sfmcAuthServiceApiUrl, postBody, { headers: headers })
        //     .then((response: any) => {
        //       let refreshToken = response.data.refresh_token;
        //       this.getRefreshTokenHelper(refreshToken, tssd, true, res);
        //     })
        //     .catch((error: any) => {
        //       // error
        //       let errorMsg = "Error getting OAuth Access Token.";
        //       errorMsg += "\nMessage: " + error.message;
        //       errorMsg +=
        //         "\nStatus: " + error.response ? error.response.status : "<None>";
        //       errorMsg +=
        //         "\nResponse data: " + error.response
        //           ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
        //           : "<None>";
        //       Utils.logError(errorMsg);
        //       reject(errorMsg);
        //     });
        // });
    }
}
exports.default = SfmcApiHelper;
//# sourceMappingURL=SfmcApiHelper.js.map