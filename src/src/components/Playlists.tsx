import { Playlist } from '../types/Playlist';

export const Playlists = ({
  playlists,
  onClick,
}: {
  playlists: Playlist[];
  onClick: (playlist: Playlist) => void;
}) => {
  return (
    <div className="flex flex-wrap">
      {playlists.map((playlist: Playlist): JSX.Element => {
        return (
          <div
            key={playlist.id}
            className="p-4 w-[200px] bg-gray-800 m-4 shadow-xl rounded-lg cursor-pointer"
            onClick={() => onClick(playlist)}
          >
            <p className="text-center text-xl mb-2 min-h-14">{playlist.name}</p>
            <img className="rounded-lg" src={playlist.image} alt={playlist.name} />
          </div>
        );
      })}
    </div>
  );
};
