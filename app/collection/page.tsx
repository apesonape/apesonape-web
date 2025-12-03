'use client';

<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Users, Layers, ExternalLink, ShoppingBag } from 'lucide-react';
import Nav from '../components/Nav';
import Image from 'next/image';
import Footer from '../components/Footer';
import NFTCard from '../components/NFTCard';
import TokenDrawer from '../components/TokenDrawer';
import { MagicEdenNFT } from '@/lib/magic-eden';
=======
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, TrendingUp, Users, Layers, ExternalLink, ShoppingBag, X } from 'lucide-react';
import Nav from '../components/Nav';
import Image from 'next/image';
import Footer from '../components/Footer';
// Magic Eden fetching removed in CID mode

// Exclude specific trait types from the filter UI
const EXCLUDED_TRAIT_TYPES = new Set(['Background', 'BG', 'Background Color', 'BackgroundColor']);

// Fixed collection: only this metadata CID is used
const DEFAULT_METADATA_CID = process.env.NEXT_PUBLIC_DEFAULT_METADATA_CID || 'bafybeientok65jcovpzki5t64qdq3mqsfty5vkur2nwmbs6zibzei37vdy';
>>>>>>> b39f14f (init: clean history without build artifacts)

interface CollectionStats {
  floorPrice: number;
  listedCount: number;
  totalSupply: number;
  uniqueHolders: number;
  volume24hr: number;
}

export default function CollectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const observerTarget = useRef<HTMLDivElement>(null);

  // State
<<<<<<< HEAD
  const [nfts, setNfts] = useState<MagicEdenNFT[]>([]);
  const [filteredNFTs, setFilteredNFTs] = useState<MagicEdenNFT[]>([]);
  const [displayedNFTs, setDisplayedNFTs] = useState<MagicEdenNFT[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<MagicEdenNFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'rarity' | 'price-asc' | 'price-desc' | 'name'>(
    (searchParams.get('sort') as 'rarity' | 'price-asc' | 'price-desc' | 'name') || 'rarity'
  );
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    searchParams.get('traits')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseFloat(searchParams.get('minPrice') || '0'),
    parseFloat(searchParams.get('maxPrice') || '10'),
  ]);

  const itemsPerPage = 24;

  // Available traits for filtering
  const availableTraits = [
    'Golden', 'Silver', 'Blue', 'Red', 'Crown', 'Chain', 
    'Hat', 'Space', 'Forest', 'City', 'Ocean', 'Laser'
  ];
=======
  // Drive-backed gallery items
  type DriveItem = {
    id: string;
    name: string;
    imageUrl: string;
    tokenId?: string;
    traits?: { name: string; value: string; rarity: number }[];
  };
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DriveItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<DriveItem[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modalItem, setModalItem] = useState<DriveItem | null>(null);
  // Total count for the collection; avoid keeping 10k items in memory at once
  const [totalCount, setTotalCount] = useState<number>(0);
  // Track last token id we've planned into driveItems (absolute token id, not index). -1 means none.
  const [plannedUntil, setPlannedUntil] = useState<number>(-1);

  // Filters from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'token-asc' | 'token-desc'>(
    (searchParams.get('sort') as 'token-asc' | 'token-desc') || 'token-asc'
  );
  // Trait filters by type: AND across types, OR within a type
  type SelectedByType = Record<string, Set<string>>;
  const [selectedByType, setSelectedByType] = useState<SelectedByType>({});
  const [valueFilterByType, setValueFilterByType] = useState<Record<string, string>>({});
  const showTraitFilters = false;
  // Filter for trait types list
  const [typeFilterTerm, setTypeFilterTerm] = useState('');
  // Friendlier search UX: controls removed per request
  // Active trait type for tabbed filtering
  const [activeTraitType, setActiveTraitType] = useState<string>('');

  const itemsPerPage = 50;

  // Dynamic trait types discovered from metadata
  const [traitTypes, setTraitTypes] = useState<string[]>([]);
  const seenTraitTypesRef = useRef<Set<string>>(new Set());
  // Available values per type discovered from loaded metadata
  const [availableValuesByType, setAvailableValuesByType] = useState<Record<string, Set<string>>>({});
  // Cache of traits by tokenId for reliable filtering without mutating all items repeatedly
  const traitsCacheRef = useRef<Record<string, { name: string; value: string; rarity: number }[]>>({});
  const [traitsVersion, setTraitsVersion] = useState(0); // bump to recompute derived state
  // Guard against duplicate metadata fetches per token
  const fetchedMetaRef = useRef<Set<string>>(new Set());
