import { useCallback, useEffect, useRef } from 'react';
import { moviesApi } from '@/lib/api/movies';
import { useAuth } from './useAuth';

interface UseWatchProgressProps {
  movieId?: number;
  episodeId?: number | null;
  initialProgressSeconds?: number;
}

export function useWatchProgress({
  movieId,
  episodeId,
}: UseWatchProgressProps) {
  const { isAuthenticated } = useAuth();
  const lastSavedRef = useRef<{
    movieId: number;
    episodeId?: number | null;
    seconds: number;
    duration: number;
    completed: boolean;
    timestamp: number;
  } | null>(null);

  const pendingRef = useRef<{
    movieId: number;
    episodeId?: number | null;
    seconds: number;
    duration: number;
    completed: boolean;
  } | null>(null);

  const sendProgress = useCallback(async (
    mId: number,
    epId: number | null | undefined,
    sec: number,
    dur: number,
    comp = false
  ) => {
    if (!isAuthenticated || !mId || dur <= 0) return;

    try {
      await moviesApi.saveWatchProgress({
        movieId: mId,
        episodeId: epId ?? null,
        progressSeconds: Math.floor(sec),
        durationSeconds: Math.floor(dur),
        completed: comp,
      });

      lastSavedRef.current = {
        movieId: mId,
        episodeId: epId,
        seconds: sec,
        duration: dur,
        completed: comp,
        timestamp: Date.now(),
      };
    } catch {
      // Non-blocking
    }
  }, [isAuthenticated]);

  const updateProgress = useCallback((
    currentSeconds: number,
    durationSeconds: number,
    force = false
  ) => {
    if (!movieId || durationSeconds <= 0 || !isAuthenticated) return;

    const completed = currentSeconds / durationSeconds >= 0.92;
    pendingRef.current = {
      movieId,
      episodeId,
      seconds: currentSeconds,
      duration: durationSeconds,
      completed,
    };

    const now = Date.now();
    const lastSaved = lastSavedRef.current;

    const shouldSave =
      force ||
      !lastSaved ||
      lastSaved.movieId !== movieId ||
      lastSaved.episodeId !== episodeId ||
      (!lastSaved.completed && completed) ||
      (now - lastSaved.timestamp >= 15000 && Math.abs(currentSeconds - lastSaved.seconds) >= 8);

    if (shouldSave) {
      sendProgress(movieId, episodeId, currentSeconds, durationSeconds, completed);
    }
  }, [movieId, episodeId, isAuthenticated, sendProgress]);

  useEffect(() => {
    return () => {
      const pending = pendingRef.current;
      const lastSaved = lastSavedRef.current;
      if (
        pending &&
        (!lastSaved ||
          pending.movieId !== lastSaved.movieId ||
          pending.episodeId !== lastSaved.episodeId ||
          Math.abs(pending.seconds - lastSaved.seconds) >= 5)
      ) {
        sendProgress(
          pending.movieId,
          pending.episodeId,
          pending.seconds,
          pending.duration,
          pending.completed
        );
      }
    };
  }, [sendProgress]);

  return {
    updateProgress,
  };
}
