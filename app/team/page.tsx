'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Twitter } from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  profilePic?: string;
  twitter?: string;
  website?: string;
  artworks?: string[];
  featuredVideo?: string;
  type: 'artist' | 'dev';
}

const teamMembers: TeamMember[] = [
  {
    name: 'Erika Rand',
    role: 'Multimedia Artist & AI Art Creator',
    bio: 'Born in Costa Rica, Erika spent her first year in an orphanage surrounded by the turquoise waters and rain forests of Manuel Antonio. After earning degrees in fine art, anthropology, and Spanish, she moved to New York City, studying at Parsons School of Design and the New York Film Academy. She worked as an art director for Martha Stewart Living, Tiffany & Co., and the Metropolitan Museum of Art. For the past seven years, she has been creatively collaborating with elders from the Hopi tribe, creating intimate artistic cross-cultural collaborations. Her work challenges postmodernist skepticism to re-embrace nuanced universality and the value of emotion, making tangible the gift of life on Earth and exposing authentic moments of humanity\'s light.',
    profilePic: '/team/erika-rand-pfp.jpg',
    twitter: 'https://x.com/erikarand',
    website: 'https://www.erikarand.com/',
    artworks: [
      '/team/erika-rand-1.jpg',
      '/team/erika-rand-2.jpg',
    ],
    type: 'artist',
  },
  {
    name: 'Gorkulus',
    role: 'Musician & Audiovisual Artist',
    bio: 'A visionary musician and audiovisual artist exploring the intersection of sound and vision through synaesthetic music. Working with modular synthesis, generative systems, and AI, Gorkulus creates immersive audiovisual experiences that challenge the boundaries between hearing and seeing. His work transforms sonic landscapes into visual poetry, crafting multisensory journeys that blur the lines between the auditory and visual realms.',
    profilePic: '/team/gorkulus-pfp.jpg',
    twitter: 'https://x.com/gorkulus',
    website: 'https://gallery.so/gorkulus',
    featuredVideo: 'https://x.com/i/status/1905656324098289852',
    artworks: [],
    type: 'artist',
  },
  {
    name: 'Sibeclop',
    role: 'Independent Artist & Animator',
    bio: 'An independent artist working across physical media, digital art, and animation. His creative journey is deeply personal, shaped by moments of uncertainty, and guided by the hope that his work can make the world just a little better through art. His work is known for bold black linework and a signature use of violet and green. Inspired by cartoons and manga, he creates within the world of The One-Eyed Guys—a universe shaped by themes of passion, persistence, and self-discovery. Among its many characters is Misteye, a figure who wanders through uncertainty, introspection, and unanswered questions.',
    profilePic: '/team/sibeclop-pfp.jpg',
    twitter: 'https://x.com/SibeclopNFT',
    website: 'https://sibeclop.myportfolio.com/',
    artworks: ['/team/sibeclop-1.jpg', '/team/sibeclop-2.jpg'],
    type: 'artist',
  },
  {
    name: 'smokethatdank1',
    role: 'Main Developer & Community Influencer',
    bio: 'The driving force behind the Apes On Ape community, bringing together artists, developers, and builders in the Web3 space. Leading the vision and development of the Apes On Ape ecosystem, fostering a creative playground for musicians, artists, game developers, and innovators on ApeChain.',
    profilePic: '/team/smoke-pfp.jpg',
    twitter: 'https://x.com/smokethatdank1',
    type: 'dev',
  },
  {
    name: 'ApeProfessore',
    role: 'Web & Game Developer',
    bio: 'A skilled web and game developer bringing technical expertise to the Apes On Ape community. Building interactive experiences and innovative solutions that push the boundaries of what\'s possible in the Web3 gaming and NFT space.',
    profilePic: '/team/apeprofessore-pfp.jpg',
    twitter: 'https://x.com/ApeProfessore',
    type: 'dev',
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen" style={{ color: 'var(--foreground)', background: 'var(--background)' }}>
      <Nav />

      <div className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-24 md:py-32">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="section-heading mb-4" style={{ color: 'var(--foreground)' }}>
              Meet the Team
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--ape-gray)' }}>
              The creative minds and builders behind Apes On Ape—a collective of artists, developers, and visionaries shaping the future of digital creativity.
            </p>
          </motion.div>

          {/* Artists Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-hero-blue">
              Featured Artists
            </h2>

            <div className="space-y-20">
              {teamMembers.filter(member => member.type === 'artist').map((member, index) => (
                <motion.div
                  key={member.name}
                  className="glass-dark rounded-2xl p-8 md:p-12 border border-hero-blue/30"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                >
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="flex items-start gap-4 mb-6">
                        {member.profilePic && (
                          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-hero-blue/50 flex-shrink-0">
                            <Image
                              src={member.profilePic}
                              alt={`${member.name} profile`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                            {member.name}
                          </h3>
                          <p className="text-xl text-hero-blue">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      
                      <p className="leading-relaxed mb-6" style={{ color: 'var(--foreground)' }}>
                        {member.bio}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {member.website && (
                          <a
                            href={member.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Visit Website
                          </a>
                        )}
                        {member.twitter && (
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary flex items-center gap-2"
                          >
                            <Twitter className="w-4 h-4" />
                            Follow on X
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Featured Video */}
                    {member.featuredVideo && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-hero-blue/30 bg-black/40">
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-16 h-16 rounded-full bg-hero-blue/20 flex items-center justify-center mb-4">
                            <svg 
                              className="w-8 h-8 text-hero-blue ml-1" 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Featured Audiovisual Work</h4>
                          <p className="mb-4" style={{ color: 'var(--ape-gray)' }}>Experience synaesthetic music in motion</p>
                          <a
                            href={member.featuredVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary inline-flex items-center gap-2"
                          >
                            Watch on X
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Artwork Preview */}
                    {member.artworks && member.artworks.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {member.artworks.slice(0, 4).map((artwork, idx) => (
                          <motion.div
                            key={idx}
                            className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={artwork}
                              alt={`${member.name} artwork ${idx + 1}`}
                              fill
                              className="object-cover group-hover:opacity-80 transition-opacity"
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Developers Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-hero-blue">
              Core Team
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {teamMembers.filter(member => member.type === 'dev').map((member, index) => (
                <motion.div
                  key={member.name}
                  className="glass-dark rounded-2xl p-8 border border-hero-blue/30"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {member.profilePic && (
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-hero-blue/50 flex-shrink-0">
                        <Image
                          src={member.profilePic}
                          alt={`${member.name} profile`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                        {member.name}
                      </h3>
                      <p className="text-lg text-hero-blue">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  
                  <p className="leading-relaxed mb-6" style={{ color: 'var(--foreground)' }}>
                    {member.bio}
                  </p>

                  {member.twitter && (
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <Twitter className="w-4 h-4" />
                      Follow on X
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="glass-dark rounded-2xl p-8 md:p-12 border border-hero-blue/30 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Join the Community
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--foreground)' }}>
                Want to collaborate or be part of the Apes On Ape family? Connect with us on Discord and be part of something special.
              </p>
              <a
                href="https://discord.gg/apesonape"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                Join Discord
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