>>>>>>> b39f14f (init: clean history without build artifacts)

  // Update URL with filters
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
<<<<<<< HEAD
    if (sortBy !== 'rarity') params.set('sort', sortBy);
    if (selectedTraits.length > 0) params.set('traits', selectedTraits.join(','));
    if (priceRange[0] !== 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] !== 10) params.set('maxPrice', priceRange[1].toString());
    
    router.push(`/collection?${params.toString()}`, { scroll: false });
  }, [searchTerm, sortBy, selectedTraits, priceRange, router]);

  // Load NFTs and stats
=======
    if (sortBy !== 'token-asc') params.set('sort', sortBy);
    const traitParam = Object.entries(selectedByType)
      .filter(([, set]) => set.size > 0)
      .map(([type, set]) => `${type}:${Array.from(set).join('|')}`)
      .join(';');
    if (traitParam) params.set('traits', traitParam);
    
    router.push(`/collection?${params.toString()}`, { scroll: false });
  }, [searchTerm, sortBy, selectedByType, router]);

  // Search controls removed; searchTerm remains available via URL if needed

  // Ensure an active trait type when opening the panel or when values load
  useEffect(() => {
    if (!showTraitFilters) return;
    if (activeTraitType && (availableValuesByType[activeTraitType]?.size ?? 0) > 0) return;
    for (const t of traitTypes) {
      if ((availableValuesByType[t]?.size ?? 0) > 0) {
        setActiveTraitType(t);
        return;
      }
    }
    if (traitTypes.length > 0) setActiveTraitType(traitTypes[0]);
  }, [showTraitFilters, availableValuesByType, traitTypes, activeTraitType]);
  // Normalize IPFS-like inputs to Pinata gateway
  function normalizeToPinataGateway(input: string | undefined | null): string {
    if (!input) return '';
    try {
      // If it's a full URL already
      if (/^https?:\/\//i.test(input)) {
        const idx = input.indexOf('/ipfs/');
        if (idx !== -1) {
          return `https://gateway.pinata.cloud${input.slice(idx)}`;
        }
        return input;
      }
      // ipfs://<cid>(/path)
      if (input.startsWith('ipfs://')) {
        const cidPath = input.replace('ipfs://', '');
        return `https://gateway.pinata.cloud/ipfs/${cidPath}`;
      }
      // Raw CID or CID with path
      if (/^(Qm[A-Za-z0-9]+|bafy[A-Za-z0-9]+)(\/.*)?$/.test(input)) {
        return `https://gateway.pinata.cloud/ipfs/${input}`;
      }
      return input;
    } catch {
      return input as string;
    }
  }

  // Load collection using fixed IPFS metadata CID
>>>>>>> b39f14f (init: clean history without build artifacts)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
<<<<<<< HEAD
        // Load NFTs
        const nftsResponse = await fetch('/api/me/tokens?limit=150');
        const nftsData = await nftsResponse.json();
        setNfts(nftsData.tokens || []);
=======
        const cid = DEFAULT_METADATA_CID;
        const startId = parseInt(searchParams.get('start') || '0', 10);
        const endParam = searchParams.get('end');
        const countParam = searchParams.get('count');
        const count = countParam ? parseInt(countParam, 10) : 10000;

        let items: DriveItem[] = [];

        if (!cid) {
          // No CID configured; show empty state
          setDriveItems([]);
          setFilteredItems([]);
          setDisplayedItems([]);
          setHasMore(false);
          setStats(null);
          setTotalCount(0);
          setPlannedUntil(-1);
          return;
        }

        // Strict CID mode: plan incrementally to reduce memory
        const endId = typeof count === 'number'
          ? startId + Math.max(0, count - 1)
          : (endParam ? parseInt(endParam, 10) : startId + 9999);
        const total = endId - startId + 1;
        setTotalCount(total);
        // Seed with the first page only
        const seedEnd = Math.min(startId + itemsPerPage - 1, endId);
        const plannedSeed: DriveItem[] = [];
        for (let id = startId; id <= seedEnd; id++) {
          plannedSeed.push({
            id: String(id),
            name: String(id),
            imageUrl: '', // fetched lazily
            tokenId: String(id),
          });
        }
        items = plannedSeed;
        setPlannedUntil(seedEnd);

        setDriveItems(items);
