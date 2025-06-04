
"use client";

import { useParams } from 'next/navigation';
import { mockTapes, mockSongs } from '@/data/mock'; // Assuming mockSongs contains all songs
import type { Song, Tape } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, Shuffle, Edit3, Share2, Trash2 } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent } from '@/components/ui/card';

const SongItem = ({ song, onPlay }: { song: Song; onPlay: (song: Song) => void }) => (
  <div 
    className="flex items-center p-3 hover:bg-accent/10 rounded-md transition-colors cursor-pointer"
    onClick={() => onPlay(song)}
  >
    <Image src={song.albumArtUrl} alt={song.album} width={48} height={48} className="rounded shadow-md mr-4" data-ai-hint={song.dataAiHint} />
    <div className="flex-grow">
      <p className="text-sm font-medium text-foreground">{song.title}</p>
      <p className="text-xs text-muted-foreground">{song.artist}</p>
    </div>
    <span className="text-xs text-muted-foreground">{song.duration}</span>
  </div>
);

export default function TapeDetailPage() {
  const params = useParams();
  const tapeId = params.id as string;

  // In a real app, you'd fetch this data. Using mockTapes for now.
  const tape = mockTapes.find(t => t.id === tapeId);

  if (!tape) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <SectionTitle>Tape Not Found</SectionTitle>
        <p className="text-muted-foreground">The requested tape could not be found. It might have been deleted or never existed.</p>
        <Link href="/tapes" legacyBehavior><Button variant="link" className="mt-4">Back to Tapes</Button></Link>
      </div>
    );
  }
  
  const handlePlaySong = (song: Song) => {
    // Logic to start playing the song
    // This would typically update a global state for the NowPlayingBar
    alert(`Playing: ${song.title} by ${song.artist}`);
    // Example: updateCurrentlyPlaying(song);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative mb-8 h-64 rounded-lg overflow-hidden shadow-xl shadow-primary/20">
        <Image 
          src={tape.coverStyleUrl} 
          alt={tape.name} 
          layout="fill" 
          objectFit="cover" 
          className="opacity-70"
          data-ai-hint={tape.dataAiHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 z-10">
          <p className="text-sm font-bold uppercase tracking-widest text-primary neon-text-primary">Tape</p>
          <h1 className="font-headline text-4xl lg:text-5xl text-foreground mt-1">{tape.name}</h1>
          {tape.description && <p className="text-muted-foreground mt-2 max-w-lg">{tape.description}</p>}
          <p className="text-xs text-muted-foreground mt-1">{tape.songs.length} songs</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <Button size="lg" variant="primary" onClick={() => handlePlaySong(tape.songs[0])}>
            <Play className="mr-2 h-5 w-5" /> Play
          </Button>
          <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
            <Shuffle className="mr-2 h-5 w-5" /> Shuffle
          </Button>
        </div>
        {tape.userEditable && (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" title="Edit Tape"><Edit3 className="h-5 w-5 text-muted-foreground hover:text-primary" /></Button>
            <Button variant="ghost" size="icon" title="Share Tape"><Share2 className="h-5 w-5 text-muted-foreground hover:text-primary" /></Button>
            <Button variant="ghost" size="icon" title="Delete Tape"><Trash2 className="h-5 w-5 text-destructive/80 hover:text-destructive" /></Button>
          </div>
        )}
      </div>

      <Card className="retro-card bg-card/80">
        <CardContent className="p-2 sm:p-4">
          {tape.songs.length > 0 ? (
            <div className="space-y-1">
              {tape.songs.map((songIdOrSong, index) => {
                // Assuming tape.songs might contain song IDs or full song objects.
                // For this mock, let's find the song from mockSongs if it's an ID.
                // If it's already a song object, use it directly.
                // This is a simplification; a real app would have proper data structures.
                const song = typeof songIdOrSong === 'string' ? mockSongs.find(s => s.id === songIdOrSong) : songIdOrSong;
                if (!song) return null;
                return <SongItem key={song.id || index} song={song} onPlay={handlePlaySong} />;
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">This tape is empty. Add some songs!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
