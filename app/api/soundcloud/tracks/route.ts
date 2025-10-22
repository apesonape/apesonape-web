import { NextResponse } from 'next/server';

const SOUNDCLOUD_USER_URL = process.env.SOUNDCLOUD_USER_URL || 'https://soundcloud.com/apesonape';
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  artwork: string;
  streamUrl: string;
  permalink: string;
  description?: string;
  isSpotlight?: boolean;
}

export async function GET() {
  try {
    // If we have a SoundCloud API client ID, use it
    if (SOUNDCLOUD_CLIENT_ID) {
      const username = SOUNDCLOUD_USER_URL.split('/').pop();
      const apiUrl = `https://api.soundcloud.com/users/${username}/tracks?client_id=${SOUNDCLOUD_CLIENT_ID}&limit=50`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const tracks = await response.json();
        
        // Transform to our format
        const transformedTracks = tracks.map((track: Record<string, unknown>, index: number) => ({
          id: String(track.id),
          title: String(track.title),
          artist: String((track.user as Record<string, unknown>).username),
          duration: Math.floor(Number(track.duration) / 1000),
          artwork: String(track.artwork_url) || '/AoA-placeholder-apecoinblue.jpg',
          streamUrl: String(track.stream_url),
          permalink: String(track.permalink_url),
          description: String(track.description),
          isSpotlight: index === 0, // First track is spotlight
        }));

        return NextResponse.json({
          tracks: transformedTracks,
          user: SOUNDCLOUD_USER_URL,
        });
      }
    }

    // Fallback to mock data
    return NextResponse.json({
      tracks: getMockTracks(),
      user: SOUNDCLOUD_USER_URL,
    });

  } catch (error) {
    console.error('Error fetching SoundCloud tracks:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      tracks: getMockTracks(),
      user: SOUNDCLOUD_USER_URL,
    });
  }
}

function getMockTracks(): Track[] {
  return [
    {
      id: 'dibs-1',
      title: 'Sinatra Season - Track 1',
      artist: 'Dr. DIBS',
      duration: 225,
      artwork: '/AoA-placeholder-apecoinblue.jpg',
      streamUrl: 'https://soundcloud.com/apesonape/sets/sinatra-season-by-dr-dibs',
      permalink: 'https://soundcloud.com/apesonape/sets/sinatra-season-by-dr-dibs',
      description: 'From the Sinatra Season playlist by Dr. DIBS',
      isSpotlight: true,
    },
    {
      id: 'dibs-2',
      title: 'Sinatra Season - Track 2',
      artist: 'Dr. DIBS',
      duration: 252,
      artwork: '/AoA-placeholder-apecoinblue.jpg',
      streamUrl: 'https://soundcloud.com/apesonape/sets/sinatra-season-by-dr-dibs',
      permalink: 'https://soundcloud.com/apesonape/sets/sinatra-season-by-dr-dibs',
      description: 'From the Sinatra Season playlist by Dr. DIBS',
      isSpotlight: false,
    },
    {
      id: 'dibs-3',
      title: 'Sinatra Season - Track 3',
      artist: 'Dr. DIBS',
      duration: 208,
      artwork: '/AoA-placeholder-apecoinblue.jpg',
      streamUrl: 'https://soundcloud.com/apesonape/sets/sinatra-season-by-dr-dibs',
      permalink: 'https://soundcloud.com/apesonape/sets/sinatra-season-by-dr-dibs',
      description: 'From the Sinatra Season playlist by Dr. DIBS',
      isSpotlight: false,
    },
    {
      id: 'aoa-1',
      title: 'Ape Vibes',
      artist: 'Apes On Ape Community',
      duration: 195,
      artwork: '/AoA-placeholder-apecoinblue.jpg',
      streamUrl: SOUNDCLOUD_USER_URL,
      permalink: SOUNDCLOUD_USER_URL,
      description: 'Community featured track',
      isSpotlight: false,
    },
    {
      id: 'aoa-2',
      title: 'Chain Reaction',
      artist: 'Apes On Ape Community',
      duration: 240,
      artwork: '/AoA-placeholder-apecoinblue.jpg',
      streamUrl: SOUNDCLOUD_USER_URL,
      permalink: SOUNDCLOUD_USER_URL,
      description: 'Community featured track',
      isSpotlight: false,
    },
    {
      id: 'artist-1',
      title: 'Jungle Beats',
      artist: 'ApeChain Artist',
      duration: 218,
      artwork: '/AoA-placeholder-apecoinblue.jpg',
      streamUrl: SOUNDCLOUD_USER_URL,
      permalink: SOUNDCLOUD_USER_URL,
      description: 'Featured artist from the community',
      isSpotlight: false,
    },
    {
      id: 'artist-2',
      title: 'Golden Hour',
      artist: 'ApeChain Artist',
      duration: 203,
      artwork: '/AoA-placeholder-apecoinblue.jpg',
      streamUrl: SOUNDCLOUD_USER_URL,
      permalink: SOUNDCLOUD_USER_URL,
      description: 'Featured artist from the community',
      isSpotlight: false,
    },
    {
      id: 'artist-3',
      title: 'Electric Dreams',
      artist: 'Blockchain Musician',
      duration: 231,
      artwork: '/AoA-placeholder-apecoinblue.jpg',
      streamUrl: SOUNDCLOUD_USER_URL,
      permalink: SOUNDCLOUD_USER_URL,
      description: 'Featured musician from the community',
      isSpotlight: false,
    },
  ];
}