>>>>>>> b39f14f (init: clean history without build artifacts)

        // Load stats
        const statsResponse = await fetch('/api/me/stats');
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading collection data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
<<<<<<< HEAD
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...nfts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(nft =>
      nft.price >= priceRange[0] && nft.price <= priceRange[1]
    );

    // Traits filter
    if (selectedTraits.length > 0) {
      filtered = filtered.filter(nft => 
        nft.traits.some(trait => selectedTraits.includes(trait.value))
      );
=======
  }, [searchParams]);

  // Helper: parse attributes into internal trait shape and update caches/sets
  const applyTraitsToCaches = useCallback((tokenId: string, attributes: Array<Record<string, unknown>>) => {
    type RawAttr = { trait_type?: unknown; type?: unknown; name?: unknown; value?: unknown; trait_value?: unknown };
    const traits = (attributes || [])
      .map((raw: Record<string, unknown>) => {
        const a = raw as RawAttr;
        const nameUnknown = a.trait_type ?? a.type ?? a.name;
        const valueUnknown = a.value ?? a.trait_value ?? '';
        const name = typeof nameUnknown === 'string' ? nameUnknown : (nameUnknown != null ? String(nameUnknown) : '');
        const value = typeof valueUnknown === 'string' ? valueUnknown : (valueUnknown != null ? String(valueUnknown) : '');
        return name && value ? { name, value, rarity: 0 } : null;
      })
      .filter(Boolean) as { name: string; value: string; rarity: number }[];
    if (traits.length === 0) return;
    traitsCacheRef.current[tokenId] = traits;
    // update available values and types
    const nextValues: Record<string, Set<string>> = { ...availableValuesByType };
    for (const t of traits) {
      if (EXCLUDED_TRAIT_TYPES.has(t.name)) continue;
      if (!seenTraitTypesRef.current.has(t.name)) {
        seenTraitTypesRef.current.add(t.name);
        setTraitTypes(Array.from(seenTraitTypesRef.current).sort());
      }
      if (!nextValues[t.name]) nextValues[t.name] = new Set<string>();
      nextValues[t.name].add(t.value);
    }
    setAvailableValuesByType(nextValues);
    setTraitsVersion(v => v + 1);
  }, [availableValuesByType]);

  // In CID mode, lazily fetch metadata for currently displayed items that are missing image URLs and traits
  useEffect(() => {
    const cid = DEFAULT_METADATA_CID;
    if (!cid) return;
    const gatewayBase = 'https://gateway.pinata.cloud/ipfs';

    let cancelled = false;
    const missing = displayedItems.filter(it => {
      const token = it.tokenId;
      if (!token) return false;
      if (fetchedMetaRef.current.has(token)) return false;
      const haveImage = !!it.imageUrl;
      const haveTraits = !!traitsCacheRef.current[token];
      return !haveImage || !haveTraits;
    });
    if (missing.length === 0) return;

    (async () => {
      const updates: Array<Promise<void>> = [];
      for (const it of missing) {
        const token = it.tokenId!;
        // Mark as in-flight to avoid duplicate requests caused by re-renders
        fetchedMetaRef.current.add(token);
        const url = `${gatewayBase}/${cid}/${token}.json`;
        updates.push(
          (async () => {
            try {
              const res = await fetch(url, { cache: 'force-cache' });
              if (!res.ok) return;
              const meta = await res.json();
              const image = normalizeToPinataGateway(meta?.image || meta?.image_url || '');
              const attributes = Array.isArray(meta?.attributes) ? meta.attributes : [];
              applyTraitsToCaches(token, attributes);
              if (cancelled) return;
              setDriveItems(prev => {
                const next = prev.map(d => d.id === it.id ? { ...d, imageUrl: image || d.imageUrl } : d);
                return next;
              });
              // Keep displayed items in sync without resetting pagination
              setDisplayedItems(prev =>
                prev.map(d => d.id === it.id ? { ...d, imageUrl: image || d.imageUrl } : d)
              );
            } catch {
              // ignore per-item errors
            }
          })()
        );
      }
      await Promise.allSettled(updates);
    })();

    return () => { cancelled = true; };
  }, [displayedItems, applyTraitsToCaches]);

  // When trait filters are active, progressively fetch traits for all items (so "all values" can show)
  useEffect(() => {
    const activeTypes = Object.entries(selectedByType).filter(([, s]) => s.size > 0);
    const needAll = activeTypes.length > 0 || showTraitFilters;
    if (!needAll) return;
    const cid = DEFAULT_METADATA_CID;
    if (!cid) return;
    const gatewayBase = 'https://gateway.pinata.cloud/ipfs';
    let cancelled = false;
    const queue = driveItems.filter(it => it.tokenId && !traitsCacheRef.current[it.tokenId!]).map(it => it.tokenId!) as string[];
    if (queue.length === 0) return;
    const concurrency = 4;
    let idx = 0;
    (async () => {
      const workers = Array.from({ length: concurrency }).map(async () => {
        while (!cancelled) {
          const token = queue[idx++];
          if (!token) break;
          try {
            const res = await fetch(`${gatewayBase}/${cid}/${token}.json`, { cache: 'force-cache' });
            if (!res.ok) continue;
            const meta = await res.json();
            applyTraitsToCaches(token, Array.isArray(meta?.attributes) ? meta.attributes : []);
          } catch {
            // ignore
          }
        }
      });
      await Promise.allSettled(workers);
    })();
    return () => { cancelled = true; };
  }, [driveItems, selectedByType, showTraitFilters, applyTraitsToCaches]);

  // (Removed) Magic Eden prefetch – traits now come from IPFS metadata and a local cache

  // Recompute available values (union) from the traits cache
  useEffect(() => {
    const map: Record<string, Set<string>> = {};
    for (const tokenId in traitsCacheRef.current) {
      const traits = traitsCacheRef.current[tokenId] || [];
      for (const t of traits) {
        if (EXCLUDED_TRAIT_TYPES.has(t.name)) continue;
        if (!map[t.name]) map[t.name] = new Set<string>();
        if (t.value) map[t.name].add(t.value);
      }
    }
    setAvailableValuesByType(map);
    // Also refresh trait types order
    const types = Object.keys(map).sort();
    types.forEach(t => seenTraitTypesRef.current.add(t));
    setTraitTypes(Array.from(seenTraitTypesRef.current).sort());
  }, [traitsVersion]);

  // Sanitize selected filters and active type if an excluded type sneaks in
  useEffect(() => {
    setSelectedByType(prev => {
      let changed = false;
      const next: Record<string, Set<string>> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (EXCLUDED_TRAIT_TYPES.has(k)) {
          changed = true;
          continue;
        }
        next[k] = v;
      }
      return changed ? next : prev;
    });
    if (EXCLUDED_TRAIT_TYPES.has(activeTraitType)) {
      setActiveTraitType('');
    }
  }, [traitTypes, activeTraitType]); 
  // Apply filters and sorting for drive items
  useEffect(() => {
    let filtered = [...driveItems];

    // Search filter
    if (searchTerm) {
      const q = searchTerm.trim();
      filtered = filtered.filter(item => item.tokenId && item.tokenId.includes(q));
    }

    // Trait filters: AND across types
    const activeTypes = Object.entries(selectedByType).filter(([, s]) => s.size > 0);
    if (activeTypes.length > 0) {
      filtered = filtered.filter(item => {
        const tokenId = item.tokenId;
        if (!tokenId) return false;
        const traits = traitsCacheRef.current[tokenId] || [];
        if (traits.length === 0) return false;
        return activeTypes.every(([type, values]) =>
          traits.some(t => t.name === type && values.has(t.value))
      );
      });
>>>>>>> b39f14f (init: clean history without build artifacts)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
<<<<<<< HEAD
        case 'rarity':
          return a.rarity - b.rarity;
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
=======
        case 'token-asc': {
          const ai = a.tokenId ? parseInt(a.tokenId, 10) : Number.MAX_SAFE_INTEGER;
          const bi = b.tokenId ? parseInt(b.tokenId, 10) : Number.MAX_SAFE_INTEGER;
          return ai - bi;
        }
        case 'token-desc': {
          const ai = a.tokenId ? parseInt(a.tokenId, 10) : Number.MIN_SAFE_INTEGER;
          const bi = b.tokenId ? parseInt(b.tokenId, 10) : Number.MIN_SAFE_INTEGER;
          return bi - ai;
        }
>>>>>>> b39f14f (init: clean history without build artifacts)
        default:
          return 0;
      }
    });

