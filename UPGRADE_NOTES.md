# Apes On Ape Website Upgrade

## Overview

This document describes the major website upgrade implemented on the `website-upgrade` branch, transforming the Apes On Ape NFT collection site into a modern, art-forward, and kinetic creative hub.

## 🎨 Design System Upgrades

### Typography
- **Display Font**: Playfair Display (serif) - Used for headings and hero text
- **Body Font**: Inter (sans-serif) - Used for body text and UI elements
- **Monospace Font**: Courier Prime - Used for code, addresses, and technical content

### Color Palette
The site now features a sophisticated dark theme with neon accents:

- **Charcoal**: `#1a1a1a` (main background)
- **Off-White**: `#f8f8f8` (primary text)
- **Neon Cyan**: `#00fff5` (primary accent)
- **Neon Green**: `#39ff14` (secondary accent)
- **Ape Gold**: `#FFD700` (legacy compatibility, highlights)

### Visual Effects
- **Grain Texture**: Subtle noise overlay for editorial feel
- **Radial Gradients**: Dynamic background effects
- **Glass Morphism**: Frosted glass effect on cards and overlays
- **Hover Animations**: Gentle tilt and magnetic effects (respects `prefers-reduced-motion`)

## 🗂️ Site Structure

### Routes

#### `/` - Home Page
**Features:**
- Dynamic hero section with parallax effects
- Live NFT grid (default 8×4, customizable)
- Grid controls for size adjustment (4-12 cols, 2-6 rows)
- Shuffle functionality
- Animation pause toggle
- Section callouts for different creator types
- URL-based grid configuration (`?cols=8&rows=4`)

**Components Used:**
- `Nav` - Fixed navigation with scroll effects
- `Hero` - Main hero section with CTA buttons
- `GridControls` - Interactive grid size controls
- `NFTCard` - Individual NFT cards with hover effects
- `TokenDrawer` - Side panel for NFT details
- `SectionCallouts` - Community invitation sections
- `Footer` - Comprehensive footer with all links

#### `/collection` - Collection Gallery
**Features:**
- Collection statistics (floor price, supply, owners, listed count)
- Advanced filtering:
  - Search by name/ID
  - Sort by rarity, price, name
  - Price range slider
  - Multi-select trait filters
- Infinite scroll (loads 24 items per page)
- URL-based filter persistence (shareable views)
- Responsive grid layout

**Query Parameters:**
- `search` - Search term
- `sort` - Sort method (rarity, price-asc, price-desc, name)
- `traits` - Comma-separated trait values
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter

#### `/sound` - Sound Studio
**Features:**
- **Spotlight of the Month**: Featured track with artwork, description, and "why we love it"
- **Radio Player**: 
  - Full playback controls (play, pause, skip, seek)
  - Volume control with mute
  - Shuffle mode
  - Repeat modes (off, all, one)
  - Queue display
  - Autoplay muted (unmute on user interaction)
- SoundCloud integration
- Editable spotlight content via API

**Note:** The old `/music` route is replaced by `/sound`

## 🔌 API Routes

### Magic Eden Proxy

#### `GET /api/me/tokens`
Fetches NFT tokens from Magic Eden with server-side caching.

**Query Parameters:**
- `limit` - Number of tokens to fetch (default: 32)
- `offset` - Pagination offset (default: 0)
- `random` - If true, randomizes the results

**Response:**
```json
{
  "tokens": [...],
  "total": 1000
}
```

**Caching:** 60 seconds

#### `GET /api/me/stats`
Fetches collection statistics.

**Response:**
```json
{
  "symbol": "apes-on-ape",
  "floorPrice": 0.5,
  "listedCount": 150,
  "totalSupply": 1000,
  "uniqueHolders": 650,
  "volume24hr": 50,
  "volume7d": 350,
  "volume30d": 1500
}
```

**Caching:** 300 seconds (5 minutes)

### SoundCloud Proxy

#### `GET /api/soundcloud/tracks`
Fetches tracks from the Apes On Ape SoundCloud account.

**Response:**
```json
{
  "tracks": [
    {
      "id": "track-id",
      "title": "Track Title",
      "artist": "Artist Name",
      "duration": 225,
      "artwork": "/path/to/artwork.jpg",
      "streamUrl": "https://soundcloud.com/...",
      "permalink": "https://soundcloud.com/...",
      "description": "Track description",
      "isSpotlight": true
    }
  ],
  "user": "https://soundcloud.com/apesonape"
}
```

**Caching:** 3600 seconds (1 hour)

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```bash
# Magic Eden API Configuration
ME_API_BASE=https://api-mainnet.magiceden.dev/v2
NEXT_PUBLIC_ME_COLLECTION=0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0

# SoundCloud Configuration
SOUNDCLOUD_USER_URL=https://soundcloud.com/apesonape
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://apesonape.io
```

**Note:** The site falls back to mock data if API calls fail, ensuring the site always displays content.

## 📝 Updating Monthly Spotlight

The spotlight track is determined by the `isSpotlight` flag in the SoundCloud API response. To update:

### Option 1: Via API (if SoundCloud API is configured)
The first track returned from the SoundCloud API with `isSpotlight: true` will be featured.

### Option 2: Manual Update (using mock data)
Edit `/app/api/soundcloud/tracks/route.ts`:

