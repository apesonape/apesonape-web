'use client';

import React, { useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Footer from './components/Footer';
import TokenDrawer from './components/TokenDrawer';
import SectionCallouts from './components/SectionCallouts';
import { MagicEdenNFT } from '@/lib/magic-eden';

export default function HomePage() {
  const [selectedNFT, setSelectedNFT] = useState<MagicEdenNFT | null>(null);

  return (
    <div className="min-h-screen" style={{ color: 'var(--foreground)', background: 'var(--background)' }}>
      {/* Fixed Navigation */}
      <Nav />

      {/* Hero Section */}
      <div className="pt-16 md:pt-20">
        <Hero />
      </div>


      {/* Section Callouts */}
      <SectionCallouts />

      {/* Footer */}
      <Footer />

      {/* Token Drawer */}
      <TokenDrawer nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
    </div>
  );
}
