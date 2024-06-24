import axios from 'axios';
import { appConfig } from '../../config/appConfig';
import { AccessToken } from '../../types/AccessToken';

const authClient = axios.create({
  baseURL: appConfig.authBaseUrl,
});

const generateCodeVerifier = (): string => {
  const length = 64;
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const sha256 = async (plain: string | undefined): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: any): string => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const authApiClient = {
  firstStep: async (): Promise<void> => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URL;

    const scope = 'user-read-private user-read-email playlist-read-private';
    const authUrl = new URL(`${appConfig.authBaseUrl}/authorize`);

    const codeVerifier = generateCodeVerifier();

    window.localStorage.setItem('spotify_code_verifier', codeVerifier);

    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    const params = {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  },

  secondStep: async (code: string): Promise<AccessToken> => {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found');
    }

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URL;

    const response = await authClient.post(
      '/api/token',
      {
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const now = new Date();
    now.setSeconds(now.getSeconds() + parseInt(response.data.expires_in));

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: now,
    };
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

    const response = await authClient.post(
      '/api/token',
      {
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const now = new Date();
    now.setSeconds(now.getSeconds() + parseInt(response.data.expires_in));

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: now,
    };
  },
};
