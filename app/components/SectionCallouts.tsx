'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Music, Palette, Gamepad2, Hammer } from 'lucide-react';

export default function SectionCallouts() {
  const callouts = [
    {
      icon: Music,
      title: 'Musicians',
      description: 'Share your sound. Collaborate with fellow apes. Drop tracks on our SoundCloud.',
      cta: 'Explore Sound',
      href: '/sound',
      gradient: 'from-hero-blue to-blue-600',
      iconColor: 'text-hero-blue',
    },
    {
      icon: Palette,
      title: 'Artists',
      description: 'Showcase your work. Join a community that celebrates creativity and visual expression.',
      cta: 'View Collection',
      href: '/collection',
      gradient: 'from-ape-gold to-yellow-600',
      iconColor: 'text-ape-gold',
    },
    {
      icon: Gamepad2,
      title: 'Game Devs',
      description: 'Build experiences. Push boundaries. Play in our arcade and contribute your own games.',
      cta: 'Visit Arcade',
      href: 'https://arcade.apesonape.io',
      gradient: 'from-purple-500 to-purple-700',
      iconColor: 'text-purple-500',
    },
    {
      icon: Hammer,
      title: 'Builders',
      description: 'Create tools. Ship projects. Connect with a community that values making things.',
      cta: 'Join Discord',
      href: 'https://discord.gg/gVmqW6SExU',
      gradient: 'from-green-500 to-green-700',
      iconColor: 'text-green-500',
    },
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      {/* Background decoration removed for cleaner look */}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-heading mb-6">
            Join the Studio
          </h2>
          <p className="text-off-white/70 text-lg md:text-xl max-w-3xl mx-auto">
            An open creative space for everyone. Whether you make music, art, games, or tools—
            there&apos;s a place for you here.
          </p>
        </motion.div>

        {/* Callout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {callouts.map((callout, index) => (
            <motion.div
              key={callout.title}
              className="card group relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              {/* Subtle Background (on hover) */}
              <div className="absolute inset-0 bg-hero-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl ${callout.iconColor === 'text-hero-blue' ? 'bg-hero-blue' : callout.iconColor === 'text-ape-gold' ? 'bg-ape-gold' : callout.iconColor === 'text-purple-500' ? 'bg-purple-500' : 'bg-green-500'} mb-4 shadow-lg`}>
                  <callout.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                  {callout.title}
                </h3>

                {/* Description */}
                <p className="text-muted mb-6 leading-relaxed">
                  {callout.description}
                </p>

                {/* CTA */}
                <a
                  href={callout.href}
                  target={callout.href.startsWith('http') ? '_blank' : undefined}
                  rel={callout.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`inline-flex items-center gap-2 text-sm font-semibold ${callout.iconColor} group-hover:underline`}
                >
                  {callout.cta}
                  <span>→</span>
                </a>
              </div>

              {/* Decorative corner */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-hero-blue/10 opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-muted mb-6 text-lg">
            Make weird. Make loud. Make games. <span className="text-hero-blue font-bold">Apes Together Strong!</span>
          </p>
          <a
            href="https://discord.gg/gVmqW6SExU"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            Join Our Discord
          </a>
        </motion.div>
      </div>
    </section>
  );
}

