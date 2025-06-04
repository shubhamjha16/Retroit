
import type { Mood } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MoodCardProps {
  mood: Mood;
}

export default function MoodCard({ mood }: MoodCardProps) {
  return (
    <Link href={`/moods/${mood.id}`} legacyBehavior>
      <a className="block w-full">
        <Card className="retro-card overflow-hidden aspect-[3/2] flex flex-col justify-end hover:scale-[1.02] transition-transform duration-200">
          <CardHeader className="p-0 relative w-full h-full">
            <Image 
              src={mood.imageUrl} 
              alt={mood.name} 
              layout="fill"
              objectFit="cover"
              className="opacity-80"
              data-ai-hint={mood.dataAiHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </CardHeader>
          <CardContent className="p-3 relative z-10">
            <CardTitle className="text-lg font-headline text-primary-foreground neon-text-primary drop-shadow-[0_0_2px_#000]">{mood.name}</CardTitle>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
