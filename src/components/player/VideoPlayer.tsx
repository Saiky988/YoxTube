import React, { useState, useEffect, useRef } from 'react';
import { VideoSource } from '@/types/movie';
import { useWatchProgress } from '@/hooks/useWatchProgress';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VideoPlayerProps {
  source?: VideoSource | null;
  movieId: number;
  episodeId?: number | null;
  title: string;
  initialSeconds?: number;
  durationEstimateSeconds?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  source,
  movieId,
  episodeId,
  title,
  initialSeconds = 0,
  durationEstimateSeconds = 2700,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const elapsedSecondsRef = useRef(initialSeconds);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { updateProgress } = useWatchProgress({
    movieId,
    episodeId,
    initialProgressSeconds: initialSeconds,
  });

  const isDirectVideo =
    source?.videoUrl?.endsWith('.mp4') ||
    source?.videoUrl?.endsWith('.webm') ||
    source?.sourceType === 'mp4';

  useEffect(() => {
    if (!source?.videoUrl || isDirectVideo) return;

    setIsLoading(true);
    setHasError(false);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        elapsedSecondsRef.current += 5;
        updateProgress(elapsedSecondsRef.current, durationEstimateSeconds);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [source?.videoUrl, isDirectVideo, durationEstimateSeconds, updateProgress]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || durationEstimateSeconds;
      elapsedSecondsRef.current = current;
      updateProgress(current, duration);
    }
  };

  const handleVideoEnded = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration || durationEstimateSeconds;
      updateProgress(duration, duration, true);
    }
  };

  if (!source?.videoUrl) {
    return (
      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-surface-border flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-3" />
        <h3 className="text-base font-semibold text-white">Chưa có nguồn phát cho tập này</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-md">
          Hệ thống đang cập nhật nguồn phát video cho phim. Bạn vui lòng chọn server hoặc tập khác.
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-surface-border shadow-2xl">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none">
          <Loader2 className="w-10 h-10 animate-spin text-brand-accent mb-2" />
          <span className="text-xs font-medium text-gray-300">Đang tải nguồn phát...</span>
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h3 className="text-base font-semibold text-white">Không thể tải luồng phát video</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4 max-w-md">
            Đã có sự cố kết nối với máy chủ nguồn phát. Vui lòng thử chọn server khác.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
          >
            Thử tải lại
          </Button>
        </div>
      ) : isDirectVideo ? (
        <video
          ref={videoRef}
          src={source.videoUrl}
          controls
          autoPlay
          playsInline
          onLoadedData={() => {
            setIsLoading(false);
            if (initialSeconds > 0 && videoRef.current) {
              videoRef.current.currentTime = initialSeconds;
            }
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          className="w-full h-full object-contain"
        />
      ) : (
        <iframe
          src={source.videoUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="w-full h-full border-0"
        />
      )}
    </div>
  );
};
