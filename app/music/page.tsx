'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Music, Headphones } from 'lucide-react';
import { SiSoundcloud } from 'react-icons/si';
import Link from 'next/link';

// Mock music data - in production, this would come from SoundCloud API
const mockTracks = [
  {
    id: 1,
    title: "Ape Vibes #1",
    artist: "Apes On Ape",
    duration: "3:45",
    cover: "/AoA-placeholder-apecoinblue.jpg",
    soundcloudUrl: "https://soundcloud.com/apesonape",
    isSpotlight: true,
    description: "The monthly spotlight track featuring the best of Apes On Ape music."
  },
  {
    id: 2,
    title: "Chain Reaction",
    artist: "Apes On Ape",
    duration: "4:12",
    cover: "/AoA-placeholder-apecoinblue.jpg",
    soundcloudUrl: "https://soundcloud.com/apesonape",
    isSpotlight: false,
    description: "A deep dive into the blockchain beats."
  },
  {
    id: 3,
    title: "Golden Hour",
    artist: "Apes On Ape",
    duration: "3:28",
    cover: "/AoA-placeholder-apecoinblue.jpg",
    soundcloudUrl: "https://soundcloud.com/apesonape",
    isSpotlight: false,
    description: "Chill vibes for the golden moments."
  }
];

const MusicPage = () => {
  const [currentTrack, setCurrentTrack] = useState(mockTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(225); // 3:45 in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipForward = () => {
    const currentIndex = mockTracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % mockTracks.length;
    setCurrentTrack(mockTracks[nextIndex]);
    setCurrentTime(0);
  };

  const handleSkipBack = () => {
    const currentIndex = mockTracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? mockTracks.length - 1 : currentIndex - 1;
    setCurrentTrack(mockTracks[prevIndex]);
    setCurrentTime(0);
  };

  const handleTrackSelect = (track: typeof mockTracks[0]) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-hero-blue via-purple-900 to-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/casino-bg.png')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-hero-blue/20 via-purple-900/30 to-black/60" />
      
      {/* Navigation */}
      <nav className="relative z-50 p-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img 
              src="/apechain.png"
              alt="Apechain Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-ape-gold">Apes On Ape</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="px-4 py-2 bg-ape-gold/20 hover:bg-ape-gold/30 rounded-lg transition-colors border border-ape-gold/30"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-ape-gold to-yellow-400 bg-clip-text text-transparent">
            Music Spotlight
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the sounds of Apes On Ape. Monthly spotlights and continuous radio streaming.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-ape-gold/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {/* Track Info */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-ape-gold/30">
                  <img 
                    src={currentTrack.cover} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-ape-gold mb-2">{currentTrack.title}</h2>
                  <p className="text-gray-300 mb-2">{currentTrack.artist}</p>
                  <p className="text-sm text-gray-400">{currentTrack.description}</p>
                </div>
                {currentTrack.isSpotlight && (
                  <div className="bg-ape-gold/20 px-3 py-1 rounded-full border border-ape-gold/50">
                    <span className="text-ape-gold text-sm font-semibold">⭐ Spotlight</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-ape-gold to-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <button
                  onClick={handleSkipBack}
                  className="p-3 rounded-full bg-ape-gold/20 hover:bg-ape-gold/30 transition-colors"
                >
                  <SkipBack className="w-6 h-6 text-ape-gold" />
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="p-4 rounded-full bg-ape-gold hover:bg-ape-gold/80 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-black" />
                  ) : (
                    <Play className="w-8 h-8 text-black" />
                  )}
                </button>
                
                <button
                  onClick={handleSkipForward}
                  className="p-3 rounded-full bg-ape-gold/20 hover:bg-ape-gold/30 transition-colors"
                >
                  <SkipForward className="w-6 h-6 text-ape-gold" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-ape-gold/20 hover:bg-ape-gold/30 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-ape-gold" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-ape-gold" />
                  )}
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-sm text-gray-400 w-12">{volume}%</span>
              </div>

              {/* SoundCloud Link */}
              <div className="mt-8 pt-6 border-t border-ape-gold/20">
                <a
                  href={currentTrack.soundcloudUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <SiSoundcloud className="w-6 h-6" />
                  <span>Listen on SoundCloud</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Track List */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-ape-gold/30"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-ape-gold mb-6 flex items-center gap-2">
                <Music className="w-5 h-5" />
                Playlist
              </h3>
              
              <div className="space-y-3">
                {mockTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                      currentTrack.id === track.id 
                        ? 'bg-ape-gold/20 border border-ape-gold/50' 
                        : 'bg-black/20 hover:bg-ape-gold/10 border border-transparent hover:border-ape-gold/30'
                    }`}
                    onClick={() => handleTrackSelect(track)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <img 
                          src={track.cover} 
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{track.title}</h4>
                        <p className="text-sm text-gray-400">{track.artist}</p>
                        <p className="text-xs text-gray-500">{track.duration}</p>
                      </div>
                      {track.isSpotlight && (
                        <div className="text-ape-gold">⭐</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Radio Info */}
              <div className="mt-8 pt-6 border-t border-ape-gold/20">
                <div className="flex items-center gap-3 mb-4">
                  <Headphones className="w-5 h-5 text-ape-gold" />
                  <h4 className="font-semibold text-ape-gold">Radio Stream</h4>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Continuous streaming of Apes On Ape music. New tracks added regularly.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Stream Active</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
