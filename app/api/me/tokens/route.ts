import { NextRequest, NextResponse } from 'next/server';

const ME_API_BASE = process.env.ME_API_BASE || 'https://api-mainnet.magiceden.dev/v2';
const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_ME_COLLECTION || '0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0';

export const runtime = 'edge';
export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '32';
    const offset = searchParams.get('offset') || '0';
    const random = searchParams.get('random') === 'true';

    // For Apechain, we need to use the correct API endpoint
    const apiUrl = `${ME_API_BASE}/apechain/collections/${COLLECTION_ADDRESS}/tokens?limit=${limit}&offset=${offset}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error('Magic Eden API error:', response.statusText);
      
      // Return mock data as fallback
      return NextResponse.json({
        tokens: generateMockTokens(parseInt(limit)),
        total: 1000,
      });
    }

    const data = await response.json();
    
    // If random is requested, shuffle the tokens
    let tokens = data.tokens || data;
    if (random && Array.isArray(tokens)) {
      tokens = tokens.sort(() => Math.random() - 0.5);
    }

    return NextResponse.json({
      tokens,
      total: data.total || tokens.length,
    });

  } catch (error) {
    console.error('Error fetching tokens:', error);
    
    // Return mock data as fallback
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '32');
    return NextResponse.json({
      tokens: generateMockTokens(limit),
      total: 1000,
    });
  }
}

function generateMockTokens(count: number) {
  const traits = [
    { name: 'Fur', value: 'Golden', rarity: 10 },
    { name: 'Fur', value: 'Silver', rarity: 25 },
    { name: 'Fur', value: 'Blue', rarity: 50 },
    { name: 'Eyes', value: 'Laser', rarity: 15 },
    { name: 'Accessory', value: 'Crown', rarity: 5 },
    { name: 'Accessory', value: 'Chain', rarity: 15 },
    { name: 'Background', value: 'Space', rarity: 20 },
  ];

  return Array.from({ length: count }, (_, i) => ({
    mint: `mock-token-${i + 1}`,
    tokenId: `${i + 1}`,
    name: `Ape On Ape #${i + 1}`,
    image: '/AoA-placeholder-apecoinblue.jpg',
    price: Math.random() * 10 + 0.1,
    currency: 'APE',
    rarity: Math.floor(Math.random() * 1000) + 1,
    attributes: traits
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4) + 2),
    owner: `0x${Math.random().toString(16).substr(2, 40)}`,
  }));
}

