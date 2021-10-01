export default class mcGenericMethods {
    getOAuthAccessToken(clientId: any, clientSecret: any, grantType: string, code: any, redirect_uri: any): Promise<any>;
    getRefreshToken(refreshToken: string, tssd: string, clientId: any, clientSecret: any): Promise<any>;
}
