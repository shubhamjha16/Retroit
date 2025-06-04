// src/ai/flows/recommend-songs.ts
'use server';
/**
 * @fileOverview A flow for recommending songs based on user listening history and song metadata.
 *
 * - recommendSongs - A function that recommends songs based on listening history.
 * - RecommendSongsInput - The input type for the recommendSongs function.
 * - RecommendSongsOutput - The return type for the recommendSongs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSongsInputSchema = z.object({
  listeningHistory: z
    .string()
    .describe(
      'A comma-separated list of song titles the user has recently listened to.'
    ),
  songMetadata: z
    .string()
    .describe(
      'A comma-separated list of song titles and associated metadata in the format title:genre:artist:BPM. If BPM does not exist use -1.'
    ),
});
export type RecommendSongsInput = z.infer<typeof RecommendSongsInputSchema>;

const RecommendSongsOutputSchema = z.object({
  recommendedSongs: z
    .string()
    .describe(
      'A comma-separated list of recommended song titles from the local library.'
    ),
});
export type RecommendSongsOutput = z.infer<typeof RecommendSongsOutputSchema>;

export async function recommendSongs(input: RecommendSongsInput): Promise<RecommendSongsOutput> {
  return recommendSongsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSongsPrompt',
  input: {schema: RecommendSongsInputSchema},
  output: {schema: RecommendSongsOutputSchema},
  prompt: `You are a personal music assistant. Given a user's listening history and
  the metadata of songs in their local library, recommend songs that the user might enjoy.
  Take into account similar genres, artists, and tempos (BPM).  Respond with only the song titles separated by commas.

  Listening History: {{{listeningHistory}}}
  Song Metadata: {{{songMetadata}}}
  `,
});

const recommendSongsFlow = ai.defineFlow(
  {
    name: 'recommendSongsFlow',
    inputSchema: RecommendSongsInputSchema,
    outputSchema: RecommendSongsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
