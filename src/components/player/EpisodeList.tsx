import React, { useState } from 'react';
import { Episode } from '@/types/movie';
import { PlayCircle, Tv } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface EpisodeListProps {
  episodes: Episode[];
  activeEpisodeId?: number;
  onSelectEpisode: (episode: Episode) => void;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  activeEpisodeId,
  onSelectEpisode,
}) => {
  const [activeChunk, setActiveChunk] = useState(0);
  const CHUNK_SIZE = 50;

  if (!episodes || episodes.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-gray-500 bg-surface rounded-xl border border-surface-border">
        Không có danh sách tập cho server này.
      </div>
    );
  }

  const hasChunks = episodes.length > CHUNK_SIZE;
  const chunkCount = Math.ceil(episodes.length / CHUNK_SIZE);
  const displayedEpisodes = hasChunks
    ? episodes.slice(activeChunk * CHUNK_SIZE, (activeChunk + 1) * CHUNK_SIZE)
    : episodes;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <Tv className="w-4 h-4 text-brand-accent" />
          <span>Danh sách tập ({episodes.length} tập):</span>
        </div>

        {hasChunks && (
          <div className="flex items-center gap-1">
            {Array.from({ length: chunkCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChunk(idx)}
                className={cn(
                  'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                  activeChunk === idx
                    ? 'bg-brand-accent text-white'
                    : 'bg-surface-subtle text-gray-400 hover:text-white'
                )}
              >
                {idx * CHUNK_SIZE + 1}-{Math.min((idx + 1) * CHUNK_SIZE, episodes.length)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[360px] overflow-y-auto pr-1">
        {displayedEpisodes.map((ep) => {
          const isActive = ep.id === activeEpisodeId;
          const label = ep.name.trim();

          return (
            <button
              key={ep.id}
              onClick={() => onSelectEpisode(ep)}
              className={cn(
                'flex items-center justify-center h-10 px-2 rounded-lg text-xs font-semibold transition-all select-none border',
                isActive
                  ? 'bg-brand-accent text-white border-brand-accent shadow-md shadow-brand-accent/20 scale-[1.02]'
                  : 'bg-surface-subtle text-gray-300 border-surface-border hover:bg-surface-hover hover:border-surface-border-hover hover:text-white'
              )}
            >
              {isActive && <PlayCircle className="w-3.5 h-3.5 mr-1 fill-current shrink-0" />}
              <span className="truncate">
                {label.length > 5 ? label : `Tập ${label}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
