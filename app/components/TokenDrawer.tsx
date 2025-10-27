'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Share2 } from 'lucide-react';
import Image from 'next/image';
import { MagicEdenNFT } from '@/lib/magic-eden';

interface TokenDrawerProps {
  nft: MagicEdenNFT | null;
  onClose: () => void;
}

export default function TokenDrawer({ nft, onClose }: TokenDrawerProps) {
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

  const handleShare = () => {
    if (navigator.share && nft) {
      navigator.share({
        title: nft.name,
        text: `Check out ${nft.name} from Apes On Ape!`,
        url: nft.magicEdenUrl,
      });
    }
  };

  return (
    <AnimatePresence>
      {nft && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] lg:w-[600px] bg-charcoal-dark border-l border-white/10 z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-charcoal-light hover:bg-neon-cyan/20 text-off-white hover:text-neon-cyan transition-all duration-300 z-10"
              aria-label="Close drawer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* NFT Image */}
              <motion.div
                className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-white/10 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>

              {/* Title & Rarity */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient bg-gradient-to-r from-neon-cyan to-neon-green mb-2">
                  {nft.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-semibold ${getRarityColor(nft.rarity)}`}>
                    #{nft.rarity} • {getRarityLabel(nft.rarity)}
                  </span>
                </div>
              </motion.div>

              {/* Price & Actions */}
              <motion.div
                className="glass-dark rounded-xl p-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-off-white/70 text-sm mb-1">Current Price</p>
                    <p className="text-2xl md:text-3xl font-bold text-neon-cyan">
                      {nft.price.toFixed(2)} <span className="text-lg">{nft.currency}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={nft.magicEdenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Magic Eden
                  </a>
                  <button
                    onClick={handleShare}
                    className="btn-secondary px-4"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Traits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-display font-semibold text-neon-cyan mb-4">
                  Traits
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {nft.traits.map((trait, index) => (
                    <motion.div
                      key={index}
                      className="glass-dark rounded-lg p-3 border border-white/10 hover:border-neon-cyan/30 transition-colors duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                    >
                      <p className="text-off-white/50 text-xs mb-1">{trait.name}</p>
                      <p className="text-off-white font-semibold text-sm">{trait.value}</p>
                      <p className="text-neon-green text-xs mt-1">
                        {trait.rarity}% rarity
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Owner Info */}
              {nft.owner && (
                <motion.div
                  className="mt-6 glass-dark rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-sm font-semibold text-off-white/70 mb-2">
                    Owner
                  </h3>
                  <p className="text-off-white font-mono text-xs break-all">
                    {nft.owner}
                  </p>
                </motion.div>
              )}

              {/* Last Sale */}
              {nft.lastSale && (
                <motion.div
                  className="mt-4 glass-dark rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="text-sm font-semibold text-off-white/70 mb-2">
                    Last Sale
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-off-white">
                      {nft.lastSale.price.toFixed(2)} {nft.lastSale.currency}
                    </p>
                    <p className="text-off-white/50 text-xs">
                      {new Date(nft.lastSale.date).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

