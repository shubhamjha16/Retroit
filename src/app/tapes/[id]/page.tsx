
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockTapes, mockSongs } from '@/data/mock'; 
import type { Song, Tape } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, Shuffle, Edit3, Share2, Trash2, ArrowLeft } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent } from '@/components/ui/card';
import { usePlayerContext } from '@/contexts/PlayerContext';

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
  const router = useRouter();
  const tapeId = params.id as string;
  const { playSong } = usePlayerContext();

  const tape = mockTapes.find(t => t.id === tapeId);

  if (!tape) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <SectionTitle>Tape Not Found</SectionTitle>
        <p className="text-muted-foreground">The requested tape could not be found. It might have been deleted or never existed.</p>
        <Link href="/tapes" legacyBehavior><Button variant="link" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Tapes</Button></Link>
      </div>
    );
  }
  
  const handlePlaySong = (songToPlay: Song) => {
    playSong(songToPlay);
  };

  const tapeSongs: Song[] = tape.songs.map(songIdOrSong => 
    typeof songIdOrSong === 'string' ? mockSongs.find(s => s.id === songIdOrSong) : songIdOrSong
  ).filter((s): s is Song => s !== undefined);


  return (
    <div className="container mx-auto px-4 py-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4"/> Back
      </Button>
      <div className="relative mb-8 h-64 rounded-lg overflow-hidden shadow-xl shadow-primary/20">
        <Image 
          src={tape.coverStyleUrl} 
          alt={tape.name} 
          fill // Changed from layout="fill" objectFit="cover"
          style={{objectFit: "cover"}}
          className="opacity-70"
          data-ai-hint={tape.dataAiHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 z-10">
          <p className="text-sm font-bold uppercase tracking-widest text-primary neon-text-primary">Tape</p>
          <h1 className="font-headline text-4xl lg:text-5xl text-foreground mt-1">{tape.name}</h1>
          {tape.description && <p className="text-muted-foreground mt-2 max-w-lg">{tape.description}</p>}
          <p className="text-xs text-muted-foreground mt-1">{tapeSongs.length} songs</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <Button size="lg" variant="primary" onClick={() => tapeSongs.length > 0 && handlePlaySong(tapeSongs[0])} disabled={tapeSongs.length === 0}>
            <Play className="mr-2 h-5 w-5" /> Play
          </Button>
          <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent" disabled={tapeSongs.length === 0}>
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
          {tapeSongs.length > 0 ? (
            <div className="space-y-1">
              {tapeSongs.map((song, index) => (
                <SongItem key={song.id || index} song={song} onPlay={handlePlaySong} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">This tape is empty. Add some songs!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
