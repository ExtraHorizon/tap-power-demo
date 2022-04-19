import { getMockSdk } from '@extrahorizon/javascript-sdk';

export const mockSdk = getMockSdk<jest.Mock>(jest.fn);

const createOAuth1Client = () => mockSdk;
// const createClient = () => mockSdk;

module.exports = {
  ...jest.requireActual('@extrahorizon/javascript-sdk'),
  createOAuth1Client,
  mockSdk,
};
