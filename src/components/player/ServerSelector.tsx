import React from 'react';
import { MovieServer } from '@/types/movie';
import { getCleanServerName } from '@/lib/utils/formatters';
import { Server } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ServerSelectorProps {
  servers: MovieServer[];
  activeServerId?: number;
  onSelectServer: (server: MovieServer) => void;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  servers,
  activeServerId,
  onSelectServer,
}) => {
  if (!servers || servers.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
        <Server className="w-4 h-4 text-brand-accent" />
        <span>Chọn máy chủ (Server):</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {servers.map((server) => {
          const isActive = server.id === activeServerId;
          const cleanName = getCleanServerName(server.name) || `Server #${server.id}`;

          return (
            <button
              key={server.id}
              onClick={() => onSelectServer(server)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all select-none border',
                isActive
                  ? 'bg-brand-accent text-white border-brand-accent shadow-sm'
                  : 'bg-surface-subtle text-gray-300 border-surface-border hover:bg-surface-hover hover:text-white'
              )}
            >
              {cleanName}
            </button>
          );
        })}
      </div>
    </div>
  );
};
