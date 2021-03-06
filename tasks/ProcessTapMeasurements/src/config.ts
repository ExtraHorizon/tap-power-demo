import * as dotenvSafe from 'dotenv-safe';

dotenvSafe.config();

export const apiConfig: ApiConfig = {
  host: process.env.API_HOST,
  oauthConsumer: {
    key: process.env.API_OAUTH_CONSUMER_KEY,
    secret: process.env.API_OAUTH_CONSUMER_SECRET,
  },
  oauthToken: {
    key: process.env.API_OAUTH_TOKEN,
    secret: process.env.API_OAUTH_TOKEN_SECRET,
  },
};

interface ApiConfig {
  host: string,
  oauthConsumer: {
    key: string,
    secret: string,
  },
  oauthToken: {
    key: string,
    secret: string,
  }
}