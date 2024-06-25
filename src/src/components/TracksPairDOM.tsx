import linkIcon from '../../public/link.svg';
import { TracksPair } from '../types/TracksPair';

export const TracksPairDOM = ({ pairs }: { pairs: TracksPair[] }) => {
  return pairs.map((pair: TracksPair) => (
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
      <p className="text-alt mt-2 font-bold">Similarity: {(pair.similarity * 100).toFixed(0)}%</p>
    </div>
  ));
};
