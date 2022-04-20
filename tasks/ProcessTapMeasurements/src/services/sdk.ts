import { createClient } from '@extrahorizon/javascript-sdk';
import { apiConfig } from '../config';

export const sdk = createClient({
  host: apiConfig.host,
  consumerKey: apiConfig.oauthConsumer.key,
  consumerSecret: apiConfig.oauthConsumer.secret,
});

export async function authenticateSDK() {
  await sdk.auth.authenticate({
    token: apiConfig.oauthToken.key,
    tokenSecret: apiConfig.oauthToken.secret,
  });
}