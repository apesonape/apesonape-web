'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Users, Layers, ExternalLink, ShoppingBag } from 'lucide-react';
import Nav from '../components/Nav';
import Image from 'next/image';
import Footer from '../components/Footer';
import NFTCard from '../components/NFTCard';
import TokenDrawer from '../components/TokenDrawer';
import { MagicEdenNFT } from '@/lib/magic-eden';

interface CollectionStats {
  floorPrice: number;
  listedCount: number;
  totalSupply: number;
  uniqueHolders: number;
  volume24hr: number;
}

export default function CollectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const observerTarget = useRef<HTMLDivElement>(null);

  // State
  const [nfts, setNfts] = useState<MagicEdenNFT[]>([]);
  const [filteredNFTs, setFilteredNFTs] = useState<MagicEdenNFT[]>([]);
  const [displayedNFTs, setDisplayedNFTs] = useState<MagicEdenNFT[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<MagicEdenNFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'rarity' | 'price-asc' | 'price-desc' | 'name'>(
    (searchParams.get('sort') as 'rarity' | 'price-asc' | 'price-desc' | 'name') || 'rarity'
  );
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    searchParams.get('traits')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseFloat(searchParams.get('minPrice') || '0'),
    parseFloat(searchParams.get('maxPrice') || '10'),
  ]);

  const itemsPerPage = 24;

  // Available traits for filtering
  const availableTraits = [
    'Golden', 'Silver', 'Blue', 'Red', 'Crown', 'Chain', 
    'Hat', 'Space', 'Forest', 'City', 'Ocean', 'Laser'
  ];

  // Update URL with filters
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy !== 'rarity') params.set('sort', sortBy);
    if (selectedTraits.length > 0) params.set('traits', selectedTraits.join(','));
    if (priceRange[0] !== 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] !== 10) params.set('maxPrice', priceRange[1].toString());
    
    router.push(`/collection?${params.toString()}`, { scroll: false });
  }, [searchTerm, sortBy, selectedTraits, priceRange, router]);

  // Load NFTs and stats
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load NFTs
        const nftsResponse = await fetch('/api/me/tokens?limit=150');
        const nftsData = await nftsResponse.json();
        setNfts(nftsData.tokens || []);

        // Load stats
        const statsResponse = await fetch('/api/me/stats');
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading collection data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...nfts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(nft =>
      nft.price >= priceRange[0] && nft.price <= priceRange[1]
    );

    // Traits filter
    if (selectedTraits.length > 0) {
      filtered = filtered.filter(nft => 
        nft.traits.some(trait => selectedTraits.includes(trait.value))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          return a.rarity - b.rarity;
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredNFTs(filtered);
    setPage(1);
    setDisplayedNFTs(filtered.slice(0, itemsPerPage));
    setHasMore(filtered.length > itemsPerPage);
  }, [nfts, searchTerm, sortBy, selectedTraits, priceRange]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          const start = nextPage * itemsPerPage;
          const end = start + itemsPerPage;
          const newItems = filteredNFTs.slice(start, end);
          
          if (newItems.length > 0) {
            setDisplayedNFTs(prev => [...prev, ...newItems]);
            setPage(nextPage);
            setHasMore(end < filteredNFTs.length);
          } else {
            setHasMore(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, loading, filteredNFTs]);

  // Update URL when filters change
  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('rarity');
    setSelectedTraits([]);
    setPriceRange([0, 10]);
  };

  return (
    <div className="min-h-screen" style={{ color: 'var(--foreground)', background: 'var(--background)' }}>
      <Nav />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Stats */}
        <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
            <h1 className="section-heading mb-6 text-center" style={{ color: 'var(--foreground)' }}>
            Collection Gallery
          </h1>
            
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-dark rounded-xl p-4 text-center">
                  <Layers className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neon-cyan">
                    {stats.totalSupply}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ape-gray)' }}>Total Supply</p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-neon-green mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neon-green">
                    {stats.uniqueHolders}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ape-gray)' }}>Owners</p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-ape-gold mx-auto mb-2" />
                  <p className="text-2xl font-bold text-ape-gold">
                    {stats.floorPrice.toFixed(2)} APE
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ape-gray)' }}>Floor Price</p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <Filter className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.listedCount}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ape-gray)' }}>Listed</p>
                </div>
              </div>
            )}

            {/* Marketplace Links */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-hero-blue" />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                  Marketplaces
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Magic Eden */}
                <a
                  href="https://magiceden.io/collections/apechain/0xa6babe18f2318d2880dd7da3126c19536048f8b0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-dark rounded-xl p-6 flex items-center justify-between group hover:border-hero-blue/70 transition-all duration-300 hover:shadow-lg hover:shadow-hero-blue/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-hero-blue/10 flex items-center justify-center group-hover:bg-hero-blue/20 transition-colors">
                      <Image 
                        src="/magiceden_icon.jpeg" 
                        alt="Magic Eden" 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                        Magic Eden
                      </h3>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-hero-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* Mintify */}
                <a
                  href="https://app.mintify.com/nft/apechain/0xa6babe18f2318d2880dd7da3126c19536048f8b0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-dark rounded-xl p-6 flex items-center justify-between group hover:border-hero-blue/70 transition-all duration-300 hover:shadow-lg hover:shadow-hero-blue/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-ape-gold/10 flex items-center justify-center group-hover:bg-ape-gold/20 transition-colors">
                      <Image 
                        src="/mintify_icon.jpeg" 
                        alt="Mintify" 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                        Mintify
                      </h3>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-ape-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* OpenSea */}
                <a
                  href="https://opensea.io/collection/apes-on-apechain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-dark rounded-xl p-6 flex items-center justify-between group hover:border-hero-blue/70 transition-all duration-300 hover:shadow-lg hover:shadow-hero-blue/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center overflow-hidden group-hover:bg-blue-500/20 transition-colors">
                      <Image
                        src="/opensea-logo.webp"
                        alt="OpenSea"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                        OpenSea
                      </h3>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </motion.div>
        </motion.div>

          {/* Placeholder below Marketplaces */}
          <motion.div
            className="glass-dark rounded-xl p-12 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Coming Soon...
            </p>
            <p className="mt-2" style={{ color: 'var(--ape-gray)' }}>
              The collection viewer is being upgraded.
            </p>
          </motion.div>

          {/* Filters */}
        {false && (
        <motion.div 
            className="glass-dark rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
            <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
              <div className="flex-1">
            <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                    placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 glass border border-white/10 rounded-lg placeholder-gray-400 focus:border-hero-blue focus:outline-none transition-colors"
                    style={{ color: 'var(--foreground)' }}
              />
                </div>
            </div>

            {/* Sort */}
              <div>
            <select
              value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rarity' | 'price-asc' | 'price-desc' | 'name')}
                  className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:border-hero-blue focus:outline-none transition-colors cursor-pointer"
                  style={{ color: 'var(--foreground)' }}
            >
              <option value="rarity">Sort by Rarity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
              <option value="name">Sort by Name</option>
            </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || sortBy !== 'rarity' || selectedTraits.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 10) && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Price Range */}
            <div className="mt-6">
              <label className="text-sm mb-2 block" style={{ color: 'var(--ape-gray)' }}>
                Price Range: {priceRange[0]} - {priceRange[1]} APE
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                  className="flex-1 h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                />
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                  className="flex-1 h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-neon-cyan"
              />
            </div>
          </div>

          {/* Trait Filters */}
          <div className="mt-6">
              <h3 className="text-sm mb-3" style={{ color: 'var(--ape-gray)' }}>Filter by Traits</h3>
            <div className="flex flex-wrap gap-2">
                {availableTraits.map(trait => (
                <button
                  key={trait}
                  onClick={() => toggleTrait(trait)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedTraits.includes(trait)
                        ? 'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan'
                        : 'glass border-2 border-white/10 hover:border-hero-blue/50'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        )}

          {/* Results Count */}
          {false && (
          <motion.div 
            className="mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p style={{ color: 'var(--ape-gray)' }}>
              Showing <span className="text-hero-blue font-semibold">{displayedNFTs.length}</span> of{' '}
              <span className="text-hero-blue font-semibold">{filteredNFTs.length}</span> NFTs
            </p>
          </motion.div>
          )}

          {/* Loading State */}
          {false && (
            loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4"></div>
                  <p style={{ color: 'var(--ape-gray)' }}>Loading collection...</p>
                </div>
              </div>
            ) : (
              <>
                {/* NFT Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                  {displayedNFTs.map((nft, index) => (
                    <NFTCard
                      key={`${nft.id}-${index}`}
                      nft={nft}
                      onClick={() => setSelectedNFT(nft)}
                      index={index}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Observer */}
                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-8">
                    <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin"></div>
                  </div>
                )}

                {/* End of Results */}
                {!hasMore && filteredNFTs.length > 0 && (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p style={{ color: 'var(--ape-gray)' }}>You&apos;ve reached the end of the collection</p>
                  </motion.div>
                )}

                {/* No Results */}
                {filteredNFTs.length === 0 && (
                  <motion.div 
                    className="text-center py-20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="text-2xl mb-4" style={{ color: 'var(--foreground)' }}>No NFTs found</p>
                    <p className="mb-6" style={{ color: 'var(--ape-gray)' }}>
                      Try adjusting your filters to see more results
                    </p>
                    <button onClick={clearFilters} className="btn-primary">
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </>
            )
          )}
        </div>
      </div>

      <Footer />
      <TokenDrawer nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
    </div>
  );
}
