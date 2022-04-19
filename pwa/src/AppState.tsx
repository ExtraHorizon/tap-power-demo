import { atom } from 'recoil';

export const loginState = atom({
  key: 'loggedIn',
  default: true,
});
