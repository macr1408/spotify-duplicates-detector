import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../services/api/ApiClient';
import { Playlist } from '../types/Playlist';
import { Playlists } from '../components/Playlists';

export type Status = 'idle' | 'loading' | 'ready' | 'error';

export const PlaylistsPages = () => {
  const { token } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [status, setStatus] = useState<Status>('idle');

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
      content = <Playlists playlists={playlists} />;
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
    </>
  );
};
