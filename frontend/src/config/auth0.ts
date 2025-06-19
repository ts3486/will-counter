import { AuthRequest, AuthRequestConfig } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const auth0Config = {
  domain: 'dev-fetoxen063fxtlxz.jp.auth0.com',
  clientId: 'kya3eUM1e3lltlIO7IRDtu98HJ7ElSvH',
  audience: 'https://dev-fetoxen063fxtlxz.jp.auth0.com/api/v2/',
  scope: 'openid profile email offline_access',
  additionalParameters: {},
  customScheme: 'willcounter',
  redirectUri: 'willcounter://auth0-callback',
  logoutUrl: 'willcounter://auth0-logout'
};

export const authEndpoints = {
  authorizationEndpoint: `https://${auth0Config.domain}/oauth/authorize`,
  tokenEndpoint: `https://${auth0Config.domain}/oauth/token`,
  revocationEndpoint: `https://${auth0Config.domain}/oauth/revoke`,
  userInfoEndpoint: `https://${auth0Config.domain}/userinfo`,
  logoutUrl: `https://${auth0Config.domain}/v2/logout`
};

export const createAuthRequest = (): AuthRequestConfig => ({
  clientId: auth0Config.clientId,
  scopes: auth0Config.scope.split(' '),
  redirectUri: auth0Config.redirectUri,
});