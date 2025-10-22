'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { magicEdenAPI, MagicEdenNFT } from '@/lib/magic-eden';
import ResponsiveNFTGrid from '@/app/components/ResponsiveNFTGrid';

const CollectionPage = () => {
  const [nfts, setNfts] = useState<MagicEdenNFT[]>([]);
  const [filteredNFTs, setFilteredNFTs] = useState<MagicEdenNFT[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<MagicEdenNFT | null>(null);
  const [sortBy, setSortBy] = useState<'rarity' | 'price' | 'name'>('rarity');
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load NFTs on component mount
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedNFTs = await magicEdenAPI.getRandomNFTs(100);
        setNfts(fetchedNFTs);
      } catch (err) {
        setError('Failed to load NFTs. Using mock data.');
        console.error('Error loading NFTs:', err);
        // Fallback to mock data
        const mockNFTs = await magicEdenAPI.getMockNFTs(100);
        setNfts(mockNFTs);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, []);

  useEffect(() => {
    let filtered = nfts.filter(nft => 
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      nft.price >= priceRange[0] &&
      nft.price <= priceRange[1]
    );

    if (selectedTraits.length > 0) {
      filtered = filtered.filter(nft => 
        nft.traits.some(trait => selectedTraits.includes(trait.value))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          return a.rarity - b.rarity;
        case 'price':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredNFTs(filtered);
  }, [nfts, searchTerm, priceRange, selectedTraits, sortBy]);

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const getRarityColor = (rarity: number) => {
    if (rarity <= 10) return 'text-red-400';
    if (rarity <= 50) return 'text-orange-400';
    if (rarity <= 100) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getRarityLabel = (rarity: number) => {
    if (rarity <= 10) return 'Legendary';
    if (rarity <= 50) return 'Epic';
    if (rarity <= 100) return 'Rare';
    return 'Common';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hero-blue via-purple-900 to-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/casino-bg.png')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-hero-blue/20 via-purple-900/30 to-black/60" />
      
      {/* Navigation */}
      <nav className="relative z-50 p-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img 
              src="/apechain.png"
              alt="Apechain Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-ape-gold">Apes On Ape</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="px-4 py-2 bg-ape-gold/20 hover:bg-ape-gold/30 rounded-lg transition-colors border border-ape-gold/30"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-ape-gold to-yellow-400 bg-clip-text text-transparent">
            Collection Gallery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore the complete Apes On Ape collection. {nfts.length} unique NFTs available.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-8 border border-ape-gold/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-ape-gold/30 rounded-lg text-white placeholder-gray-400 focus:border-ape-gold/50 focus:outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rarity' | 'price' | 'name')}
              className="px-4 py-3 bg-black/20 border border-ape-gold/30 rounded-lg text-white focus:border-ape-gold/50 focus:outline-none"
            >
              <option value="rarity">Sort by Rarity</option>
              <option value="price">Sort by Price</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Price Range */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Price Range: {priceRange[0]} - {priceRange[1]} APE</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                className="w-full"
              />
            </div>

          </div>

          {/* Trait Filters */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-ape-gold mb-3">Filter by Traits</h3>
            <div className="flex flex-wrap gap-2">
              {['Golden', 'Silver', 'Blue', 'Red', 'Crown', 'Chain', 'Hat', 'Space', 'Forest', 'City', 'Ocean'].map(trait => (
                <button
                  key={trait}
                  onClick={() => toggleTrait(trait)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTraits.includes(trait)
                      ? 'bg-ape-gold/20 text-ape-gold border border-ape-gold/50'
                      : 'bg-black/20 text-gray-300 border border-ape-gold/30 hover:bg-ape-gold/10'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div 
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-ape-gold animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Loading NFTs from Magic Eden...</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* NFT Grid/List */}
        {!loading && (
          <ResponsiveNFTGrid 
            nfts={filteredNFTs}
            loading={loading}
            onNFTSelect={setSelectedNFT}
          />
        )}

        {/* Results Count */}
        {!loading && (
          <motion.div 
            className="text-center mt-8 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Showing {filteredNFTs.length} of {nfts.length} NFTs
          </motion.div>
        )}
      </div>

      {/* NFT Detail Modal */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNFT(null)}
          >
            <motion.div
              className="bg-gradient-to-br from-black/90 to-purple-900/90 p-8 rounded-2xl border border-ape-gold/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <img 
                    src={selectedNFT.image} 
                    alt={selectedNFT.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-ape-gold mb-4">{selectedNFT.name}</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-ape-gold font-semibold">Price:</span>
                      <span className="text-white ml-2">{selectedNFT.price.toFixed(2)} {selectedNFT.currency}</span>
                    </div>
                    <div>
                      <span className="text-ape-gold font-semibold">Rarity:</span>
                      <span className={`ml-2 ${getRarityColor(selectedNFT.rarity)}`}>
                        #{selectedNFT.rarity} {getRarityLabel(selectedNFT.rarity)}
                      </span>
                    </div>
                    <div>
                      <span className="text-ape-gold font-semibold">Traits:</span>
                      <div className="mt-2 space-y-1">
                        {selectedNFT.traits.map((trait, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-300">{trait.name}:</span>
                            <span className="text-white">{trait.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <a
                        href={selectedNFT.magicEdenUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-ape-gold hover:bg-ape-gold/80 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Magic Eden
                      </a>
                      <button className="flex items-center gap-2 bg-ape-gold/20 hover:bg-ape-gold/30 text-ape-gold px-6 py-3 rounded-lg font-semibold transition-colors border border-ape-gold/30">
                        <Heart className="w-4 h-4" />
                        Favorite
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedNFT(null)}
                className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectionPage;