<<<<<<< HEAD
    setFilteredNFTs(filtered);
    setPage(1);
    setDisplayedNFTs(filtered.slice(0, itemsPerPage));
    setHasMore(filtered.length > itemsPerPage);
  }, [nfts, searchTerm, sortBy, selectedTraits, priceRange]);
=======
    setFilteredItems(filtered);
    setPage(1);
    setDisplayedItems(filtered.slice(0, itemsPerPage));
    setHasMore(filtered.length > itemsPerPage);
  }, [driveItems, searchTerm, sortBy, selectedByType]);
>>>>>>> b39f14f (init: clean history without build artifacts)

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
<<<<<<< HEAD
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          const start = nextPage * itemsPerPage;
          const end = start + itemsPerPage;
          const newItems = filteredNFTs.slice(start, end);
          
          if (newItems.length > 0) {
            setDisplayedNFTs(prev => [...prev, ...newItems]);
            setPage(nextPage);
            setHasMore(end < filteredNFTs.length);
=======
        if (!entries[0].isIntersecting || !hasMore || loading) return;
          const nextPage = page + 1;
          const start = nextPage * itemsPerPage;
          const end = start + itemsPerPage;
        const newItems = filteredItems.slice(start, end);
          
          if (newItems.length > 0) {
          setDisplayedItems(prev => [...prev, ...newItems]);
            setPage(nextPage);
          // We still may have more if filteredItems has more rows or if more tokens can be planned
          setHasMore(end < filteredItems.length || (plannedUntil + 1) < (totalCount));
        } else {
          // If we've not yet planned all tokens, plan the next chunk and let filters recompute
          if ((plannedUntil + 1) < totalCount) {
            const planStartId = plannedUntil + 1;
            const planEndId = Math.min(plannedUntil + itemsPerPage, (totalCount - 1));
            const planned: DriveItem[] = [];
            for (let id = planStartId; id <= planEndId; id++) {
              planned.push({
                id: String(id),
                name: String(id),
                imageUrl: '',
                tokenId: String(id),
              });
            }
            setDriveItems(prev => [...prev, ...planned]);
            setPlannedUntil(planEndId);
            // Do not advance page yet; once filteredItems grows, observer will fire again
>>>>>>> b39f14f (init: clean history without build artifacts)
          } else {
            setHasMore(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
<<<<<<< HEAD
  }, [page, hasMore, loading, filteredNFTs]);
=======
  }, [page, hasMore, loading, filteredItems, plannedUntil, totalCount]);