```typescript
{
  id: 'spotlight-1',
  title: 'YOUR TRACK TITLE',
  artist: 'Apes On Ape',
  duration: 225, // in seconds
  artwork: '/path/to/artwork.jpg',
  streamUrl: 'https://soundcloud.com/apesonape/track',
  permalink: 'https://soundcloud.com/apesonape/track',
  description: 'Why we love this track - your description here',
  isSpotlight: true,
}
```

### Option 3: External JSON (recommended for easy updates)
Create a `public/spotlight.json` file and fetch it from the sound page:

```json
{
  "title": "Track Title",
  "artist": "Artist Name",
  "artwork": "/path/to/artwork.jpg",
  "soundcloudUrl": "https://soundcloud.com/...",
  "description": "Why we love it...",
  "duration": 225
}
```

## 🧩 Component Architecture

### Shared Components (`/app/components/`)

- **Nav.tsx** - Fixed navigation with mobile menu
- **Footer.tsx** - Comprehensive footer with all external links
- **Hero.tsx** - Reusable hero section with parallax effects
- **GridControls.tsx** - Grid size and animation controls
- **NFTCard.tsx** - Individual NFT card with hover effects
- **TokenDrawer.tsx** - Sliding panel for NFT details
- **SectionCallouts.tsx** - Community invitation sections

### Component Props

All components are fully typed with TypeScript interfaces. Example:

```typescript
interface NFTCardProps {
  nft: MagicEdenNFT;
  onClick: () => void;
  index?: number;
  animationsPaused?: boolean;
}
```

## 🎭 Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Rings**: Visible focus indicators (neon cyan)
- **ARIA Labels**: Proper labeling for screen readers
- **Reduced Motion**: Respects `prefers-reduced-motion` user preference
- **Semantic HTML**: Proper heading hierarchy and semantic elements
- **Alt Text**: All images have descriptive alt text
- **Color Contrast**: AA+ contrast ratios throughout

## 🚀 Performance Optimizations

- **Image Optimization**: Next.js Image component with lazy loading
- **API Caching**: Server-side response caching (60s for tokens, 300s for stats)
- **Code Splitting**: Automatic route-based code splitting
- **Request Deduplication**: Prevents duplicate API calls
- **Infinite Scroll**: Loads content progressively in collection view

## 🔗 External Links Preserved

All original external links are maintained and accessible:

- **Discord**: https://discord.gg/gVmqW6SExU
- **X (Twitter)**: https://x.com/apechainapes
- **Magic Eden**: https://magiceden.us/collections/apechain/0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0
- **Mintify**: https://apechain.mintify.xyz/apechain/0xa6babe18f2318d2880dd7da3126c19536048f8b0
- **Arcade**: https://arcade.apesonape.io
- **SoundCloud**: https://soundcloud.com/apesonape
- **Apescan (Contract)**: https://apescan.io/address/0xa6babe18f2318d2880dd7da3126c19536048f8b0

## 📦 Dependencies

New dependencies added in this upgrade:

```json
{
  "framer-motion": "^12.23.24",
  "lucide-react": "^0.471.0",
  "react-icons": "^5.5.0",
  "next": "15.1.4",
  "react": "^19.0.0"
}
```

All dependencies are already installed in the existing `package.json`.

## 🛠️ Development

### Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm start
```

The site will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This generates a static export in the `/docs` directory, which is configured for deployment.

## 🌐 Deployment

### Vercel (Recommended)
1. Push the `website-upgrade` branch to GitHub
2. Create a new deployment on Vercel pointing to this branch
3. Set environment variables in Vercel dashboard
4. Deploy

### Static Export (GitHub Pages, etc.)
The site is configured for static export to the `/docs` directory:

```bash
npm run build
```

Note: API routes won't work in static export. The site will use mock data as fallback.

## 🎯 Testing Checklist

- [ ] Home page loads with 8×4 grid
- [ ] Grid resizing works (4-12 cols, 2-6 rows)
- [ ] Shuffle button randomizes NFTs
- [ ] NFT cards open detail drawer
- [ ] Drawer shows traits and Magic Eden link
- [ ] Collection page filters work
- [ ] Infinite scroll loads more NFTs
- [ ] Sound page plays tracks
- [ ] Spotlight track is featured
- [ ] Navigation works on mobile
- [ ] All external links work
- [ ] Site respects reduced motion preference
- [ ] Keyboard navigation works
- [ ] Dark mode displays correctly

## 📊 Performance Metrics

Target metrics:
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

## 🐛 Known Issues / Future Improvements

1. **API Routes in Static Export**: API routes don't work in static export. Consider:
   - Fetching data at build time
   - Using serverless functions (Vercel Functions)
   - Client-side fetching directly (with CORS handling)

2. **SoundCloud API**: Currently using mock data. To use real SoundCloud data:
   - Register for SoundCloud API access
   - Add `SOUNDCLOUD_CLIENT_ID` to environment variables

3. **Image Optimization**: Images are unoptimized due to static export. Consider:
   - Using a CDN
   - Pre-optimizing images
   - Deploying to a platform that supports Next.js image optimization

## 🤝 Contributing

When making changes:

1. Keep the existing color scheme and design system
2. Maintain accessibility standards
3. Test on mobile devices
4. Respect `prefers-reduced-motion`
5. Update this documentation

## 📜 License

This project is part of the Apes On Ape NFT collection on Apechain.

---

**Built with ❤️ by the Apes On Ape community**

For questions or issues, join our [Discord](https://discord.gg/gVmqW6SExU).

