export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || 'YOUR_AUTH0_DOMAIN',
  clientId: process.env.AUTH0_CLIENT_ID || 'YOUR_AUTH0_CLIENT_ID',
  audience: process.env.AUTH0_AUDIENCE || 'YOUR_AUTH0_AUDIENCE',
  scope: 'openid profile email offline_access',
  additionalParameters: {},
  customScheme: 'willcounter'
};