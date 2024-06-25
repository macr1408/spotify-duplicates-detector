import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/api/ApiClient';
import { Playlist } from '../types/Playlist';
import { Track } from '../types/Track';
import { stringSimilarity } from 'string-similarity-js';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useAuth } from '../custom/useAuth';
import { Status } from '../types/Status';
import { TracksPair } from '../types/TracksPair';
import { TracksPairDOM } from './TracksPairDOM';

const getTracksSimilarity = (trackA: Track, trackB: Track) => {
  let nameA = trackA.name.toLowerCase().replace('original mix', '');
  let nameB = trackB.name.toLowerCase().replace('original mix', '');
  nameA = trackA.name.toLowerCase().replace('radio mix', '');
  nameB = trackB.name.toLowerCase().replace('radio mix', '');
  nameA = trackA.name.toLowerCase().replace('radio edit', '');
  nameB = trackB.name.toLowerCase().replace('radio edit', '');
  nameA = trackA.name.toLowerCase().replace('club edit', '');
  nameB = trackB.name.toLowerCase().replace('club edit', '');
  nameA = trackA.name.toLowerCase().replace('original edit', '');
  nameB = trackB.name.toLowerCase().replace('original edit', '');

  return stringSimilarity(nameA, nameB);
};

export const PlaylistPopup = ({
  playlist,
  onClose,
}: {
  playlist: Playlist;
  onClose: () => void;
}) => {
  const { token } = useAuth();
  const [open, setOpen] = useState<boolean>(true);
  const [status, setStatus] = useState<Status>('idle');
  const [tracks, setTracks] = useState<Track[]>([]);

  const modalClosed = () => {
    setOpen(false);
    onClose();
  };

  useEffect(() => {
    setStatus('loading');
    apiClient
      .getPlaylistTracks(token.accessToken, playlist.id)
      .then((tracks: Track[]): void => {
        setTracks(tracks);
        setStatus('ready');
      })
      .catch((err) => {
        setStatus('error');
        console.log(err);
      });
    setOpen(true);
  }, [playlist]);

  const duplicatedTracks = useMemo(() => {
    const possibleDuplicates: { [key: string]: TracksPair } = {};

    for (let i = 0; i < tracks.length; i++) {
      const trackA = tracks[i];
      for (let j = i + 1; j < tracks.length; j++) {
        const trackB = tracks[j];
        const tracksSimilarity = getTracksSimilarity(trackA, trackB);
        if (tracksSimilarity > 0.7) {
          possibleDuplicates[trackA.id.slice(0, 3) + trackB.id.slice(3, 6)] = {
            trackA,
            trackB,
            similarity:
              tracksSimilarity === 1 && trackA.artist !== trackB.artist ? 0.99 : tracksSimilarity, // Tracks with same name but different artists aren't necessarily duplicated
          };
        }
      }
    }

    return Object.values(possibleDuplicates);
  }, [tracks]);

  let content: JSX.Element | null = null;
  switch (status) {
    case 'idle':
    case 'loading':
      content = <h3 className="text-xl font-bold text-center text-white">Loading... 🔎</h3>;
      break;

    case 'ready':
      if (!duplicatedTracks.length) {
        content = (
          <h3 className="text-alt text-xl font-bold text-center">
            We found no duplicates within your playlist 🎉
          </h3>
        );
      } else {
        content = <TracksPairDOM pairs={duplicatedTracks} />;
      }
      break;

    case 'error':
      content = (
        <p className="text-center text-xl text-red-600 font-bold">
          There was an error retrieving tracks :(
        </p>
      );
      break;

    default:
      break;
  }

  return (
    <Dialog className="relative z-10" open={open} onClose={modalClosed}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-gray-600 p-6">
              <h2 className="text-3xl font-bold">
                {playlist.name}{' '}
                <span className="text-lg italic">
                  {duplicatedTracks.length
                    ? `(${duplicatedTracks.length} Possible duplicates found)`
                    : ''}
                </span>
              </h2>
              <hr className="mb-10" />
              <div>{content}</div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
