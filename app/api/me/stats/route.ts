import { NextResponse } from 'next/server';

const ME_API_BASE = process.env.ME_API_BASE || 'https://api-mainnet.magiceden.dev/v2';
const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_ME_COLLECTION || '0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0';

export const runtime = 'edge';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    // For Apechain collections on Magic Eden
    const apiUrl = `${ME_API_BASE}/apechain/collections/${COLLECTION_ADDRESS}/stats`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error('Magic Eden Stats API error:', response.statusText);
      
      // Return mock stats as fallback
      return NextResponse.json({
        symbol: 'apes-on-ape',
        floorPrice: 0.5,
        listedCount: 150,
        avgPrice24hr: 0.75,
        volumeAll: 5000,
        volume24hr: 50,
        volume7d: 350,
        volume30d: 1500,
        totalSupply: 1000,
        uniqueHolders: 650,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching collection stats:', error);
    
    // Return mock stats as fallback
    return NextResponse.json({
      symbol: 'apes-on-ape',
      floorPrice: 0.5,
      listedCount: 150,
      avgPrice24hr: 0.75,
      volumeAll: 5000,
      volume24hr: 50,
      volume7d: 350,
      volume30d: 1500,
      totalSupply: 1000,
      uniqueHolders: 650,
    });
  }
}

