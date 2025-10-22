'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiApplearcade, SiSoundcloud } from 'react-icons/si';

export default function Footer() {
  const currentYear = 2024;

  const socialLinks = [
    {
      name: 'Discord',
      href: 'https://discord.gg/gVmqW6SExU',
      icon: '/discord-white.png',
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com/apechainapes',
      icon: '/x-white.png',
    },
  ];

  const marketplaceLinks = [
    {
      name: 'Magic Eden',
      href: 'https://magiceden.io/collections/apechain/0xa6babe18f2318d2880dd7da3126c19536048f8b0',
      icon: '/magiceden_icon.jpeg',
    },
    {
      name: 'Mintify',
      href: 'https://app.mintify.com/nft/apechain/0xa6babe18f2318d2880dd7da3126c19536048f8b0',
      icon: '/mintify_icon.jpeg',
    },
    {
      name: 'OpenSea',
      href: 'https://opensea.io/collection/apes-on-apechain',
      icon: '/opensea-logo.webp',
    },
  ];

  const creativeLinks = [
    {
      name: 'SoundCloud',
      href: 'https://soundcloud.com/apesonape',
      IconComponent: SiSoundcloud,
    },
  ];

  const internalLinks = [
    { name: 'Home', href: '/' },
    { name: 'Collection', href: '/collection' },
    { name: 'Sound', href: '/sound' },
    { name: 'Team', href: '/team' },
  ];

  return (
    <footer className="relative bg-charcoal-dark border-t border-white/10 mt-20">
      {/* Grain texture overlay */}
      <div className="grain-texture absolute inset-0 opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10">
                <Image
                  src="/apechain.png"
                  alt="Apechain Logo"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-xl font-display font-bold text-gradient bg-gradient-to-r from-neon-cyan to-neon-green">
                Apes On Ape
              </span>
            </Link>
            <p className="text-off-white/70 text-sm leading-relaxed">
              A playground for musicians, artists, game devs, and builders. Make weird. Make loud. Make games.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-charcoal-light border border-white/10 hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all duration-300"
                  aria-label={link.name}
                >
                  <div className="relative w-5 h-5">
                    <Image
                      src={link.icon}
                      alt={link.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-neon-cyan font-semibold mb-4">Navigate</h3>
            <ul className="space-y-2">
              {internalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-off-white/70 hover:text-neon-cyan transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marketplaces Column */}
          <div>
            <h3 className="text-neon-cyan font-semibold mb-4">Marketplaces</h3>
            <ul className="space-y-2">
              {marketplaceLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-off-white/70 hover:text-neon-cyan transition-colors duration-300 text-sm"
                  >
                    <div className="relative w-4 h-4 flex-shrink-0">
                      <Image
                        src={link.icon}
                        alt={link.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Creative Hub Column */}
          <div>
            <h3 className="text-neon-cyan font-semibold mb-4">Creative Hub</h3>
            <ul className="space-y-2">
              {creativeLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-off-white/70 hover:text-neon-cyan transition-colors duration-300 text-sm"
                  >
                    <link.IconComponent className="w-4 h-4 flex-shrink-0" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-off-white/50 text-sm">
            © {currentYear} Apes On Ape. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://apescan.io/address/0xa6babe18f2318d2880dd7da3126c19536048f8b0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-off-white/50 hover:text-neon-cyan transition-colors duration-300"
            >
              Contract
            </a>
            <span className="text-off-white/30">•</span>
            <span className="text-off-white/50">Built on Apechain</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