>>>>>>> b39f14f (init: clean history without build artifacts)

  // Update URL when filters change
  useEffect(() => {
    updateURL();
  }, [updateURL]);

<<<<<<< HEAD
  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
=======
  const toggleTraitValue = (type: string, value: string) => {
    setSelectedByType(prev => {
      const next = { ...prev };
      const set = new Set(next[type] || []);
      if (set.has(value)) set.delete(value); else set.add(value);
      next[type] = set;
      return next;
    });
>>>>>>> b39f14f (init: clean history without build artifacts)
  };

  const clearFilters = () => {
    setSearchTerm('');
<<<<<<< HEAD
    setSortBy('rarity');
    setSelectedTraits([]);
    setPriceRange([0, 10]);
  };

=======
    setSortBy('token-asc');
    setSelectedByType({});
    setValueFilterByType({});
  };

  const clearTypeSelection = (type: string) => {
    setSelectedByType(prev => {
      const next = { ...prev };
      next[type] = new Set<string>();
      return next;
    });
  };

  const openModal = async (item: DriveItem) => {
    setModalItem(item);
  };
  const closeModal = () => setModalItem(null);

  // Flatten selected traits for chip bar
  const selectedChips = useMemo(() => {
    const chips: Array<{ type: string; value: string }> = [];
    for (const [type, set] of Object.entries(selectedByType)) {
      for (const v of set) chips.push({ type, value: v });
    }
    return chips;
  }, [selectedByType]);

  // Modal traits derived from cache; reacts to traitsVersion updates
  // removed unused modalTraits

