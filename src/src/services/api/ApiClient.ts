import axios from 'axios';

import { appConfig } from '../../config/appConfig';
import { Playlist } from '../../types/Playlist';
import { authApiClient } from './authApiClient';
import { Track } from '../../types/Track';

type ArtistResponse = {
  name: string;
};

type TrackResponse = {
  track: {
    id: string;
    external_urls: {
      spotify: string;
    };
    name: string;
    artists: ArtistResponse[];
  };
};

type PlaylistWithTracksResponse = {
  tracks: {
    next: string | null;
    total: number;
    items: TrackResponse[];
  };
};

type PlaylistResponse = {
  name: string;
  id: string;
  images: {
    url: string;
  }[];
};
type PlaylistsResponse = {
  next: string | undefined;
  items: PlaylistResponse[];
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

    let response = await client.get<PlaylistsResponse>('/v1/me/playlists', {
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

    return playlists.map((data: PlaylistResponse): Playlist => {
      return {
        id: data.id,
        name: data.name,
        image: data.images[0].url,
      };
    });
  },

  async getPlaylistTracks(token: string, playlistId: string): Promise<Track[]> {
    let tracks = [];
    let response = await client.get<PlaylistWithTracksResponse>(`/v1/playlists/${playlistId}`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      params: {
        fields: 'tracks(next,total,items(track(id,name,external_urls(spotify),artists(name))))',
      },
    });

    tracks = response.data.tracks.items;
    console.log(`${tracks.length} tracks retrieved`);

    // More than 200 tracks = browser crash?
    while (response.data.tracks.next && tracks.length < 200) {
      console.log(response.data.tracks);
      response = await client.get(response.data.tracks.next, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      if (!response.data.tracks) {
        break;
      }

      console.log(`${response.data.tracks.items.length} extra tracks retrieved`);
      tracks = tracks.concat(response.data.tracks.items);
    }
    console.log(`${tracks.length} total tracks retrieved`);

    return tracks.map((trackResponse: TrackResponse): Track => {
      return {
        artist: trackResponse.track.artists.map((artist: ArtistResponse) => artist.name).join(', '),
        name: trackResponse.track.name,
        url: trackResponse.track.external_urls.spotify,
        id: trackResponse.track.id,
      };
    });
  },
};
