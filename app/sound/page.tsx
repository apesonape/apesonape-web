'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Music2 } from 'lucide-react';
import { SiSoundcloud } from 'react-icons/si';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function SoundPage() {

  return (
    <div className="min-h-screen" style={{ color: 'var(--foreground)', background: 'var(--background)' }}>
      <Nav />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="section-heading mb-4" style={{ color: 'var(--foreground)' }}>
              Sound Studio
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--ape-gray)' }}>
              Discover music from talented artists in the Apes On Ape community.
            </p>
          </motion.div>

          {/* Featured Playlist - Dr. DIBS */}
          <motion.div
            className="glass-dark rounded-2xl p-8 md:p-12 mb-12 border border-hero-blue/30"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Music2 className="w-6 h-6 text-ape-gold" />
              <h2 className="text-2xl md:text-3xl font-bold text-ape-gold">
                Featured Playlist
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                  Saint Dank
                </h3>
                <p className="text-xl mb-6" style={{ color: 'var(--ape-gray)' }}>
                  by SmokeThatDank
                </p>
                
                <div className="mb-6">
                  <h4 className="text-hero-blue font-semibold mb-2">About this playlist:</h4>
                  <p className="leading-relaxed mb-4" style={{ color: 'var(--foreground)' }}>
                    A high-energy set by SmokeThatDank, crafted for the Apes On Ape community.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href="https://soundcloud.com/apesonape/sets/saint-dank-by-smokethatdank"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Play on SoundCloud
                  </a>
                  <a
                    href="https://soundcloud.com/apesonape"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <SiSoundcloud className="w-5 h-5" />
                    More from Apes On Ape
                  </a>
                </div>
              </div>

              {/* SoundCloud Embed */}
              <div className="relative">
                <iframe
                  width="100%"
                  height="450"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/apesonape/sets/saint-dank-by-smokethatdank&color=%230054f9&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                  className="rounded-xl border border-white/10"
                ></iframe>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <a 
                    href="https://soundcloud.com/apesonape" 
                    title="Apes on Ape" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-hero-blue transition-colors"
                  >
                    Apes on Ape
                  </a> · 
                  <a 
                    href="https://soundcloud.com/apesonape/sets/saint-dank-by-smokethatdank" 
                    title="Saint Dank by SmokeThatDank" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-hero-blue transition-colors"
                  >
                    Saint Dank by SmokeThatDank
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