>>>>>>> b39f14f (init: clean history without build artifacts)
  return (
    <div className="min-h-screen" style={{ color: 'var(--foreground)', background: 'var(--background)' }}>
      <Nav />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Stats */}
        <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
            <h1 className="section-heading mb-6 text-center" style={{ color: 'var(--foreground)' }}>
            Collection Gallery
          </h1>
            
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-dark rounded-xl p-4 text-center">
                  <Layers className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neon-cyan">
                    {stats.totalSupply}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ape-gray)' }}>Total Supply</p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-neon-green mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neon-green">
                    {stats.uniqueHolders}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ape-gray)' }}>Owners</p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-ape-gold mx-auto mb-2" />
                  <p className="text-2xl font-bold text-ape-gold">
                    {stats.floorPrice.toFixed(2)} APE
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ape-gray)' }}>Floor Price</p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <Filter className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.listedCount}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ape-gray)' }}>Listed</p>
                </div>
              </div>
            )}

            {/* Marketplace Links */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-hero-blue" />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                  Marketplaces
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Magic Eden */}
                <a
                  href="https://magiceden.io/collections/apechain/0xa6babe18f2318d2880dd7da3126c19536048f8b0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-dark rounded-xl p-6 flex items-center justify-between group hover:border-hero-blue/70 transition-all duration-300 hover:shadow-lg hover:shadow-hero-blue/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-hero-blue/10 flex items-center justify-center group-hover:bg-hero-blue/20 transition-colors">
                      <Image 
                        src="/magiceden_icon.jpeg" 
                        alt="Magic Eden" 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                        Magic Eden
                      </h3>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-hero-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* Mintify */}
                <a
                  href="https://app.mintify.com/nft/apechain/0xa6babe18f2318d2880dd7da3126c19536048f8b0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-dark rounded-xl p-6 flex items-center justify-between group hover:border-hero-blue/70 transition-all duration-300 hover:shadow-lg hover:shadow-hero-blue/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-ape-gold/10 flex items-center justify-center group-hover:bg-ape-gold/20 transition-colors">
                      <Image 
                        src="/mintify_icon.jpeg" 
                        alt="Mintify" 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                        Mintify
                      </h3>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-ape-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* OpenSea */}
                <a
                  href="https://opensea.io/collection/apes-on-apechain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-dark rounded-xl p-6 flex items-center justify-between group hover:border-hero-blue/70 transition-all duration-300 hover:shadow-lg hover:shadow-hero-blue/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center overflow-hidden group-hover:bg-blue-500/20 transition-colors">
                      <Image
                        src="/opensea-logo.webp"
                        alt="OpenSea"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                        OpenSea
                      </h3>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </motion.div>
        </motion.div>

