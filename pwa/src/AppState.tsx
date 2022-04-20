import { atom } from 'recoil';

export const loginState = atom({
  key: 'loggedIn',
  default: true,
});

export const needRegistration = atom({
  key: 'needRegistration',
  default: false,
});
