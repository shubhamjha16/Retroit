
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
  
  // Effect for showing tape load animation on song change
  useEffect(() => {
    if (song && song.id !== prevSongId) {
      if (prevSongId !== null) { // Only show animation if it's not the very first song
        setShowLoadAnimation(true);
        const animationTimer = setTimeout(() => setShowLoadAnimation(false), 1500);
        return () => clearTimeout(animationTimer);
      }
      setPrevSongId(song.id);
    }
  }, [song, prevSongId]);

  // Effect for loading song, setting src, and managing object URL
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let currentObjectUrl: string | null = null;

    if (song) {
      if (song.file) {
        currentObjectUrl = URL.createObjectURL(song.file);
        audio.src = currentObjectUrl;
      } else if (song.path) {
        audio.src = song.path;
      } else {
        audio.removeAttribute('src');
        return; // No playable source
      }
      
      audio.load(); // Load the new source
      setProgressValue(0);
      setCurrentTime("0:00");
      setDuration("0:00");
      // Autoplay if isPlaying is already true from context (e.g. new song selected while playing)
      // The actual audio.play() will be handled by the isPlaying effect.
    } else {
      audio.removeAttribute('src');
      setProgressValue(0);
      setCurrentTime("0:00");
      setDuration("0:00");
    }

    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [song, audioRef]); // Only re-run when the song object itself changes

  // Effect for controlling play/pause based on `isPlaying` from context
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song) return; // No audio element or no song to act upon

    if (isPlaying) {
      if (audio.src || audio.currentSrc) { // Ensure src is set before playing
         audio.play().catch(e => console.error("Error in play() from isPlaying effect:", e));
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, song, audioRef]); // Re-run if isPlaying, song, or audioRef changes

  // Effect for audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioPlay = () => {
      if (!isPlaying) setIsPlaying(true); // Sync context if audio plays (e.g. from autoplay attribute)
    };
    const handleAudioPause = () => {
      if (isPlaying) setIsPlaying(false); // Sync context if audio pauses (e.g. ended, or external pause)
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
      } else if (audio.currentTime === 0) {
        setProgressValue(0);
        setCurrentTime("0:00");
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false); // Update context: song has ended
      // Optionally, reset progress or move to next song here
      setProgressValue(100); 
      // setCurrentTime(duration); // Or keep it at the end
    };

    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    // If audio source is set and metadata hasn't loaded (e.g. duration is "0:00"),
    // and audio is ready enough, manually trigger metadata update.
    // This can help if loadedmetadata event was missed or delayed.
    if (audio.src && audio.readyState >= HTMLMediaElement.HAVE_METADATA && duration === "0:00") {
        handleLoadedMetadata();
    }
    if (audio.src && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && currentTime === "0:00" && progressValue === 0) {
        handleTimeUpdate();
    }


    return () => {
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, song, isPlaying, setIsPlaying, duration, currentTime, progressValue]); // Dependencies for event listeners


  const handleMainPlayPauseClick = () => {
    if (!song) return;
    
    const audio = audioRef.current;
    // If song has ended and user clicks play, restart it.
    if (audio && audio.ended && !isPlaying) { 
      audio.currentTime = 0; 
      // togglePlayPause will set isPlaying to true, triggering the effect to play
    }
    togglePlayPause(); // This will update isPlaying in context, and the effect will handle play/pause
  };

  const toggleMaximizePlayer = () => setIsMaximized(!isMaximized);

  if (!song) return null; // Don't render player if no song

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
