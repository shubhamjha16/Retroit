
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
  song: Song; // Song is now guaranteed by AppShell
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
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    // Song change effect
    if (song && song.id !== prevSongId) {
      if (prevSongId !== null) {
        setShowLoadAnimation(true);
        const animationTimer = setTimeout(() => setShowLoadAnimation(false), 1500);
        return () => clearTimeout(animationTimer);
      }
      setPrevSongId(song.id);
    }
  }, [song, prevSongId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song) return;

    // Clean up previous object URL
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null); // Important to set to null so it can be re-created
    }
    
    let newObjectUrlCreated: string | null = null;
    if (song.file) {
      newObjectUrlCreated = URL.createObjectURL(song.file);
      setObjectUrl(newObjectUrlCreated);
      audio.src = newObjectUrlCreated;
    } else if (song.path) {
      audio.src = song.path; 
    } else {
      return; 
    }
    
    setProgressValue(0);
    setCurrentTime("0:00");
    setDuration("0:00");

    if (isPlaying) {
      audio.play().catch(e => console.error("Error playing audio:", e));
    } else {
      audio.pause();
    }
    
    return () => {
      // Cleanup Object URL when component unmounts or song changes
      // This check is important because objectUrl state might not update immediately
      // before this cleanup runs from a rapid song change.
      if (newObjectUrlCreated) { 
        URL.revokeObjectURL(newObjectUrlCreated);
      } else if (objectUrl) { // Fallback to state if new one wasn't made in this run
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [song, isPlaying]); // isPlaying is needed here to correctly start/pause when song is set from elsewhere

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleLoadedMetadata = () => {
      const currentAudio = audioRef.current;
      if (!currentAudio || !isFinite(currentAudio.duration) || currentAudio.duration === 0) {
        setDuration("0:00");
        return;
      }
      const audioDuration = currentAudio.duration;
      const minutes = Math.floor(audioDuration / 60);
      const seconds = Math.floor(audioDuration % 60);
      setDuration(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    const handleTimeUpdate = () => {
      const currentAudio = audioRef.current;
       if (!currentAudio || !isFinite(currentAudio.currentTime) || !isFinite(currentAudio.duration) || currentAudio.duration === 0) {
        setProgressValue(0);
        setCurrentTime("0:00");
        return;
      }
      const audioCurrentTime = currentAudio.currentTime;
      const audioDuration = currentAudio.duration;
      setProgressValue((audioCurrentTime / audioDuration) * 100);
      const minutes = Math.floor(audioCurrentTime / 60);
      const seconds = Math.floor(audioCurrentTime % 60);
      setCurrentTime(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgressValue(100);
      // TODO: Implement next song logic
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    // It's also good to explicitly load metadata if src changes and element is not playing
    if(audio.src && audio.paused){
        audio.load(); // This can help trigger loadedmetadata sooner if needed
    }


    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [song, setIsPlaying]); // Key change: Depend on `song` to re-attach listeners
  
  const handleMainPlayPauseClick = () => {
    togglePlayPause(); // This comes from context and updates `isPlaying`
    const audio = audioRef.current;
    if (!audio) return;

    // The actual play/pause logic is now primarily handled by the useEffect reacting to `isPlaying` and `song`
    // However, direct interaction might still be needed for responsiveness or edge cases like re-playing an ended song.
    if (audio.paused && !isPlaying) { // If context says "play" (isPlaying will flip to true after togglePlayPause)
        audio.play().catch(e => console.error("Error playing audio:", e));
    } else if (!audio.paused && isPlaying) { // If context says "pause" (isPlaying will flip to false)
        audio.pause();
    } else if (audio.paused && progressValue >= 100) { // If song ended and user hits play
        audio.currentTime = 0;
        setProgressValue(0);
        audio.play().catch(e => console.error("Error playing audio:", e));
        if (!isPlaying) setIsPlaying(true); 
    }
  };

  const toggleMaximizePlayer = () => setIsMaximized(!isMaximized);

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

