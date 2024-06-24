import { ReactNode, useState } from 'react';
import { AuthContext } from './AuthContext';
import { AccessToken, emptyAccessToken } from '../types/AccessToken';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => {
    const expiresIn = localStorage.getItem('spotify_expires_in');
    const isTokenStored =
      localStorage.getItem('spotify_access_token') &&
      localStorage.getItem('spotify_refresh_token') &&
      expiresIn !== null;

    if (!isTokenStored) {
      return emptyAccessToken;
    }

    return {
      accessToken: localStorage.getItem('spotify_access_token'),
      refreshToken: localStorage.getItem('spotify_refresh_token'),
      expiresIn: new Date(expiresIn),
    } as AccessToken;
  });

  const storeLocalToken = (token: AccessToken): void => {
    localStorage.setItem('spotify_access_token', token.accessToken);
    localStorage.setItem('spotify_refresh_token', token.refreshToken);
    localStorage.setItem('spotify_expires_in', token.expiresIn.toISOString());

    setToken(token);
  };

  const removeToken = (): void => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_expires_in');

    setToken(emptyAccessToken);
  };

  return (
    <AuthContext.Provider value={{ token, setToken: storeLocalToken, removeToken }}>
      {children}
    </AuthContext.Provider>
  );
}
