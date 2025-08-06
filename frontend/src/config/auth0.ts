import { AuthRequest, AuthRequestConfig } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const auth0Config = {
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN || '',
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || '',
  audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE || '',
  scope: 'openid profile email offline_access',
  additionalParameters: {},
  customScheme: 'willcounter',
  redirectUri: 'willcounter://auth0-callback',
  logoutUrl: 'willcounter://auth0-logout'
};

// Validate required Auth0 configuration
if (!auth0Config.domain || !auth0Config.clientId || !auth0Config.audience) {
  console.warn('⚠️ Auth0 configuration incomplete. Please set EXPO_PUBLIC_AUTH0_DOMAIN, EXPO_PUBLIC_AUTH0_CLIENT_ID, and EXPO_PUBLIC_AUTH0_AUDIENCE environment variables.');
}

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