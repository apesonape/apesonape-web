'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  title?: string;
  subtitle?: string;
  showCTAs?: boolean;
}

export default function Hero({ 
  title = "Apes On Ape",
  subtitle = "Apes on Ape is the wild frontier of creation — where sound, art, code, and vision collide. No rules. No limits. Just creators building the future together.",
  showCTAs = true 
}: HeroProps) {
  const ctaButtons = [
    {
      label: 'Join the Movement',
      href: '/collection',
      primary: true,
    },
    {
      label: 'Explore Sound',
      href: '/sound',
      primary: false,
    },
  ];

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-neon-cyan/20 via-transparent to-transparent"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-neon-green/10 via-transparent to-transparent"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Media - Parallax */}
      <motion.div
        className="absolute bottom-0 left-0 w-full md:w-3/5 h-full z-10"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div className="relative w-full h-full">
          <video
            src="/home-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-contain object-bottom-left"
          />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-end">
          <motion.div
            className="w-full md:w-1/2 rounded-2xl p-8 md:p-12"
            style={{ 
              background: 'var(--card-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-color)'
            }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {/* Title */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-hero-blue"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl mb-8 leading-relaxed"
              style={{ color: 'var(--foreground)' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              {subtitle}
            </motion.p>

            {/* CTAs */}
            {showCTAs && (
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                {ctaButtons.map((button, index) => (
                  <motion.a
                    key={button.label}
                    href={button.href}
                    target={button.href.startsWith('http') ? '_blank' : undefined}
                    rel={button.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={button.primary ? 'btn-primary' : 'btn-secondary'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.3 + index * 0.1 }}
                  >
                    {button.label}
                  </motion.a>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl" />
    </section>
  );
}

