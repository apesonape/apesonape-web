'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Maximize2, Minimize2 } from 'lucide-react';
import { MagicEdenNFT } from '@/lib/magic-eden';

interface ResponsiveNFTGridProps {
  nfts: MagicEdenNFT[];
  loading: boolean;
  onNFTSelect: (nft: MagicEdenNFT) => void;
}

const ResponsiveNFTGrid: React.FC<ResponsiveNFTGridProps> = ({ 
  nfts, 
  loading, 
  onNFTSelect 
}) => {
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getGridCols = () => {
    if (viewMode === 'list') return 'grid-cols-1';
    
    switch (gridSize) {
      case 'small':
        return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
      case 'medium':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
      case 'large':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
    }
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

  // Handle fullscreen toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F11' || (e.key === 'Escape' && isFullscreen)) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ape-gold/30 border-t-ape-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 p-4 bg-black/20 rounded-lg border border-ape-gold/30">
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-ape-gold/20 border border-ape-gold/50' 
                  : 'bg-black/20 border border-ape-gold/30 hover:bg-ape-gold/10'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-ape-gold/20 border border-ape-gold/50' 
                  : 'bg-black/20 border border-ape-gold/30 hover:bg-ape-gold/10'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Grid Size Controls */}
          {viewMode === 'grid' && (
            <div className="flex gap-2">
              <button
                onClick={() => setGridSize('small')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  gridSize === 'small'
                    ? 'bg-ape-gold/20 text-ape-gold border border-ape-gold/50'
                    : 'bg-black/20 text-gray-300 border border-ape-gold/30 hover:bg-ape-gold/10'
                }`}
              >
                Small
              </button>
              <button
                onClick={() => setGridSize('medium')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  gridSize === 'medium'
                    ? 'bg-ape-gold/20 text-ape-gold border border-ape-gold/50'
                    : 'bg-black/20 text-gray-300 border border-ape-gold/30 hover:bg-ape-gold/10'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setGridSize('large')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  gridSize === 'large'
                    ? 'bg-ape-gold/20 text-ape-gold border border-ape-gold/50'
                    : 'bg-black/20 text-gray-300 border border-ape-gold/30 hover:bg-ape-gold/10'
                }`}
              >
                Large
              </button>
            </div>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-ape-gold/20 hover:bg-ape-gold/30 transition-colors border border-ape-gold/30"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (F11)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* NFT Grid */}
      <motion.div 
        className={`grid ${getGridCols()} gap-4`}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {nfts.map((nft, index) => (
            <motion.div
              key={nft.id}
              className={`group cursor-pointer ${
                viewMode === 'grid' 
                  ? 'aspect-square' 
                  : 'flex items-center gap-4 p-4 bg-black/20 rounded-lg border border-ape-gold/20 hover:border-ape-gold/50'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNFTSelect(nft)}
            >
              {viewMode === 'grid' ? (
                <div className="relative h-full bg-gradient-to-br from-ape-gold/20 to-ape-gold/5 rounded-lg overflow-hidden border border-ape-gold/30">
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="font-semibold truncate">{nft.name}</div>
                    <div className="text-ape-gold">{nft.price.toFixed(2)} {nft.currency}</div>
                    <div className={`text-xs ${getRarityColor(nft.rarity)}`}>
                      #{nft.rarity} {getRarityLabel(nft.rarity)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 w-full">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{nft.name}</h3>
                    <p className="text-ape-gold">{nft.price.toFixed(2)} {nft.currency}</p>
                    <p className={`text-sm ${getRarityColor(nft.rarity)}`}>
                      #{nft.rarity} {getRarityLabel(nft.rarity)}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Grid Info */}
      <div className="mt-6 text-center text-gray-400">
        <p>Showing {nfts.length} NFTs • {viewMode === 'grid' ? `${gridSize} grid` : 'list view'}</p>
        {isFullscreen && (
          <p className="text-sm mt-1">Press F11 or Escape to exit fullscreen</p>
        )}
      </div>
    </div>
  );
};

export default ResponsiveNFTGrid;
