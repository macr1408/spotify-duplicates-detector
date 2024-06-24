import axios from 'axios';

import { appConfig } from '../../config/appConfig';
import { Playlist } from '../../types/Playlist';
import { authApiClient } from './authApiClient';

type PlaylistResponseItem = {
  name: string;
  id: string;
  images: {
    url: string;
  }[];
};
type PlaylistResponse = {
  next: string | undefined;
  items: PlaylistResponseItem[];
};

const client = axios.create({
  baseURL: appConfig.apiBaseUrl,
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    await authApiClient.refreshToken();

    const originalRequestConfig = error.config;
    return new Promise((resolve, reject) => {
      resolve(axios.request(originalRequestConfig));
    });
  },
);

export const apiClient = {
  async getPlaylists(token: string): Promise<Playlist[]> {
    const limit = 50;
    let playlists = [];
    let offset = 0;

    let response = await client.get<PlaylistResponse>('/v1/me/playlists', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      params: {
        limit,
        offset,
      },
    });

    playlists = response.data.items;
    console.log(`${playlists.length} playlists retrieved`);
    while (response.data.next) {
      response = await client.get(response.data.next, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
        params: {
          limit,
          offset,
        },
      });

      console.log(`${response.data.items.length} extra playlists retrieved`);
      playlists = playlists.concat(response.data.items);
    }
    console.log(`${playlists.length} total playlists retrieved`);

    return playlists.map((data: PlaylistResponseItem): Playlist => {
      return {
        id: data.id,
        name: data.name,
        image: data.images[0].url,
      };
    });
  },
};
