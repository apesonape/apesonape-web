'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check, Grid3X3, Volume2, VolumeX } from 'lucide-react';
import { Raleway } from 'next/font/google';
import { SiApplearcade, SiSoundcloud } from "react-icons/si";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { magicEdenAPI, MagicEdenNFT } from '@/lib/magic-eden';
import ResponsiveNFTGrid from '@/app/components/ResponsiveNFTGrid';

const raleway = Raleway({ subsets: ['latin'] });

// This will be replaced with real Magic Eden data

const NFTLandingPage = () => {
  const contractAddress = "0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0";
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState<'hero' | 'collection'>('hero');
  const [selectedNFT, setSelectedNFT] = useState<MagicEdenNFT | null>(null);
  const [nfts, setNfts] = useState<MagicEdenNFT[]>([]);
  const [loading, setLoading] = useState(false);

  const getImagePath = (path: string) => {
    return path;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 1000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = contractAddress;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 1000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  // Load NFTs when switching to collection view
  useEffect(() => {
    if (currentView === 'collection' && nfts.length === 0) {
      const loadNFTs = async () => {
        setLoading(true);
        try {
          const fetchedNFTs = await magicEdenAPI.getRandomNFTs(32);
          setNfts(fetchedNFTs);
        } catch (error) {
          console.error('Error loading NFTs:', error);
          // Fallback to mock data
          const mockNFTs = await magicEdenAPI.getMockNFTs(32);
          setNfts(mockNFTs);
        } finally {
          setLoading(false);
        }
      };
      loadNFTs();
    }
  }, [currentView, nfts.length]);

  const NFTGrid = () => (
    <ResponsiveNFTGrid 
      nfts={nfts}
      loading={loading}
      onNFTSelect={setSelectedNFT}
    />
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-hero-blue via-purple-900 to-black text-white ${raleway.className}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('/casino-bg.png')] bg-cover bg-center bg-no-repeat opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-hero-blue/30 via-purple-900/20 to-black/50" />
      
      {/* Navigation */}
      <nav className="relative z-50 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-2 md:gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img 
              src={getImagePath('/apechain.png')}
              alt="Apechain Logo"
              className="h-6 md:h-8 w-auto"
            />
            <span className="text-lg md:text-xl font-bold text-ape-gold">Apes On Ape</span>
          </motion.div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Link 
              href="/collection"
              className="px-2 md:px-3 py-1 md:py-2 bg-ape-gold/20 hover:bg-ape-gold/30 rounded-lg transition-colors border border-ape-gold/30 text-ape-gold font-semibold text-xs md:text-sm"
            >
              Collection
            </Link>
            <Link 
              href="/music"
              className="px-2 md:px-3 py-1 md:py-2 bg-ape-gold/20 hover:bg-ape-gold/30 rounded-lg transition-colors border border-ape-gold/30 text-ape-gold font-semibold text-xs md:text-sm"
            >
              Music
            </Link>
            <button
              onClick={toggleMusic}
              className="p-1.5 md:p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
              title="Toggle Music"
            >
              {isPlaying ? <VolumeX className="w-3 h-3 md:w-4 md:h-4" /> : <Volume2 className="w-3 h-3 md:w-4 md:h-4" />}
            </button>
            <button
              onClick={() => setCurrentView(currentView === 'hero' ? 'collection' : 'hero')}
              className="p-1.5 md:p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
              title="Toggle Grid View"
            >
              <Grid3X3 className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {currentView === 'hero' ? (
          <motion.div
            key="hero"
            className="w-full flex justify-between relative pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
        {/* Left side - Hero Image */}
        <div className="flex-1">
              <motion.img 
            src={getImagePath('/AoA-placeholder-apecoinblue.jpg')}
            alt="Apes on Ape"
            className="absolute bottom-0 left-0 w-3/4 h-auto object-contain object-bottom"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
          />
        </div>
        
            {/* Right side - Content */}
            <div className="absolute right-0 min-w-[300px] md:min-w-[400px] w-1/3 md:h-[73%] h-[75%] p-4 md:p-8">
              <motion.div 
                className="bg-black/20 backdrop-blur-md h-full p-4 md:p-8 rounded-2xl border border-ape-gold/30"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {/* Title */}
                <motion.h1 
                  className="text-4xl font-bold mb-4 text-gradient bg-gradient-to-r from-ape-gold to-yellow-400 bg-clip-text text-transparent"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  Apes On Ape
                </motion.h1>
                
                <motion.p 
                  className="text-gray-300 mb-8 text-lg"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  The most exclusive NFT collection on Apechain. Join the revolution.
                </motion.p>

                {/* Marketplace Links */}
                <div className="space-y-4 mb-12">
                  {[
                    { href: "https://magiceden.us/collections/apechain/0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0", icon: "/magiceden_icon.jpeg", name: "Magic Eden" },
                    { href: "https://apechain.mintify.xyz/apechain/0xa6babe18f2318d2880dd7da3126c19536048f8b0", icon: "/mintify_icon.jpeg", name: "Mintify" },
                    { href: "https://arcade.apesonape.io", icon: null, name: "Arcade", iconComponent: SiApplearcade },
                    { href: "https://soundcloud.com/apesonape", icon: null, name: "SoundCloud", iconComponent: SiSoundcloud }
                  ].map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                      className="flex items-center justify-between bg-black/20 hover:bg-ape-gold/20 p-4 transition-all duration-300 rounded-lg border border-ape-gold/20 hover:border-ape-gold/50"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
                      whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                        {link.icon ? (
                  <img 
                            src={getImagePath(link.icon)}
                            alt={link.name} 
                    className="w-6 h-6"
                  />
                        ) : link.iconComponent ? (
                          <link.iconComponent className="w-6 h-6 text-ape-gold" />
                        ) : null}
                        <span className="font-medium text-white">{link.name}</span>
                </div>
                      <ExternalLink className="w-5 h-5 text-ape-gold" />
                    </motion.a>
                  ))}
            </div>
            
            {/* Contract Address */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                >
                  <div className="bg-black/20 p-4 rounded-lg border border-ape-gold/30">
                    <h2 className="text-sm font-medium mb-2 text-ape-gold">Contract Address</h2>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm break-all text-white flex-grow">
                    {contractAddress}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                        className="p-1 hover:bg-ape-gold/20 rounded-md transition-colors relative"
                    title="Copy address"
                  >
                    {showCopyFeedback ? (
                          <Check className="w-4 h-4 text-ape-gold opacity-100 transition-opacity duration-200 ease-out" />
                    ) : (
                          <Copy className="w-4 h-4 text-ape-gold" />
                    )}
                  </button>
                  <a 
                    href="https://apescan.io/address/0xa6babe18f2318d2880dd7da3126c19536048f8b0"
                    target="_blank"
                    rel="noopener noreferrer"
                        className="p-1 hover:bg-ape-gold/20 rounded-md transition-colors"
                    title="View on Apescan"
                  >
                    <img 
                      src={getImagePath('/chain-light.svg')}
                      alt="View on Apescan"
                      className="w-5 h-5"
                    />
                  </a>
                </div>
              </div>
                </motion.div>
              </motion.div>
        </div>

        {/* Social Links */}
        <div className="absolute bottom-8 sm:left-8 right-8 flex flex-col gap-4 sm:items-start items-center">
              <motion.a 
            href="https://x.com/apechainapes"
            target="_blank"
            rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center hover:bg-ape-gold/20 rounded-full transition-colors bg-black/20 backdrop-blur-sm border border-ape-gold/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
          >
            <img 
              src={getImagePath('/x-white.png')}
              alt="Follow us on X"
              className="w-5 h-5"
            />
              </motion.a>
              <motion.a 
            href="https://discord.gg/gVmqW6SExU"
            target="_blank"
            rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center hover:bg-ape-gold/20 rounded-full transition-colors bg-black/20 backdrop-blur-sm border border-ape-gold/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
          >
            <img 
              src={getImagePath('/discord-white.png')}
              alt="Join our Discord"
              className="w-6 h-5"
            />
              </motion.a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collection"
            className="w-full p-8 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.h2 
                className="text-4xl font-bold mb-8 text-center text-gradient bg-gradient-to-r from-ape-gold to-yellow-400 bg-clip-text text-transparent"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Collection Gallery
              </motion.h2>
              <NFTGrid />
        </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT Modal */}
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
              className="bg-gradient-to-br from-black/90 to-purple-900/90 p-8 rounded-2xl border border-ape-gold/30 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedNFT.image} 
                alt={selectedNFT.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className="text-2xl font-bold text-ape-gold mb-2">{selectedNFT.name}</h3>
              <div className="space-y-2 text-white">
                <p><span className="text-ape-gold">Price:</span> {selectedNFT.price.toFixed(2)} {selectedNFT.currency}</p>
                <p><span className="text-ape-gold">Rarity:</span> #{selectedNFT.rarity}</p>
                <p><span className="text-ape-gold">Traits:</span> {selectedNFT.traits.map(trait => trait.value).join(', ')}</p>
        </div>
              <button
                onClick={() => setSelectedNFT(null)}
                className="mt-4 w-full bg-ape-gold text-black py-2 rounded-lg font-semibold hover:bg-ape-gold/80 transition-colors"
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

export default NFTLandingPage;