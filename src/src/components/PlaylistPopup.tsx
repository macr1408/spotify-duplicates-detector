import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/api/ApiClient';
import { Playlist } from '../types/Playlist';
import { Track } from '../types/Track';
import { stringSimilarity } from 'string-similarity-js';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import linkIcon from '../../public/link.svg';
import { useAuth } from '../custom/useAuth';

type TracksPair = {
  trackA: Track;
  trackB: Track;
  similarity: number;
};

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

export const PlaylistPopup = ({ playlist }: { playlist: Playlist }) => {
  const { token } = useAuth();
  const [open, setOpen] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    apiClient.getPlaylistTracks(token.accessToken, playlist.id).then((tracks: Track[]): void => {
      setTracks(tracks);
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

  return (
    <Dialog className="relative z-10" open={open} onClose={setOpen}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg  text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
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
              <div>
                {duplicatedTracks.length === 0 ? (
                  <h3 className="text-alt text-xl font-bold text-center">
                    We found no duplicates within your playlist 🎉
                  </h3>
                ) : (
                  duplicatedTracks.map((pair: TracksPair) => (
                    <div
                      key={pair.trackA.id + pair.trackB.id}
                      className="p-2 mb-4 rounded-lg even:bg-gray-500 odd:bg-gray-900"
                    >
                      <p className="font-bold">
                        {pair.trackA.name}
                        <a href={pair.trackA.url} target="_blank" rel="noopener noreferrer">
                          <div
                            className="inline-block relative w-[20px] h-[20px] top-[6px] left-[5px]"
                            style={{ background: `url("${linkIcon}")` }}
                          ></div>
                        </a>
                      </p>
                      <p className="italic">{pair.trackA.artist}</p>
                      <p className="font-bold">
                        {pair.trackB.name}{' '}
                        <a href={pair.trackB.url} target="_blank" rel="noopener noreferrer">
                          <div
                            className="inline-block relative w-[20px] h-[20px] top-[6px] left-[5px]"
                            style={{ background: `url("${linkIcon}")` }}
                          ></div>
                        </a>
                      </p>
                      <p className="italic">{pair.trackB.artist}</p>
                      <p className="text-alt mt-2 font-bold">
                        Similarity: {(pair.similarity * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