<<<<<<< HEAD
          {/* Placeholder below Marketplaces */}
          <motion.div
            className="glass-dark rounded-xl p-12 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Coming Soon...
            </p>
            <p className="mt-2" style={{ color: 'var(--ape-gray)' }}>
              The collection viewer is being upgraded.
            </p>
          </motion.div>

          {/* Filters */}
        {false && (
        <motion.div 
            className="glass-dark rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
            <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
              <div className="flex-1">
            <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                    placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 glass border border-white/10 rounded-lg placeholder-gray-400 focus:border-hero-blue focus:outline-none transition-colors"
                    style={{ color: 'var(--foreground)' }}
              />
                </div>
            </div>

            {/* Sort */}
              <div>
            <select
              value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rarity' | 'price-asc' | 'price-desc' | 'name')}
                  className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:border-hero-blue focus:outline-none transition-colors cursor-pointer"
                  style={{ color: 'var(--foreground)' }}
            >
              <option value="rarity">Sort by Rarity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
              <option value="name">Sort by Name</option>
            </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || sortBy !== 'rarity' || selectedTraits.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 10) && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Price Range */}
            <div className="mt-6">
              <label className="text-sm mb-2 block" style={{ color: 'var(--ape-gray)' }}>
                Price Range: {priceRange[0]} - {priceRange[1]} APE
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                  className="flex-1 h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                />
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                  className="flex-1 h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-neon-cyan"
              />
            </div>
          </div>

          {/* Trait Filters */}
          <div className="mt-6">
              <h3 className="text-sm mb-3" style={{ color: 'var(--ape-gray)' }}>Filter by Traits</h3>
            <div className="flex flex-wrap gap-2">
                {availableTraits.map(trait => (
                <button
                  key={trait}
                  onClick={() => toggleTrait(trait)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedTraits.includes(trait)
                        ? 'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan'
                        : 'glass border-2 border-white/10 hover:border-hero-blue/50'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        )}

          {/* Results Count */}
          {false && (
          <motion.div 
            className="mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p style={{ color: 'var(--ape-gray)' }}>
              Showing <span className="text-hero-blue font-semibold">{displayedNFTs.length}</span> of{' '}
              <span className="text-hero-blue font-semibold">{filteredNFTs.length}</span> NFTs
            </p>
          </motion.div>
          )}

          {/* Loading State */}
          {false && (
            loading ? (
=======
          {/* Sidebar filters (left) + Grid (right) */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Filters */}
            <aside className="lg:col-span-1 space-y-4">
              {/* Selected chips */}
              {selectedChips.length > 0 && (
                <div className="glass-dark rounded-xl p-3 border border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedChips.map((c, idx) => (
                      <button
                        key={`${c.type}-${c.value}-${idx}`}
                        onClick={() => toggleTraitValue(c.type, c.value)}
                        className="px-2 py-1 rounded-full text-xs glass border border-white/10 hover:border-hero-blue/60"
                        title="Remove filter"
                      >
                        {c.type}: {c.value} ×
                      </button>
                    ))}
                    <button className="text-xs text-hero-blue hover:underline" onClick={clearFilters}>
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* Trait Filters */}
              <div className="glass-dark rounded-xl p-4 border border-white/10 sticky top-24">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Traits</span>
                  </div>
                  {/* Filter input for trait types */}
              <input
                type="text"
                    value={typeFilterTerm}
                    onChange={(e) => setTypeFilterTerm(e.target.value)}
                    placeholder="Filter trait types…"
                    className="w-full px-2 py-1 glass border border-white/10 rounded text-xs placeholder-gray-400 focus:border-hero-blue focus:outline-none mb-2"
                    style={{ color: 'var(--foreground)' }}
              />
                  {/* Vertical scrollable list of trait types */}
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-60 pr-1">
                    {traitTypes
                      .filter((t) => !EXCLUDED_TRAIT_TYPES.has(t))
                      .filter((t) => t.toLowerCase().includes(typeFilterTerm.toLowerCase()))
                      .map((type) => {
                        const count = (selectedByType[type]?.size ?? 0);
                        const hasValues = (availableValuesByType[type]?.size ?? 0) > 0;
                        const isActive = activeTraitType === type;
                        return (
                          <button
                            key={type}
                            disabled={!hasValues}
                            onClick={() => {
                              if (isActive) {
                                // Clicking the active type again closes the traits section
                                setActiveTraitType('');
                              } else {
                                setActiveTraitType(type);
                              }
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-xs border transition-colors ${
                              isActive
                                ? 'border-hero-blue text-hero-blue bg-hero-blue/10'
                                : 'border-white/10 hover:border-hero-blue/50'
                            } ${!hasValues ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={hasValues ? `Select ${type}` : 'No values available'}
                          >
                            {type}{count ? ` (${count})` : ''}
                          </button>
                        );
                      })}
                  </div>
            </div>

                {/* Active type selector */}
                {activeTraitType && (
                  <div className="border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={valueFilterByType[activeTraitType] || ''}
                        onChange={(e) => setValueFilterByType(prev => ({ ...prev, [activeTraitType]: e.target.value }))}
                        placeholder={`Filter ${activeTraitType} values…`}
                        className="w-full px-2 py-1 glass border border-white/10 rounded text-xs placeholder-gray-400 focus:border-hero-blue focus:outline-none"
                  style={{ color: 'var(--foreground)' }}
                      />
                      {(selectedByType[activeTraitType]?.size ?? 0) > 0 && (
                <button
                          type="button"
                          className="text-[11px] text-hero-blue hover:underline whitespace-nowrap"
                          onClick={() => clearTypeSelection(activeTraitType)}
                >
                          Clear
                </button>
              )}
            </div>
                    {(() => {
                      let allValues = Array.from(availableValuesByType[activeTraitType] || []).sort((a, b) => a.localeCompare(b));
                      const q = (valueFilterByType[activeTraitType] || '').toLowerCase();
                      if (q) allValues = allValues.filter(v => v.toLowerCase().includes(q));
                      const visible = allValues; // show all values at once
                      const selected = selectedByType[activeTraitType] || new Set<string>();
                      return (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs" style={{ color: 'var(--ape-gray)' }}>
                              {allValues.length} values
                            </span>
                          </div>
                          {allValues.length === 0 ? (
                            <div className="text-xs" style={{ color: 'var(--ape-gray)' }}>No values found</div>
                          ) : (
                            <div className="space-y-1.5 max-h-96 overflow-auto pr-1">
                              {visible.map((v) => (
                                <label key={v} className="flex items-center gap-2 text-xs">
                <input
                                    type="checkbox"
                                    checked={selected.has(v)}
                                    onChange={() => toggleTraitValue(activeTraitType, v)}
                                  />
                                  <span className="break-words whitespace-normal">{v}</span>
                                </label>
              ))}
            </div>
                          )}
                        </>
                      );
                    })()}
          </div>
        )}
              </div>
            </aside>

            {/* Right: Grid */}
            <section className="lg:col-span-4">
          <motion.div 
                className="mb-0 text-center lg:text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
          >
            <p style={{ color: 'var(--ape-gray)' }}>
                  Showing <span className="text-hero-blue font-semibold">{displayedItems.length}</span> of{' '}
                  <span className="text-hero-blue font-semibold">{totalCount || filteredItems.length}</span> images
            </p>
          </motion.div>

              {loading ? (
>>>>>>> b39f14f (init: clean history without build artifacts)
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4"></div>
                  <p style={{ color: 'var(--ape-gray)' }}>Loading collection...</p>
                </div>
              </div>
            ) : (
              <>
<<<<<<< HEAD
                {/* NFT Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                  {displayedNFTs.map((nft, index) => (
                    <NFTCard
                      key={`${nft.id}-${index}`}
                      nft={nft}
                      onClick={() => setSelectedNFT(nft)}
                      index={index}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Observer */}
=======
                  {/* 4 columns on desktop */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {displayedItems.map((item) => (
                      <div
                        key={item.id}
                        className="glass-dark rounded-xl overflow-hidden border border-white/10 cursor-pointer"
                        onClick={() => openModal(item)}
                      >
                        <div className="relative aspect-square">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-10 h-10 border-4 border-hero-blue/30 border-t-hero-blue rounded-full animate-spin" />
                        </div>
                      )}
                          {item.tokenId && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-xs border border-white/10">
                              #{item.tokenId}
                            </div>
                          )}
                        </div>
                      </div>
                  ))}
                </div>

>>>>>>> b39f14f (init: clean history without build artifacts)
                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-8">
                    <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin"></div>
                  </div>
                )}

<<<<<<< HEAD
                {/* End of Results */}
                {!hasMore && filteredNFTs.length > 0 && (
=======
                  {!hasMore && filteredItems.length > 0 && (
>>>>>>> b39f14f (init: clean history without build artifacts)
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p style={{ color: 'var(--ape-gray)' }}>You&apos;ve reached the end of the collection</p>
                  </motion.div>
                )}

<<<<<<< HEAD
                {/* No Results */}
                {filteredNFTs.length === 0 && (
=======
                  {filteredItems.length === 0 && (
>>>>>>> b39f14f (init: clean history without build artifacts)
                  <motion.div 
                    className="text-center py-20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
<<<<<<< HEAD
                    <p className="text-2xl mb-4" style={{ color: 'var(--foreground)' }}>No NFTs found</p>
=======
                      <p className="text-2xl mb-4" style={{ color: 'var(--foreground)' }}>No images found</p>
>>>>>>> b39f14f (init: clean history without build artifacts)
                    <p className="mb-6" style={{ color: 'var(--ape-gray)' }}>
                      Try adjusting your filters to see more results
                    </p>
                    <button onClick={clearFilters} className="btn-primary">
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </>
<<<<<<< HEAD
            )
          )}
=======
          )}
            </section>
          </div>
>>>>>>> b39f14f (init: clean history without build artifacts)
        </div>
      </div>

      <Footer />
<<<<<<< HEAD
      <TokenDrawer nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
=======
      {/* Modal Preview */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative z-10 glass-dark bg-black/60 rounded-xl border border-white/20 w-[95vw] max-w-4xl mx-auto overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--ape-gray)' }}>Token</span>
                <span className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                  {modalItem.tokenId ? `#${modalItem.tokenId}` : '—'}
                </span>
              </div>
              <button onClick={closeModal} className="p-2 rounded hover:bg-white/5" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative w-full aspect-square md:aspect-auto md:min-h-[28rem]">
                <Image
                  src={modalItem.imageUrl}
                  alt={modalItem.name}
                  fill
                  sizes="50vw"
                  className="object-contain bg-black"
                />
              </div>
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                  Traits
                </h3>
                {!modalItem.traits || modalItem.traits.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--ape-gray)' }}>
                    {modalItem.tokenId ? 'Loading traits…' : 'No traits available'}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {modalItem.traits.map((t, idx) => (
                      <span key={`${t.name}-${t.value}-${idx}`} className="px-2 py-1 rounded-full text-xs glass border border-white/10">
                        {t.name}: {t.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
>>>>>>> b39f14f (init: clean history without build artifacts)
    </div>
  );
}
