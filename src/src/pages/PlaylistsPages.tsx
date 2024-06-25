import { useEffect, useState } from 'react';
import { apiClient } from '../services/api/ApiClient';
import { Playlist } from '../types/Playlist';
import { Playlists } from '../components/Playlists';
import { PlaylistPopup } from '../components/PlaylistPopup';
import { useAuth } from '../custom/useAuth';

export type Status = 'idle' | 'loading' | 'ready' | 'error';

export const PlaylistsPages = () => {
  const { token } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const selectPlaylist = (playlist: Playlist): void => {
    setSelectedPlaylist(playlist);
    console.log('playlist selected', playlist);
  };

  useEffect(() => {
    setStatus('loading');
    apiClient
      .getPlaylists(token.accessToken)
      .then((playlists) => {
        setPlaylists(playlists);
        setStatus('ready');
      })
      .catch((err) => {
        setStatus('error');
        console.log(err);
      });
  }, [token]);

  let content: JSX.Element | null = null;
  switch (status) {
    case 'idle':
    case 'loading':
      content = <p className="text-center">Loading...</p>;
      break;

    case 'ready':
      content = <Playlists playlists={playlists} onClick={selectPlaylist} />;
      break;

    case 'error':
      content = (
        <p className="text-center text-red-600 font-bold">
          There was an error retrieving playlists :(
        </p>
      );
      break;

    default:
      break;
  }

  return (
    <>
      <h2 className="text-center text-4xl mt-4 mb-8">Available playlists</h2>
      {content}
      {selectedPlaylist && <PlaylistPopup playlist={selectedPlaylist} />}
    </>
  );
};
