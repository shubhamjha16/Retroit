
"use client";

import type { Song } from '@/types';
import Image from 'next/image';
import { Play as PlayIcon, Pause as PauseIcon, SkipForward, SkipBack, Shuffle, Repeat, Maximize2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { TapeLoadAnimation } from './TapeLoadAnimation';
import { usePlayerContext } from '@/contexts/PlayerContext';

interface NowPlayingBarProps {
  song: Song;
}

const SpinningReel = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={cn("w-5 h-5 animate-spin-reels", className)} style={{ animationDuration: '2s' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

export default function NowPlayingBar({ song }: NowPlayingBarProps) {
  const { isPlaying, setIsPlaying, togglePlayPause } = usePlayerContext();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [progressValue, setProgressValue] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isMaximized, setIsMaximized] = useState(false);
  const [showLoadAnimation, setShowLoadAnimation] = useState(false);
  const [prevSongId, setPrevSongId] = useState<string | null>(null);
  
  // Tape animation effect
  useEffect(() => {
    if (song && song.id !== prevSongId) {
      if (prevSongId !== null) { 
        setShowLoadAnimation(true);
        const animationTimer = setTimeout(() => setShowLoadAnimation(false), 1500);
        return () => clearTimeout(animationTimer);
      }
      setPrevSongId(song.id);
    }
  }, [song, prevSongId]);

  // Effect 1: Manage song source changes, loading, and initial autoplay setup.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let objectUrlToRevokeOnCleanup: string | null = null;

    if (song) {
      let newSrc = "";
      if (song.file) {
        newSrc = URL.createObjectURL(song.file);
        objectUrlToRevokeOnCleanup = newSrc;
      } else if (song.path) {
        newSrc = song.path;
      }

      // Only update src and load if it's genuinely a new song or src
      if (audio.src !== newSrc) {
        setProgressValue(0);
        setCurrentTime("0:00");
        setDuration("0:00");
        audio.src = newSrc;
        audio.load(); // Load the new source

        // If context expects this new song to be playing, set up autoplay via 'canplaythrough'
        if (isPlaying && audio.paused) { // `isPlaying` from context is true
          const playWhenReady = () => {
            // Ensure still relevant (song hasn't changed, context still wants play)
            if (audioRef.current && audioRef.current.src === newSrc && isPlaying) {
              audioRef.current.play().catch(e => {
                if (e.name !== 'AbortError') {
                  console.error("Autoplay failed for new song:", e);
                  setIsPlaying(false); // Sync context if autoplay fails
                }
              });
            }
          };
          audio.addEventListener('canplaythrough', playWhenReady, { once: true });
        }
      }
    } else { // No song, clear everything
      if (audio.src) {
        audio.pause();
        audio.removeAttribute('src');
      }
      if (isPlaying) setIsPlaying(false); // Sync context
      setProgressValue(0);
      setCurrentTime("0:00");
      setDuration("0:00");
    }

    return () => {
      if (objectUrlToRevokeOnCleanup) {
        URL.revokeObjectURL(objectUrlToRevokeOnCleanup);
      }
      // 'canplaythrough' with {once: true} self-removes.
    };
  }, [song, audioRef, setIsPlaying]); // isPlaying is intentionally removed here; autoplay logic is handled internally.
                                   // setIsPlaying is stable.

  // Effect 2: Handle play/pause commands based on `isPlaying` from context.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song || !audio.src) return; // No song or audio element not ready with a source

    if (isPlaying) {
      // If context wants to play, audio is paused, and audio has enough data
      if (audio.paused && audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.error("Error in play() from isPlaying effect:", error);
              setIsPlaying(false); // If play fails, update context
            }
          });
        }
      }
    } else {
      // If context wants to pause, and audio is not paused
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying, song, audioRef, setIsPlaying]); // `song` dependency ensures this re-evaluates if a new song is loaded and isPlaying might be true.


  // Effect 3: Audio event listeners for UI updates and context syncing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioPlay = () => {
      if (!isPlaying) setIsPlaying(true); 
    };
    const handleAudioPause = () => {
      if (isPlaying && !audio.ended) setIsPlaying(false); 
    };
    const handleLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        const audioDuration = audio.duration;
        const minutes = Math.floor(audioDuration / 60);
        const seconds = Math.floor(audioDuration % 60);
        setDuration(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      } else {
        setDuration("0:00");
      }
    };
    const handleTimeUpdate = () => {
      if (audio.currentTime && audio.duration && Number.isFinite(audio.currentTime) && Number.isFinite(audio.duration) && audio.duration > 0) {
        const audioCurrentTime = audio.currentTime;
        const audioDuration = audio.duration;
        setProgressValue((audioCurrentTime / audioDuration) * 100);
        const currentMinutes = Math.floor(audioCurrentTime / 60);
        const currentSeconds = Math.floor(audioCurrentTime % 60);
        setCurrentTime(`${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`);
      } else if (audio.currentTime === 0 && audio.src) { // Reset if currentTime is 0 but src is present
        setProgressValue(0);
        setCurrentTime("0:00");
      }
    };
    const handleEnded = () => {
      setIsPlaying(false); 
      setProgressValue(100); 
      // Potentially add logic for auto-advancing to next song here
    };

    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    // Initial UI update if audio is already loaded (e.g. component re-mount with existing src)
    if (audio.src && audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        handleLoadedMetadata();
    }
    if (audio.src && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        handleTimeUpdate();
    }

    return () => {
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, isPlaying, setIsPlaying]); // song removed here, as src specific updates are handled by Effect 1.
                                           // isPlaying and setIsPlaying are for context sync.

  const handleMainPlayPauseClick = useCallback(() => {
    if (!song) return;
    
    const audio = audioRef.current;
    if (audio && audio.ended && !isPlaying) { 
      // If song ended and user clicks play, restart from beginning
      audio.currentTime = 0; 
      setProgressValue(0);
      setCurrentTime("0:00");
    }
    togglePlayPause(); 
  }, [song, isPlaying, togglePlayPause, audioRef]);

  const toggleMaximizePlayer = () => setIsMaximized(!isMaximized);

  if (!song) return null;

  if (isMaximized) {
    return (
      <div className="fixed inset-0 bg-background z-[100] p-4 flex flex-col items-center justify-center text-foreground">
        {showLoadAnimation && <TapeLoadAnimation />}
        <Button variant="ghost" size="icon" onClick={toggleMaximizePlayer} className="absolute top-4 right-4 text-primary hover:text-primary/80">
          <Maximize2 className="rotate-180" />
        </Button>
        <Image src={song.albumArtUrl} alt={song.album} width={300} height={300} className="rounded-lg shadow-2xl shadow-primary/30 mb-8" data-ai-hint={song.dataAiHint || 'album cover'} />
        <h2 className="text-3xl font-headline neon-text-primary mb-2 text-center">{song.title}</h2>
        <p className="text-xl text-muted-foreground mb-6 text-center">{song.artist}</p>
        
        <div className="flex items-center space-x-4 my-4">
          <SpinningReel className={cn("text-primary", !isPlaying && "opacity-50")} />
          <p className="text-lg neon-text-accent font-semibold">{isPlaying ? "TAPE IS ROLLING" : "TAPE PAUSED"}</p>
          <SpinningReel className={cn("text-primary", !isPlaying && "opacity-50")} />
        </div>
        
        <div className="w-full max-w-md my-4">
          <Progress value={progressValue} className="h-2 bg-input [&>div]:bg-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 sm:space-x-4 my-4 w-full max-w-md">
          <Button variant="ghost" size="icon"><Shuffle className="text-primary w-5 h-5 sm:w-6 sm:h-6" /></Button>
          <Button variant="ghost" size="icon"><SkipBack className="text-primary w-6 h-6 sm:w-7 sm:h-7" /></Button>
          <Button variant="primary" size="lg" onClick={handleMainPlayPauseClick} className="rounded-full w-16 h-16 sm:w-20 sm:h-20">
            {isPlaying ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
          </Button>
          <Button variant="ghost" size="icon"><SkipForward className="text-primary w-6 h-6 sm:w-7 sm:h-7" /></Button>
          <Button variant="ghost" size="icon"><Repeat className="text-primary w-5 h-5 sm:w-6 sm:h-6" /></Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <audio ref={audioRef} />
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-primary/30 p-3 shadow-t-lg z-40">
        <div className="container mx-auto flex items-center justify-between max-w-md">
          <div className="flex items-center space-x-3 overflow-hidden flex-1 min-w-0">
            <Image src={song.albumArtUrl} alt={song.album} width={48} height={48} className="rounded shadow-md flex-shrink-0" data-ai-hint={song.dataAiHint || 'album cover'} />
            <div className="truncate flex-1">
              <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
              <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
            <Button variant="ghost" size="icon" onClick={handleMainPlayPauseClick} className="text-primary hover:text-primary/80">
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hidden sm:inline-flex">
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMaximizePlayer} className="text-muted-foreground hover:text-foreground">
               <Maximize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <Progress value={progressValue} className="w-full h-1 bg-input absolute bottom-0 left-0 right-0 rounded-none [&>div]:bg-primary" />
      </div>
    </>
  );
}
