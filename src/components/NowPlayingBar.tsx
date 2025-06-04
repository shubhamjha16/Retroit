
"use client";

import type { Song } from '@/types';
import Image from 'next/image';
import { Play as PlayIcon, Pause as PauseIcon, SkipForward, Maximize2 as MaximizePlayerIcon, Share2, Expand as ExpandBrowserIcon, Minimize2 as MinimizeBrowserIcon } from 'lucide-react';
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
  const [isMaximized, setIsMaximized] = useState(false); // Player UI maximized state
  const [showLoadAnimation, setShowLoadAnimation] = useState(false);
  const [prevSongIdForAnimation, setPrevSongIdForAnimation] = useState<string | null>(null);
  
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentObjectUrl, setCurrentObjectUrl] = useState<string | null>(null);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDocumentFullscreen, setIsDocumentFullscreen] = useState(false); // Browser native fullscreen state

  // Effect for browser fullscreen change detection
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

  // Effect for tape load animation
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

    // Define these handlers within this effect so they capture the correct `song` and `audio` instance
    const handleCanPlayThroughForAutoplay = () => {
      setIsLoadingAudio(false);
      if (audio.dataset.currentSongId === song?.id && isPlaying) { // Check song?.id as song might become null
        audio.play().catch(e => {
          if (e.name !== 'AbortError') {
            console.error("Autoplay on canplaythrough failed:", e);
            if (song?.id === audio.dataset.currentSongId) setIsPlaying(false); // Only update context if it's for the current song
          }
        });
      }
      audio.removeEventListener('canplaythrough', handleCanPlayThroughForAutoplay);
    };
    
    const handleErrorLoading = (e: Event) => {
      const audioEl = e.target as HTMLAudioElement;
      const mediaError = audioEl.error;

      let detailedLogMessage = `Audio Error during load for src: ${audioEl.currentSrc || audioEl.src}. `;
      if (mediaError) {
        detailedLogMessage += `Error Code: ${mediaError.code}, Message: "${mediaError.message || 'No specific message from MediaError object.'}"`;
        console.error(detailedLogMessage, mediaError);
      } else {
        detailedLogMessage += "An unknown audio error occurred (MediaError object was null).";
        console.error(detailedLogMessage, e);
      }

      setIsLoadingAudio(false);
      // Only modify isPlaying if the error is for the currently active song in context
      if (song && audioEl.dataset.currentSongId === song.id && isPlaying) {
        setIsPlaying(false);
      }
      setDuration("0:00");
      setCurrentTime("0:00");
      setProgressValue(0);

      if (song) {
        toast({ title: "Audio Error", description: `Could not load "${song.title}". Please check file format or select another song.`, variant: "destructive" });
      } else {
         toast({ title: "Audio Error", description: "Could not load audio. Please check file format.", variant: "destructive" });
      }
      
      audioEl.removeEventListener('canplaythrough', handleCanPlayThroughForAutoplay);
      audioEl.removeEventListener('error', handleErrorLoading); // remove self
    };

    if (song) {
      setIsLoadingAudio(true);
      setProgressValue(0);
      setCurrentTime("0:00");
      setDuration("0:00");

      // Revoke previous object URL if it exists and we're setting a new one
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        setCurrentObjectUrl(null);
      }
      audio.removeAttribute('src'); // Ensure old source is fully cleared

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
      
      audio.load(); // Explicitly call load
      
      audio.addEventListener('canplaythrough', handleCanPlayThroughForAutoplay);
      audio.addEventListener('error', handleErrorLoading);

    } else { // No song, cleanup
      if (audio.src) {
        audio.pause();
        audio.removeAttribute('src');
        if(audio.dataset) delete audio.dataset.currentSongId;
        audio.load(); // Reset audio element
      }
      setIsLoadingAudio(false);
      if (isPlaying) setIsPlaying(false); // Ensure context isPlaying is false if no song
      setProgressValue(0);
      setCurrentTime("0:00");
      setDuration("0:00");
      if (currentObjectUrl) { // Cleanup if unsetting song
        URL.revokeObjectURL(currentObjectUrl);
        setCurrentObjectUrl(null);
      }
    }

    return () => {
      // Cleanup specific listeners for this song instance
      audio.removeEventListener('canplaythrough', handleCanPlayThroughForAutoplay);
      audio.removeEventListener('error', handleErrorLoading);
      // Don't revoke currentObjectUrl here if the component itself unmounts,
      // as a new song might be loaded immediately after.
      // Revocation is handled when a *new* song is set or when no song.
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]); // Depend primarily on song.id for loading new media. Context isPlaying is checked internally for autoplay.


  // Effect 2: Handle play/pause commands from context for an ALREADY LOADED song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) { 
      return;
    }

    const currentAudioSongId = audio.dataset ? audio.dataset.currentSongId : undefined;
    // This effect should only act if the song is loaded and matches context, and not currently loading
    if (!song || isLoadingAudio || !audio.src || currentAudioSongId !== song.id) {
        return;
    }
    
    if (isPlaying) {
      if (audio.paused && audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') { // AbortError is expected if another load/play interrupts
              console.error("Error in play() from isPlaying effect:", error);
              if (song?.id === currentAudioSongId) setIsPlaying(false); 
            }
          });
        }
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, song?.id, isLoadingAudio]); // Removed audioRef, added song?.id


  // Effect 3: Audio element event listeners for UI updates and context sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioPlay = () => {
      // Sync context if audio started playing due to means other than context change (e.g. external controls, finishing load)
      if (!isPlaying && audio.dataset.currentSongId === song?.id) setIsPlaying(true); 
    };
    const handleAudioPause = () => {
      // Sync context if audio paused (not due to song ending or loading new one)
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
        setDuration("0:00"); // Or "N/A" or some other indicator
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
      } else if (audio.currentTime === 0 && (audio.src || audio.currentSrc)) { 
        setProgressValue(0);
        setCurrentTime("0:00");
      }
    };
    const handleEnded = () => {
      if (isPlaying) setIsPlaying(false); 
      setProgressValue(100); 
      // Potentially add logic for "play next" here or via context
    };
     const handleAudioRuntimeError = (e: Event) => { // Different from load error
        const error = (e.target as HTMLAudioElement)?.error;
        console.error('Audio Runtime Error:', error?.message, error);
        setIsLoadingAudio(false); // Should already be false, but good practice
        if (isPlaying && song && (e.target as HTMLAudioElement).dataset.currentSongId === song.id) setIsPlaying(false);
        // Don't reset duration/time here as the metadata might still be valid from a previous load
        if (song) {
          toast({ title: "Playback Error", description: `Error playing ${song.title}.`, variant: "destructive" });
        }
    };

    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioRuntimeError); // Use a different handler for runtime errors vs load errors
    
    // Initial sync if audio is already loaded (e.g. component re-mount with same song)
    if (audio.src && audio.dataset.currentSongId === song?.id) {
        if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
            handleLoadedMetadata();
        }
        if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            handleTimeUpdate();
        }
        if(audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && isLoadingAudio){
             // If it was loading but is now ready, ensure isLoadingAudio is false.
             // This can happen if the 'canplaythrough' in effect 1 was missed due to quick state changes.
            setIsLoadingAudio(false);
        }
        // Reflect current audio element's playing state in context if it mismatches
        if (audio.paused && isPlaying) setIsPlaying(false);
        if (!audio.paused && !isPlaying) setIsPlaying(true);
    }

    return () => {
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleAudioRuntimeError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id, isPlaying, isLoadingAudio, setIsPlaying, toast]); // Keep song?.id to re-evaluate if initial state should sync


  // Cleanup object URL on unmount of the component itself
  useEffect(() => {
    return () => {
        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
            setCurrentObjectUrl(null); // ensure state is also cleared
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on unmount


  const handleMainPlayPauseClick = useCallback(() => {
    if (!song || isLoadingAudio) return; // Don't do anything if no song or loading
    
    const audio = audioRef.current;
    if (audio && audio.ended && !isPlaying) { 
      // If song ended and user clicks play again, restart from beginning
      audio.currentTime = 0; 
      setProgressValue(0);
      setCurrentTime("0:00");
    }
    // Let the context and useEffect hooks handle the play/pause logic
    togglePlayPause(); 
  }, [song, isPlaying, isLoadingAudio, togglePlayPause]);

  const togglePlayerView = () => setIsMaximized(!isMaximized);

  const handleOpenShareDialog = () => {
    if (!song) return;
    if (!song.file) {
      toast({
        title: "Cannot Share This Song",
        description: "Only locally imported songs can be shared with this conceptual P2P feature.",
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

  if (!song && !isLoadingAudio) return null; // Don't render bar if no song and not in the process of loading one
  if (!song && isLoadingAudio && audioRef.current?.dataset.currentSongId) { 
    // This case could happen if song becomes null while an old song was loading, better to show nothing
    return null;
  }
  // Ensure we have a song object to display details, even if it's just finished loading or is about to be cleared
  const displaySong = song || (prevSongIdForAnimation ? { id: prevSongIdForAnimation, title: "Loading...", artist: "...", album:"...", albumArtUrl: "https://placehold.co/48x48.png", duration:"0:00" } : null);
  if (!displaySong) return null;


  if (isMaximized) {
    return (
      <div className="fixed inset-0 bg-background z-[100] p-4 flex flex-col items-center justify-center text-foreground">
        {showLoadAnimation && <TapeLoadAnimation />}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleToggleBrowserFullscreen} className="text-primary hover:text-primary/80" title={isDocumentFullscreen ? "Exit Browser Fullscreen" : "Enter Browser Fullscreen"}>
                {isDocumentFullscreen ? <MinimizeBrowserIcon /> : <ExpandBrowserIcon />}
            </Button>
            <Button variant="ghost" size="icon" onClick={togglePlayerView} className="text-primary hover:text-primary/80" title="Minimize Player View">
                <MaximizePlayerIcon className="rotate-180" /> 
            </Button>
        </div>
        <Image src={displaySong.albumArtUrl} alt={displaySong.album} width={300} height={300} className="rounded-lg shadow-2xl shadow-primary/30 mb-8" data-ai-hint={displaySong.dataAiHint || 'album cover'} />
        <h2 className="text-3xl font-headline neon-text-primary mb-2 text-center">{displaySong.title}</h2>
        <p className="text-xl text-muted-foreground mb-6 text-center">{displaySong.artist}</p>
        
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
          {/* <Button variant="ghost" size="icon" title="Shuffle"><Shuffle className="text-primary w-5 h-5 sm:w-6 sm:h-6" /></Button> */}
          <Button variant="ghost" size="icon" title="Skip Back" disabled><SkipForward className="text-primary w-6 h-6 sm:w-7 sm:h-7 rotate-180" /></Button>
          <Button variant="primary" size="lg" onClick={handleMainPlayPauseClick} className="rounded-full w-16 h-16 sm:w-20 sm:h-20" disabled={isLoadingAudio || !song} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying && !isLoadingAudio ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
          </Button>
          <Button variant="ghost" size="icon" title="Skip Forward" disabled><SkipForward className="text-primary w-6 h-6 sm:w-7 sm:h-7" /></Button>
          <Button variant="ghost" size="icon" onClick={handleOpenShareDialog} title="Share Song" disabled={!song || !song.file}><Share2 className="text-primary w-5 h-5 sm:w-6 sm:h-6" /></Button>
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
            <Image src={displaySong.albumArtUrl} alt={displaySong.album} width={48} height={48} className="rounded shadow-md flex-shrink-0" data-ai-hint={displaySong.dataAiHint || 'album cover'} />
            <div className="truncate flex-1">
              <p className="text-sm font-medium text-foreground truncate">{displaySong.title}</p>
              <p className="text-xs text-muted-foreground truncate">{displaySong.artist}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
            <Button variant="ghost" size="icon" onClick={handleMainPlayPauseClick} className="text-primary hover:text-primary/80" disabled={isLoadingAudio || !song} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying && !isLoadingAudio ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </Button>
            {/* <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hidden sm:inline-flex" title="Skip Forward">
              <SkipForward className="w-5 h-5" />
            </Button> */}
             <Button variant="ghost" size="icon" onClick={handleOpenShareDialog} className="text-primary hover:text-primary/80" title="Share Song" disabled={!song || !song.file}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={togglePlayerView} className="text-muted-foreground hover:text-foreground" title="Maximize Player View">
               <MaximizePlayerIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleToggleBrowserFullscreen} className="text-muted-foreground hover:text-foreground" title={isDocumentFullscreen ? "Exit Browser Fullscreen" : "Enter Browser Fullscreen"}>
              {isDocumentFullscreen ? <MinimizeBrowserIcon className="w-5 h-5" /> : <ExpandBrowserIcon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        <Progress value={isLoadingAudio ? 0 : progressValue} className="w-full h-1 bg-input absolute bottom-0 left-0 right-0 rounded-none [&>div]:bg-primary" />
      </div>
      <ShareSongDialog 
        isOpen={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen}
        song={song} // Pass the current song from context/state
      />
    </>
  );
}

    