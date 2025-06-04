
"use client";

import type { Song } from '@/types';
import Image from 'next/image';
import { Play as PlayIcon, Pause as PauseIcon, SkipForward, SkipBack, Shuffle, Maximize2, Share2, Expand, Minimize2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { TapeLoadAnimation } from './TapeLoadAnimation';
import { usePlayerContext } from '@/contexts/PlayerContext';
import ShareSongDialog from '@/components/ShareSongDialog';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const [progressValue, setProgressValue] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isMaximized, setIsMaximized] = useState(false);
  const [showLoadAnimation, setShowLoadAnimation] = useState(false);
  const [prevSongIdForAnimation, setPrevSongIdForAnimation] = useState<string | null>(null);
  
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentObjectUrl, setCurrentObjectUrl] = useState<string | null>(null);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDocumentFullscreen, setIsDocumentFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsDocumentFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    setIsDocumentFullscreen(!!document.fullscreenElement); // Initial check
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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

  // Effect 1: Load new song source & handle initial autoplay if intended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Cleanup previous object URL if it exists
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      setCurrentObjectUrl(null);
    }
    audio.removeAttribute('src'); // Ensure old source is cleared

    if (song) {
      setIsLoadingAudio(true);
      setProgressValue(0);
      setCurrentTime("0:00");
      setDuration("0:00");

      let newSrcCandidate = "";
      let newObjectUrlToSet: string | null = null;

      if (song.file) {
        newObjectUrlToSet = URL.createObjectURL(song.file);
        newSrcCandidate = newObjectUrlToSet;
      } else if (song.path) {
        newSrcCandidate = song.path;
      }
      
      audio.src = newSrcCandidate;
      audio.dataset.currentSongId = song.id;
      if (newObjectUrlToSet) {
        setCurrentObjectUrl(newObjectUrlToSet);
      }
      audio.load();

      const handleCanPlayThroughForAutoplay = () => {
        setIsLoadingAudio(false);
        if (audio.dataset.currentSongId === song.id && isPlaying) {
          audio.play().catch(e => {
            if (e.name !== 'AbortError') {
              console.error("Autoplay on canplaythrough failed:", e);
              setIsPlaying(false);
            }
          });
        }
        audio.removeEventListener('canplaythrough', handleCanPlayThroughForAutoplay);
      };
      
      const handleErrorLoading = (e: Event) => {
        const error = (e.target as HTMLAudioElement)?.error;
        console.error('Audio Error Event during load:', error?.message, error);
        setIsLoadingAudio(false);
        if (isPlaying) setIsPlaying(false);
        setDuration("0:00");
        setCurrentTime("0:00");
        setProgressValue(0);
        toast({ title: "Audio Error", description: `Could not load ${song.title}.`, variant: "destructive" });
        audio.removeEventListener('canplaythrough', handleCanPlayThroughForAutoplay);
        audio.removeEventListener('error', handleErrorLoading);
      };

      audio.addEventListener('canplaythrough', handleCanPlayThroughForAutoplay);
      audio.addEventListener('error', handleErrorLoading);

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThroughForAutoplay);
        audio.removeEventListener('error', handleErrorLoading);
      };

    } else { // No song
      if (audio.src) {
        audio.pause();
        audio.removeAttribute('src');
        if(audio.dataset) delete audio.dataset.currentSongId;
        audio.load();
      }
      setIsLoadingAudio(false);
      if (isPlaying) setIsPlaying(false);
      setProgressValue(0);
      setCurrentTime("0:00");
      setDuration("0:00");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]); // Depend only on song.id for loading new media. Context isPlaying is checked internally.

  // Effect 2: Handle play/pause commands from context for an ALREADY LOADED song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song || isLoadingAudio || !audio.src || (audio.dataset && audio.dataset.currentSongId !== song.id)) {
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
  }, [isPlaying, song?.id, isLoadingAudio]); // isPlaying is a primary driver here

  // Effect 3: Audio element event listeners for UI updates and context sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioPlay = () => {
      if (!isPlaying && audio.dataset.currentSongId === song?.id) setIsPlaying(true); 
    };
    const handleAudioPause = () => {
      // Only set isPlaying to false if it wasn't due to song ending or loading a new one.
      if (isPlaying && !audio.ended && !isLoadingAudio && audio.dataset.currentSongId === song?.id) {
         setIsPlaying(false);
      }
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
      } else if (audio.currentTime === 0 && audio.src) { 
        setProgressValue(0);
        setCurrentTime("0:00");
      }
    };
    const handleEnded = () => {
      if (isPlaying) setIsPlaying(false); 
      setProgressValue(100); 
      // Potentially add logic for "play next" here
    };
     const handleAudioError = (e: Event) => {
        const error = (e.target as HTMLAudioElement)?.error;
        console.error('Audio Runtime Error:', error?.message, error);
        setIsLoadingAudio(false);
        if (isPlaying) setIsPlaying(false);
        setDuration("0:00");
        setCurrentTime("0:00");
        setProgressValue(0);
        if (song) {
          toast({ title: "Playback Error", description: `Error playing ${song.title}.`, variant: "destructive" });
        }
    };


    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioError);
    
    // Initial sync if audio is already loaded (e.g. component re-mount)
    if (audio.src && audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        handleLoadedMetadata();
    }
    if (audio.src && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        handleTimeUpdate();
    }
    if(audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && isLoadingAudio && audio.dataset.currentSongId === song?.id){
        setIsLoadingAudio(false); // Sync isLoadingAudio if already ready
    }


    return () => {
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [song?.id, isPlaying, isLoadingAudio, setIsPlaying, toast]); 

  // Cleanup object URL on unmount
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
  }, [song, isPlaying, togglePlayPause]);

  const togglePlayerView = () => setIsMaximized(!isMaximized);

  const handleOpenShareDialog = () => {
    if (!song) return;
    if (!song.file) {
      toast({
        title: "Cannot Share This Song",
        description: "Only locally imported songs with local files can be shared with this conceptual feature.",
        variant: "destructive",
      });
      return;
    }
    setIsShareDialogOpen(true);
  };

  const handleToggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        toast({ title: "Fullscreen Error", description: "Could not enter fullscreen mode.", variant: "destructive"});
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
            console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
            toast({ title: "Fullscreen Error", description: "Could not exit fullscreen mode.", variant: "destructive"});
        });
      }
    }
  };


  if (!song) return null;

  if (isMaximized) {
    return (
      <div className="fixed inset-0 bg-background z-[100] p-4 flex flex-col items-center justify-center text-foreground">
        {showLoadAnimation && <TapeLoadAnimation />}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleToggleBrowserFullscreen} className="text-primary hover:text-primary/80" title={isDocumentFullscreen ? "Exit Browser Fullscreen" : "Enter Browser Fullscreen"}>
                {isDocumentFullscreen ? <Minimize2 /> : <Expand />}
            </Button>
            <Button variant="ghost" size="icon" onClick={togglePlayerView} className="text-primary hover:text-primary/80" title="Minimize Player View">
                <Maximize2 className="rotate-180" /> 
            </Button>
        </div>
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
          <Progress value={isLoadingAudio ? 0 : progressValue} className="h-2 bg-input [&>div]:bg-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{isLoadingAudio ? "0:00" : currentTime}</span>
            <span>{isLoadingAudio ? "0:00" : duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-1 sm:space-x-2 my-4 w-full max-w-md">
          <Button variant="ghost" size="icon" title="Shuffle"><Shuffle className="text-primary w-5 h-5 sm:w-6 sm:h-6" /></Button>
          <Button variant="ghost" size="icon" title="Skip Back"><SkipBack className="text-primary w-6 h-6 sm:w-7 sm:h-7" /></Button>
          <Button variant="primary" size="lg" onClick={handleMainPlayPauseClick} className="rounded-full w-16 h-16 sm:w-20 sm:h-20" disabled={isLoadingAudio} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying && !isLoadingAudio ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
          </Button>
          <Button variant="ghost" size="icon" title="Skip Forward"><SkipForward className="text-primary w-6 h-6 sm:w-7 sm:h-7" /></Button>
          <Button variant="ghost" size="icon" onClick={handleOpenShareDialog} title="Share Song"><Share2 className="text-primary w-5 h-5 sm:w-6 sm:h-6" /></Button>
        </div>
        <ShareSongDialog 
          isOpen={isShareDialogOpen} 
          onOpenChange={setIsShareDialogOpen}
          song={song} 
        />
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
            <Button variant="ghost" size="icon" onClick={handleMainPlayPauseClick} className="text-primary hover:text-primary/80" disabled={isLoadingAudio} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying && !isLoadingAudio ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hidden sm:inline-flex" title="Skip Forward">
              <SkipForward className="w-5 h-5" />
            </Button>
             <Button variant="ghost" size="icon" onClick={handleOpenShareDialog} className="text-primary hover:text-primary/80" title="Share Song">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={togglePlayerView} className="text-muted-foreground hover:text-foreground" title="Maximize Player View">
               <Maximize2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleToggleBrowserFullscreen} className="text-muted-foreground hover:text-foreground" title={isDocumentFullscreen ? "Exit Browser Fullscreen" : "Enter Browser Fullscreen"}>
              {isDocumentFullscreen ? <Minimize2 className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        <Progress value={isLoadingAudio ? 0 : progressValue} className="w-full h-1 bg-input absolute bottom-0 left-0 right-0 rounded-none [&>div]:bg-primary" />
      </div>
      <ShareSongDialog 
        isOpen={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen}
        song={song} 
      />
    </>
  );
}
