'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { Wand2, ImagePlus, Shirt } from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function CreativeHubPage() {
  return (
    <div className="min-h-screen relative">
      <Nav />
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)' }} />
        <div className="absolute top-1/3 -right-16 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.16), transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-hero-blue/10 border border-hero-blue/30 mb-3">
            <Wand2 className="w-4 h-4 text-hero-blue" />
            <span className="text-xs text-hero-blue">Tools</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-hero-blue">Tools</h1>
          <p className="text-off-white/80 max-w-3xl mt-4">
            Welcome to the creative hub. A place where you can create various type of content with your NFT — all in the AoA style.
          </p>
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
            <Link href="/creative/banners" className="inline-flex items-center gap-3 btn-primary">
            <ImagePlus className="w-5 h-5" />
            Generate Banner
          </Link>
        </motion.div>

        {/* Banner Generator small card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Wardrobe card */}
          <div className="group rounded-xl border border-white/10 bg-black/30 hover:bg-black/40 transition-colors p-5 flex flex-col">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-hero-blue/10 border border-hero-blue/30 text-hero-blue text-xs w-fit mb-3">
              <Shirt className="w-4 h-4" />
              <span>Beta</span>
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Wardrobe</h3>
            <p className="text-sm text-off-white/80 mb-3">Add clothes and customize your Ape with overlay layers. Upload transparent PNGs and position them.</p>
            <Link href="/creative/wardrobe" className="btn-secondary inline-flex items-center w-fit">Customize Ape</Link>
          </div>

          <div className="group rounded-xl border border-white/10 bg-black/30 hover:bg-black/40 transition-colors p-5 flex flex-col">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-hero-blue/10 border border-hero-blue/30 text-hero-blue text-xs w-fit mb-3">
              <ImagePlus className="w-4 h-4" />
              <span>Available</span>
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Banner Generator</h3>
            {/* Image preview removed */}
            <p className="text-sm text-off-white/80 mb-3">Create a customized social banner from your NFT.</p>
            <Link href="/creative/banners" className="btn-secondary inline-flex items-center w-fit">Open</Link>
          </div>

          {/* Creator Spotlight card removed */}

          <div className="group rounded-xl border border-white/10 bg-black/30 hover:bg-black/40 transition-colors p-5 flex flex-col">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-hero-blue/10 border border-hero-blue/30 text-hero-blue text-xs w-fit mb-3">
              <span>Preview</span>
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>More to come</h3>
            <div className="relative w-full rounded-lg overflow-hidden border border-white/10 mb-3 aspect-[3/1]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.18),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.16),transparent_40%)]" />
              <div className="absolute inset-0 grid grid-cols-12 opacity-10">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="border-l border-white/10" />
                ))}
              </div>
            </div>
            <button disabled className="px-3 py-2 rounded-lg border border-white/10 text-off-white/50 cursor-not-allowed w-fit">Soon</button>
          </div>
        </motion.div>

      </div>

      <Footer />
    </div>
  );
}


