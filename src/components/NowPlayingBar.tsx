
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
  const [prevSongIdForAnimation, setPrevSongIdForAnimation] = useState<string | null>(null);
  
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentObjectUrl, setCurrentObjectUrl] = useState<string | null>(null);

  // Tape animation effect (visual only)
  useEffect(() => {
    if (song && song.id !== prevSongIdForAnimation) {
      if (prevSongIdForAnimation !== null) { 
        setShowLoadAnimation(true);
        const animationTimer = setTimeout(() => setShowLoadAnimation(false), 1500);
        return () => clearTimeout(animationTimer);
      }
      setPrevSongIdForAnimation(song.id);
    }
  }, [song, prevSongIdForAnimation]);

  // Effect 1: Manage song source changes, loading new src
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Cleanup previous object URL if song ID changes or song becomes null
    if (currentObjectUrl && (!song || audio.dataset.currentSongId !== song?.id)) {
        URL.revokeObjectURL(currentObjectUrl);
        setCurrentObjectUrl(null);
    }

    if (song) {
        let newSrcCandidate = "";
        let newObjectUrlToSet: string | null = null;

        if (song.file) {
            // Only create a new object URL if the song ID has changed,
            // or if the current audio src is not a blob URL (e.g. switched from path to file)
            if (audio.dataset.currentSongId !== song.id || !audio.src.startsWith('blob:')) {
                newObjectUrlToSet = URL.createObjectURL(song.file);
                newSrcCandidate = newObjectUrlToSet;
            } else {
                newSrcCandidate = audio.src; // Keep current blob if song.id is the same
            }
        } else if (song.path) {
            newSrcCandidate = song.path;
        }
        
        // Check if the source or the song ID actually needs updating
        if (audio.src !== newSrcCandidate || audio.dataset.currentSongId !== song.id) {
            setIsLoadingAudio(true);
            audio.src = newSrcCandidate;
            audio.dataset.currentSongId = song.id; // Mark element with current song ID
            if (newObjectUrlToSet) {
                setCurrentObjectUrl(newObjectUrlToSet);
            } else if (song.path && currentObjectUrl) { 
                // Switched from file to path, ensure old object URL is cleared if it was for a file
                setCurrentObjectUrl(null); 
            }

            setProgressValue(0);
            setCurrentTime("0:00");
            setDuration("0:00");
            audio.load(); // Critical: load the new source
        }
    } else { // No song
        if (audio.src) {
            audio.pause();
            if (audio.src.startsWith('blob:')) { // Revoke if it was a blob URL
                 URL.revokeObjectURL(audio.src);
            }
            audio.removeAttribute('src');
            delete audio.dataset.currentSongId;
            audio.load(); // Reflect removal of src
        }
        setCurrentObjectUrl(null);
        setIsLoadingAudio(false);
        if (isPlaying) setIsPlaying(false); // Sync context
        setProgressValue(0);
        setCurrentTime("0:00");
        setDuration("0:00");
    }
  }, [song?.id]); // Depend only on song.id for source changes


  // Effect 2: Handle play/pause commands based on `isPlaying` from context, only if not loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song || isLoadingAudio || !audio.src || audio.dataset.currentSongId !== song.id) {
        // If context wants to play but we are loading or no song, reflect this
        if (isPlaying && (!song || isLoadingAudio || audio.dataset.currentSongId !== song.id)) {
            // Consider if setIsPlaying(false) is too aggressive here, might fight with autoplay logic
        }
        return;
    }
    
    if (isPlaying) {
      if (audio.paused && audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.error("Error in play() from isPlaying effect:", error);
              setIsPlaying(false); 
            }
          });
        }
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying, song?.id, isLoadingAudio, audioRef, setIsPlaying]);


  // Effect 3: Audio event listeners for UI updates and context syncing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioPlay = () => {
      if (!isPlaying) setIsPlaying(true); 
    };
    const handleAudioPause = () => {
      // Only set isPlaying to false if pause wasn't due to song ending or loading new one
      if (isPlaying && !audio.ended && !isLoadingAudio) setIsPlaying(false); 
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
      // Metadata loaded might mean it's ready enough for some definitions of "not loading"
      // but canplaythrough is more robust for actual playback readiness.
      // setIsLoadingAudio(false); // Let canplaythrough handle this for playback readiness
    };
    const handleTimeUpdate = () => {
      if (audio.currentTime && audio.duration && Number.isFinite(audio.currentTime) && Number.isFinite(audio.duration) && audio.duration > 0) {
        const audioCurrentTime = audio.currentTime;
        const audioDuration = audio.duration;
        setProgressValue((audioCurrentTime / audioDuration) * 100);
        const currentMinutes = Math.floor(audioCurrentTime / 60);
        const currentSeconds = Math.floor(audioCurrentTime % 60);
        setCurrentTime(`${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`);
      } else if (audio.currentTime === 0 && audio.src) { 
        setProgressValue(0);
        setCurrentTime("0:00");
      }
    };
    const handleEnded = () => {
      setIsPlaying(false); 
      setProgressValue(100); 
      // Potentially add logic for auto-advancing to next song here
    };
    const handleCanPlayThrough = () => {
        setIsLoadingAudio(false);
        // If context expects play, and it's currently paused (e.g. after load), try to play.
        if (isPlaying && audio.paused && audio.dataset.currentSongId === song?.id) {
             audio.play().catch(e => {
                if (e.name !== 'AbortError') {
                    console.error("Autoplay on canplaythrough failed:", e);
                    setIsPlaying(false);
                }
            });
        }
    };
    const handleError = (e: Event) => {
        console.error('Audio Error Event:', audio.error);
        setIsLoadingAudio(false);
        setIsPlaying(false);
        setDuration("0:00");
        setCurrentTime("0:00");
        setProgressValue(0);
    };

    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    
    if (audio.src && audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        handleLoadedMetadata();
    }
    if (audio.src && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        handleTimeUpdate();
    }
     // If already playable and not loading, set loading to false.
    if(audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && isLoadingAudio){
        setIsLoadingAudio(false);
    }


    return () => {
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
    };
  }, [audioRef, isPlaying, setIsPlaying, song?.id, isLoadingAudio]); // song.id helps re-evaluate if listeners depend on it
                                                                    // isLoadingAudio helps in handleAudioPause

  // Cleanup currentObjectUrl when component unmounts
  useEffect(() => {
    return () => {
        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
        }
    };
  }, [currentObjectUrl]);


  const handleMainPlayPauseClick = useCallback(() => {
    if (!song) return;
    
    const audio = audioRef.current;
    if (audio && audio.ended && !isPlaying) { 
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
          <SpinningReel className={cn("text-primary", (!isPlaying || isLoadingAudio) && "opacity-50")} />
          <p className="text-lg neon-text-accent font-semibold">
            {isLoadingAudio ? "LOADING TAPE..." : (isPlaying ? "TAPE IS ROLLING" : "TAPE PAUSED")}
          </p>
          <SpinningReel className={cn("text-primary", (!isPlaying || isLoadingAudio) && "opacity-50")} />
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
          <Button variant="primary" size="lg" onClick={handleMainPlayPauseClick} className="rounded-full w-16 h-16 sm:w-20 sm:h-20" disabled={isLoadingAudio}>
            {isPlaying && !isLoadingAudio ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
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
            <Button variant="ghost" size="icon" onClick={handleMainPlayPauseClick} className="text-primary hover:text-primary/80" disabled={isLoadingAudio}>
              {isPlaying && !isLoadingAudio ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
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
