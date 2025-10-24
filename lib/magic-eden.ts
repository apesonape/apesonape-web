// Magic Eden API integration for Apes On Ape NFT collection
// This service handles fetching NFT data from Magic Eden

export interface MagicEdenNFT {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  rarity: number;
  traits: Array<{
    name: string;
    value: string;
    rarity: number;
  }>;
  magicEdenUrl: string;
  owner: string;
  lastSale?: {
    price: number;
    currency: string;
    date: string;
  };
}

export interface MagicEdenCollection {
  symbol: string;
  name: string;
  description: string;
  image: string;
  totalSupply: number;
  floorPrice: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  marketCap: number;
}

class MagicEdenAPI {
  private baseUrl = 'https://api-mainnet.magiceden.io/v2';
  private collectionSymbol = 'apes-on-ape'; // Replace with actual collection symbol

  async getCollectionInfo(): Promise<MagicEdenCollection> {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${this.collectionSymbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch collection info: ${response.statusText}`);
      }
      const data = await response.json();
      
      return {
        symbol: data.symbol,
        name: data.name,
        description: data.description,
        image: data.image,
        totalSupply: data.totalSupply,
        floorPrice: data.floorPrice,
        volume24h: data.volume24h,
        volume7d: data.volume7d,
        volume30d: data.volume30d,
        marketCap: data.marketCap
      };
    } catch (error) {
      console.error('Error fetching collection info:', error);
      throw error;
    }
  }

  async getNFTs(limit: number = 32, offset: number = 0): Promise<MagicEdenNFT[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${this.collectionSymbol}/tokens?limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.tokens.map((token: Record<string, unknown>) => ({
        id: token.mint,
        name: token.name || `Ape On Ape #${token.tokenId}`,
        image: token.image,
        price: token.price || 0,
        currency: token.currency || 'APE',
        rarity: token.rarity || Math.floor(Math.random() * 1000) + 1,
        traits: token.attributes || [],
        magicEdenUrl: `https://magiceden.us/item-details/${token.mint}`,
        owner: token.owner,
        lastSale: token.lastSale ? {
          price: (token.lastSale as Record<string, unknown>).price as number,
          currency: (token.lastSale as Record<string, unknown>).currency as string,
          date: (token.lastSale as Record<string, unknown>).date as string
        } : undefined
      }));
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      // Return mock data as fallback
      return this.getMockNFTs(limit);
    }
  }

  async getRandomNFTs(count: number = 32): Promise<MagicEdenNFT[]> {
    try {
      // Get total supply first
      const collectionInfo = await this.getCollectionInfo();
      const totalSupply = collectionInfo.totalSupply;
      
      // Generate random offsets
      const offsets = Array.from({ length: count }, () => 
        Math.floor(Math.random() * Math.max(1, totalSupply - count))
      );
      
      // Fetch NFTs from random positions
      const promises = offsets.map(offset => this.getNFTs(1, offset));
      const results = await Promise.all(promises);
      
      return results.flat();
    } catch (error) {
      console.error('Error fetching random NFTs:', error);
      return this.getMockNFTs(count);
    }
  }

  async getNFTById(id: string): Promise<MagicEdenNFT | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/${id}`);
      if (!response.ok) {
        return null;
      }
      
      const token = await response.json();
      
      return {
        id: token.mint,
        name: token.name || `Ape On Ape #${token.tokenId}`,
        image: token.image,
        price: token.price || 0,
        currency: token.currency || 'APE',
        rarity: token.rarity || Math.floor(Math.random() * 1000) + 1,
        traits: token.attributes || [],
        magicEdenUrl: `https://magiceden.us/item-details/${token.mint}`,
        owner: token.owner,
        lastSale: token.lastSale ? {
          price: (token.lastSale as Record<string, unknown>).price as number,
          currency: (token.lastSale as Record<string, unknown>).currency as string,
          date: (token.lastSale as Record<string, unknown>).date as string
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching NFT by ID:', error);
      return null;
    }
  }

  async searchNFTs(query: string, limit: number = 32): Promise<MagicEdenNFT[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${this.collectionSymbol}/tokens?search=${encodeURIComponent(query)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to search NFTs: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.tokens.map((token: Record<string, unknown>) => ({
        id: token.mint,
        name: token.name || `Ape On Ape #${token.tokenId}`,
        image: token.image,
        price: token.price || 0,
        currency: token.currency || 'APE',
        rarity: token.rarity || Math.floor(Math.random() * 1000) + 1,
        traits: token.attributes || [],
        magicEdenUrl: `https://magiceden.us/item-details/${token.mint}`,
        owner: token.owner,
        lastSale: token.lastSale ? {
          price: (token.lastSale as Record<string, unknown>).price as number,
          currency: (token.lastSale as Record<string, unknown>).currency as string,
          date: (token.lastSale as Record<string, unknown>).date as string
        } : undefined
      }));
    } catch (error) {
      console.error('Error searching NFTs:', error);
      return this.getMockNFTs(limit);
    }
  }

  getMockNFTs(count: number): MagicEdenNFT[] {
    const traits = [
      { name: 'Fur', value: 'Golden', rarity: 10 },
      { name: 'Fur', value: 'Silver', rarity: 25 },
      { name: 'Fur', value: 'Blue', rarity: 50 },
      { name: 'Fur', value: 'Red', rarity: 100 },
      { name: 'Eyes', value: 'Blue', rarity: 30 },
      { name: 'Eyes', value: 'Green', rarity: 40 },
      { name: 'Eyes', value: 'Red', rarity: 20 },
      { name: 'Eyes', value: 'Purple', rarity: 10 },
      { name: 'Accessory', value: 'Crown', rarity: 5 },
      { name: 'Accessory', value: 'Chain', rarity: 15 },
      { name: 'Accessory', value: 'Hat', rarity: 30 },
      { name: 'Accessory', value: 'None', rarity: 50 },
      { name: 'Background', value: 'Space', rarity: 20 },
      { name: 'Background', value: 'Forest', rarity: 30 },
      { name: 'Background', value: 'City', rarity: 25 },
      { name: 'Background', value: 'Ocean', rarity: 25 }
    ];

    return Array.from({ length: count }, (_, i) => {
      const randomTraits = traits
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 2);
      
      return {
        id: `mock-${i + 1}`,
        name: `Ape On Ape #${i + 1}`,
        image: '/AoA-placeholder-apecoinblue.jpg',
        price: Math.random() * 10 + 0.1,
        currency: 'APE',
        rarity: Math.floor(Math.random() * 1000) + 1,
        traits: randomTraits,
        magicEdenUrl: `https://magiceden.us/collections/apechain/0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0/${i + 1}`,
        owner: `0x${Math.random().toString(16).substr(2, 40)}`,
        lastSale: Math.random() > 0.5 ? {
          price: Math.random() * 5 + 0.1,
          currency: 'APE',
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        } : undefined
      };
    });
  }
}

export const magicEdenAPI = new MagicEdenAPI();
