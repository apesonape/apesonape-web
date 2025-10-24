'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Shuffle, Pause, Play } from 'lucide-react';

interface GridControlsProps {
  cols: number;
  rows: number;
  onColsChange: (cols: number) => void;
  onRowsChange: (rows: number) => void;
  onShuffle: () => void;
  animationsPaused: boolean;
  onToggleAnimations: () => void;
}

export default function GridControls({
  cols,
  rows,
  onColsChange,
  onRowsChange,
  onShuffle,
  animationsPaused,
  onToggleAnimations,
}: GridControlsProps) {
  return (
    <motion.div
      className="glass-dark rounded-xl p-4 border border-neon-cyan/20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-neon-cyan" />
          <span className="text-off-white font-medium text-sm">Grid Size</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="cols" className="text-off-white/70 text-sm">
            Cols:
          </label>
          <input
            id="cols"
            type="range"
            min="4"
            max="12"
            value={cols}
            onChange={(e) => onColsChange(parseInt(e.target.value))}
            className="w-20 md:w-24 h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            aria-label="Columns"
          />
          <span className="text-neon-cyan font-mono text-sm w-6 text-center">
            {cols}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="rows" className="text-off-white/70 text-sm">
            Rows:
          </label>
          <input
            id="rows"
            type="range"
            min="2"
            max="6"
            value={rows}
            onChange={(e) => onRowsChange(parseInt(e.target.value))}
            className="w-20 md:w-24 h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            aria-label="Rows"
          />
          <span className="text-neon-cyan font-mono text-sm w-6 text-center">
            {rows}
          </span>
        </div>

        <div className="hidden md:block w-px h-6 bg-white/10" />

        <div className="flex items-center gap-2">
          <motion.button
            onClick={onShuffle}
            className="flex items-center gap-2 px-3 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan rounded-lg transition-colors duration-300 border border-neon-cyan/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Shuffle grid"
          >
            <Shuffle className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">
              Shuffle
            </span>
          </motion.button>

          <motion.button
            onClick={onToggleAnimations}
            className="flex items-center gap-2 px-3 py-2 bg-neon-green/10 hover:bg-neon-green/20 text-neon-green rounded-lg transition-colors duration-300 border border-neon-green/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={animationsPaused ? 'Resume animations' : 'Pause animations'}
          >
            {animationsPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  Resume
                </span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  Pause
                </span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-off-white/50 text-xs text-center">
          Showing {cols * rows} NFTs • {cols}×{rows} grid
        </p>
      </div>
    </motion.div>
  );
}
