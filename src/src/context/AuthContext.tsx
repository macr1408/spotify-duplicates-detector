import { createContext } from 'react';
import { AccessToken, emptyAccessToken } from '../types/AccessToken';

export const AuthContext = createContext<{
  token: AccessToken;
  setToken: (token: AccessToken) => void;
  removeToken: () => void;
}>({
  token: emptyAccessToken,
  setToken: (token: AccessToken): void => {},
  removeToken: () => {},
});
