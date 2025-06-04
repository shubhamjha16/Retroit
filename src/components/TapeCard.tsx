
import type { Tape } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TapeCardProps {
  tape: Tape;
}

export default function TapeCard({ tape }: TapeCardProps) {
  return (
    <Link href={`/tapes/${tape.id}`} legacyBehavior>
      <a className="block w-full">
        <Card className="retro-card overflow-hidden hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="p-0">
            <Image 
              src={tape.coverStyleUrl} 
              alt={tape.name} 
              width={300} 
              height={180} 
              className="w-full h-32 object-cover" 
              data-ai-hint={tape.dataAiHint}
            />
          </CardHeader>
          <CardContent className="p-3">
            <CardTitle className="text-base font-headline neon-text-accent truncate">{tape.name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 truncate">
              {tape.songs.length} songs {tape.description ? `· ${tape.description}` : ''}
            </CardDescription>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
