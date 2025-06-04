
"use client";

import type { Song } from '@/types';
import type React from 'react';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface PlayerContextType {
  nowPlayingSong: Song | null;
  setNowPlayingSong: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [nowPlayingSong, setNowPlayingSongState] = useState<Song | null>(null);
  const [isPlaying, setIsPlayingState] = useState<boolean>(false);

  const setNowPlayingSong = useCallback((song: Song | null) => {
    setNowPlayingSongState(song);
    if (song) {
      setIsPlayingState(true); // Autoplay when a new song is set
    } else {
      setIsPlayingState(false);
    }
  }, []);

  const playSong = useCallback((song: Song) => {
    setNowPlayingSongState(song);
    setIsPlayingState(true);
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    if (!nowPlayingSong && playing) return; // Don't set to playing if no song
    setIsPlayingState(playing);
  }, [nowPlayingSong]);

  const togglePlayPause = useCallback(() => {
    if (!nowPlayingSong) return;
    setIsPlayingState(prevIsPlaying => !prevIsPlaying);
  }, [nowPlayingSong]);

  return (
    <PlayerContext.Provider value={{ nowPlayingSong, setNowPlayingSong, isPlaying, setIsPlaying, playSong, togglePlayPause }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};
