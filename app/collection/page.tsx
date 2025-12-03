'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, ShoppingBag, X } from 'lucide-react';
import Nav from '../components/Nav';
import Image from 'next/image';
import Footer from '../components/Footer';
// Magic Eden fetching removed in CID mode

// Exclude specific trait types from the filter UI
const EXCLUDED_TRAIT_TYPES = new Set(['Background', 'BG', 'Background Color', 'BackgroundColor']);

// Fixed collection: only this metadata CID is used
const DEFAULT_METADATA_CID = process.env.NEXT_PUBLIC_DEFAULT_METADATA_CID || 'bafybeiaizsmuaj5ubnsh6mtb53ngqffyhrqus7kdqihfbtbafq4c75gjny';
// Optional CDN base for prebuilt indices (e.g., Supabase Storage public URL ending with /collection-index/)
const CDN_BASE = 'https://bqcrbcpmimfojnjdhvrz.supabase.co/storage/v1/object/public/collection/collection-index/';
// CDN thumbnails base (512px WebP), uploaded by the thumbnail builder
const THUMBS_BASE = 'https://bqcrbcpmimfojnjdhvrz.supabase.co/storage/v1/object/public/collection/collection-thumbs';

// Preferred IPFS gateways (first has priority; client-side image fallback will rotate on failure)
const IPFS_GATEWAYS = [
  // Allow overriding with a custom Pinata subdomain gateway
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PINATA_SUBDOMAIN_GATEWAY : undefined) || 'https://moccasin-brilliant-silkworm-382.mypinata.cloud/ipfs',
  'https://gateway.pinata.cloud/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://ipfs.io/ipfs',
  'https://nftstorage.link/ipfs',
  'https://dweb.link/ipfs',
] as const;

export default function CollectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const observerTarget = useRef<HTMLDivElement>(null);

  // State
  // Drive-backed gallery items
  type DriveItem = {
    id: string;
    name: string;
    imageUrl: string;
    imageUrls?: string[]; // fallback candidates across gateways
    tokenId?: string;
    traits?: { name: string; value: string; rarity: number }[];
  };
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DriveItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<DriveItem[]>([]);
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

  // Local search input for token ID
  const [idQuery, setIdQuery] = useState<string>('');

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

  // Optional CDN indices (loaded when CDN_BASE present)
  const [cdnTokensById, setCdnTokensById] = useState<Record<string, { image: string; attributes: Array<Record<string, unknown>> }> | null>(null);
  const [cdnTraitIndex, setCdnTraitIndex] = useState<Record<string, Record<string, number[]>> | null>(null);
  const [cdnTraitsMeta, setCdnTraitsMeta] = useState<{ types: string[]; valuesByType: Record<string, string[]>; counts: Record<string, Record<string, number>> } | null>(null);

  useEffect(() => {
    if (!CDN_BASE) return;
    let cancelled = false;
    (async () => {
      try {
        const base = CDN_BASE.replace(/\/+$/, '');
        const [tokensRes, traitsRes, indexRes] = await Promise.all([
          fetch(`${base}/tokens.json`, { cache: 'force-cache' }),
          fetch(`${base}/traits.json`, { cache: 'force-cache' }),
          fetch(`${base}/traitIndex.json`, { cache: 'force-cache' }),
        ]);
        if (!tokensRes.ok || !traitsRes.ok || !indexRes.ok) return;
        const [tokens, traitsMeta, traitIndex] = await Promise.all([tokensRes.json(), traitsRes.json(), indexRes.json()]);
        if (cancelled) return;
        const byId: Record<string, { image: string; attributes: Array<Record<string, unknown>> }> = {};
        for (const t of tokens as Array<{ id: number; image: string; attributes: Array<Record<string, unknown>> }>) {
          byId[String(t.id)] = { image: t.image || '', attributes: Array.isArray(t.attributes) ? t.attributes : [] };
        }
        setCdnTokensById(byId);
        setCdnTraitIndex(traitIndex || {});
        setCdnTraitsMeta(traitsMeta || null);
        // If traits meta present, prime UI lists
        if (traitsMeta?.types && traitsMeta?.valuesByType) {
          const map: Record<string, Set<string>> = {};
          for (const type of traitsMeta.types) {
            map[type] = new Set(traitsMeta.valuesByType[type] || []);
          }
          setAvailableValuesByType(map);
          setTraitTypes(traitsMeta.types.slice().sort());
        }
      } catch {
        // ignore; fallback to IPFS metadata
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Update URL with filters
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
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
  // Normalize IPFS-like inputs to an array of gateway candidates
  function normalizeToGatewayCandidates(input: string | undefined | null): string[] {
    if (!input) return [];
    try {
      // If it's a full URL already
      if (/^https?:\/\//i.test(input)) {
        const idx = input.indexOf('/ipfs/');
        if (idx !== -1) {
          const path = input.slice(idx + '/ipfs/'.length); // after /ipfs/
          return IPFS_GATEWAYS.map(base => `${base}/${path}`);
        }
        // Not an IPFS URL; return as-is (single candidate)
        return [input];
      }
      // ipfs://<cid>(/path)
      if (input.startsWith('ipfs://')) {
        const cidPath = input.replace('ipfs://', '');
        return IPFS_GATEWAYS.map(base => `${base}/${cidPath}`);
      }
      // Raw CID or CID with path
      if (/^(Qm[A-Za-z0-9]+|bafy[A-Za-z0-9]+)(\/.*)?$/.test(input)) {
        return IPFS_GATEWAYS.map(base => `${base}/${input}`);
      }
      return [input];
    } catch {
      return [input as string];
    }
  }

  // Component to render an image with IPFS gateway fallback rotation
  function FallbackImage({
    srcs,
    alt,
    sizes,
    className,
  }: {
    srcs: string[];
    alt: string;
    sizes?: string;
    className?: string;
  }) {
    const [index, setIndex] = useState(0);
    const activeSrc = srcs[Math.min(index, srcs.length - 1)];
    return (
      <Image
        src={activeSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        onError={() => {
          setIndex(i => (i + 1 < srcs.length ? i + 1 : i));
        }}
      />
    );
  }

  // Load collection using fixed IPFS metadata CID
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error('Error loading collection data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
    const gatewayBase = IPFS_GATEWAYS[0];

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
      // Prefer CDN indices when available
      if (CDN_BASE && cdnTokensById) {
        for (const it of missing) {
          const token = it.tokenId!;
          fetchedMetaRef.current.add(token);
          const record = cdnTokensById[token];
          if (!record) continue;
          const imageCandidates = (() => {
            const fromMeta = normalizeToGatewayCandidates(record.image || '');
            // Prepend CDN thumb
            const thumb = `${THUMBS_BASE}/${token}.webp`;
            return [thumb, ...fromMeta];
          })();
          applyTraitsToCaches(token, Array.isArray(record.attributes) ? record.attributes : []);
          if (cancelled) continue;
          setDriveItems(prev => prev.map(d => d.id === it.id ? { ...d, imageUrl: (imageCandidates[0] || d.imageUrl), imageUrls: imageCandidates } : d));
          setDisplayedItems(prev => prev.map(d => d.id === it.id ? { ...d, imageUrl: (imageCandidates[0] || d.imageUrl), imageUrls: imageCandidates } : d));
        }
        return;
      }
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
              const imageCandidates = normalizeToGatewayCandidates(meta?.image || meta?.image_url || '');
              const attributes = Array.isArray(meta?.attributes) ? meta.attributes : [];
              applyTraitsToCaches(token, attributes);
              if (cancelled) return;
              setDriveItems(prev => {
                const next = prev.map(d => d.id === it.id ? { ...d, imageUrl: (imageCandidates[0] || d.imageUrl), imageUrls: imageCandidates } : d);
                return next;
              });
              // Keep displayed items in sync without resetting pagination
              setDisplayedItems(prev =>
                prev.map(d => d.id === it.id ? { ...d, imageUrl: (imageCandidates[0] || d.imageUrl), imageUrls: imageCandidates } : d)
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
  }, [displayedItems, applyTraitsToCaches, cdnTokensById]);

  // When trait filters are active, progressively fetch traits for all items (so "all values" can show)
  useEffect(() => {
    const activeTypes = Object.entries(selectedByType).filter(([, s]) => s.size > 0);
    const needAll = activeTypes.length > 0 || showTraitFilters;
    if (!needAll) return;
    const cid = DEFAULT_METADATA_CID;
    if (!cid) return;
    const gatewayBase = IPFS_GATEWAYS[0];
    let cancelled = false;

    // If CDN trait metadata is present, skip IPFS-wide trait fetching
    if (CDN_BASE && cdnTraitsMeta && cdnTraitIndex) {
      return () => { cancelled = true; };
    }

    // Queue across the full collection (0..totalCount-1) to ensure filters cover all tokens
    const queue: string[] = [];
    for (let i = 0; i < totalCount; i++) {
      const token = String(i);
      if (!traitsCacheRef.current[token]) queue.push(token);
    }
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
  }, [driveItems, selectedByType, showTraitFilters, applyTraitsToCaches, cdnTraitIndex, cdnTraitsMeta, totalCount]);

  // (Removed) Magic Eden prefetch – traits now come from IPFS metadata and a local cache

  // Recompute available values (union) from the traits cache
  useEffect(() => {
    // Start from CDN traits meta if available to ensure full coverage,
    // then merge in any values discovered from metadata fetches.
    const unionMap: Record<string, Set<string>> = {};

    if (cdnTraitsMeta?.types && cdnTraitsMeta?.valuesByType) {
      for (const type of cdnTraitsMeta.types) {
        if (EXCLUDED_TRAIT_TYPES.has(type)) continue;
        unionMap[type] = new Set<string>(cdnTraitsMeta.valuesByType[type] || []);
      }
    }

    for (const tokenId in traitsCacheRef.current) {
      const traits = traitsCacheRef.current[tokenId] || [];
      for (const t of traits) {
        if (EXCLUDED_TRAIT_TYPES.has(t.name)) continue;
        if (!unionMap[t.name]) unionMap[t.name] = new Set<string>();
        if (t.value) unionMap[t.name].add(t.value);
      }
    }

    setAvailableValuesByType(unionMap);

    // Refresh trait types order from the union
    const types = Object.keys(unionMap).sort();
    types.forEach(t => seenTraitTypesRef.current.add(t));
    setTraitTypes(Array.from(new Set(types)).sort());
  }, [traitsVersion, cdnTraitsMeta]);

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
    // Build set of matching tokenIds across the full collection (0..totalCount-1)
    // Then ensure driveItems has entries for those tokens (lightweight stubs).
    const matchIds = new Set<string>();

    const q = (searchTerm || '').trim();
    const hasSearch = q.length > 0;

    const activeTypes = Object.entries(selectedByType).filter(([, s]) => s.size > 0);
    const hasTraitFilters = activeTypes.length > 0;

    // If neither search nor trait filters, fall back to existing items (paged planning)
    if (!hasSearch && !hasTraitFilters) {
      // Sorting
      const sorted = [...driveItems].sort((a, b) => {
        switch (sortBy) {
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
          default:
            return 0;
        }
      });
      setFilteredItems(sorted);
      setPage(1);
      setDisplayedItems(sorted.slice(0, itemsPerPage));
      // Even if we only have the first planned chunk, allow infinite scroll to plan more
      const canPlanMore = (plannedUntil + 1) < totalCount;
      setHasMore(sorted.length > itemsPerPage || canPlanMore);
      return;
    }

    // 1) Match by search across 0..totalCount-1
    if (hasSearch) {
      for (let i = 0; i < totalCount; i++) {
        const token = String(i);
        if (token.includes(q)) matchIds.add(token);
      }
    }

    // 2) Match by trait filters
    if (hasTraitFilters) {
      if (CDN_BASE && cdnTraitIndex) {
        // Use prebuilt index to compute matches quickly
        let first = true;
        let working: Set<string> = new Set();
        for (const [type, values] of activeTypes) {
          const mapForType = cdnTraitIndex[type] || {};
          const idsForType = new Set<string>();
          values.forEach(v => {
            const arr = mapForType[v] || [];
            for (const id of arr) idsForType.add(String(id));
          });
          if (first) {
            working = idsForType;
            first = false;
          } else {
            working = new Set(Array.from(working).filter(x => idsForType.has(x)));
          }
        }
        for (const id of working) matchIds.add(id);
      } else {
        // Fallback to traits cache assembled from per-token metadata
        for (let i = 0; i < totalCount; i++) {
          const token = String(i);
          const traits = traitsCacheRef.current[token] || [];
          if (traits.length === 0) continue;
          const ok = activeTypes.every(([type, values]) =>
            traits.some(t => t.name === type && values.has(t.value))
          );
          if (ok) matchIds.add(token);
        }
      }
    }

    // Ensure driveItems contains stubs for all matchIds
    if (matchIds.size > 0) {
      const existing = new Set(driveItems.map(d => d.tokenId || ''));
      const additions: DriveItem[] = [];
      matchIds.forEach(token => {
        if (!existing.has(token)) {
          additions.push({
            id: token,
            name: token,
            imageUrl: '',
            tokenId: token,
          });
        }
      });
      if (additions.length > 0) {
        setDriveItems(prev => [...prev, ...additions]);
      }
    }

    // Now filter driveItems by the computed matchIds
    const filtered = driveItems.filter(item => item.tokenId && matchIds.has(item.tokenId));

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
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
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
    setPage(1);
    setDisplayedItems(filtered.slice(0, itemsPerPage));
    // If filters are active, we still may plan more tokens to discover additional matches
    const canPlanMore = (plannedUntil + 1) < totalCount;
    setHasMore(filtered.length > itemsPerPage || canPlanMore);
  }, [driveItems, searchTerm, sortBy, selectedByType, cdnTraitIndex, plannedUntil, totalCount]);

  // Infinite scroll: append more items when sentinel enters view
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
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
  }, [page, hasMore, loading, filteredItems, plannedUntil, totalCount]);

  // Update URL when filters change
  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const toggleTraitValue = (type: string, value: string) => {
    setSelectedByType(prev => {
      const next = { ...prev };
      const set = new Set(next[type] || []);
      if (set.has(value)) set.delete(value); else set.add(value);
      next[type] = set;
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
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
            Collection
          </h1>

            {/* Stats removed by request */}

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

          {/* Sidebar filters (left) + Grid (right) */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Filters */}
            <aside className="lg:col-span-1 space-y-4">
              {/* Search by ID – positioned above traits */}
              <div className="glass-dark rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Search by token ID…"
                    value={idQuery}
                    onChange={(e) => setIdQuery(e.target.value)}
                    className="w-full px-2 py-1 glass border border-white/10 rounded text-xs placeholder-gray-400 focus:border-hero-blue focus:outline-none"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <button
                    className="btn-primary px-3 py-1 text-xs"
                    onClick={() => {
                      const q = (idQuery || '').trim();
                      setSearchTerm(q);
                      setPage(1);
                    }}
                  >
                    Search
                  </button>
                  <button
                    className="btn-secondary px-3 py-1 text-xs"
                    onClick={() => {
                      setIdQuery('');
                      clearFilters();
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
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
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4"></div>
                  <p style={{ color: 'var(--ape-gray)' }}>Loading collection...</p>
                </div>
              </div>
            ) : (
              <>
                  {/* 4 columns on desktop */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {displayedItems.map((item) => (
                      <div
                        key={item.id}
                        className="glass-dark rounded-xl overflow-hidden border border-white/10 cursor-pointer"
                        onClick={() => openModal(item)}
                      >
                        <div className="relative aspect-square">
                      {item.tokenId ? (
                        <FallbackImage
                          srcs={[
                            `${THUMBS_BASE}/${item.tokenId}.webp`,
                            ...(item.imageUrls && item.imageUrls.length > 0
                              ? item.imageUrls
                              : (item.imageUrl ? [item.imageUrl] : [])),
                          ]}
                          alt={item.name}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          className="object-cover"
                        />
                      ) : item.imageUrl ? (
                        <FallbackImage
                          srcs={[item.imageUrl]}
                          alt={item.name}
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

                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-8">
                    <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin"></div>
                  </div>
                )}

                  {!hasMore && filteredItems.length > 0 && (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p style={{ color: 'var(--ape-gray)' }}>You&apos;ve reached the end of the collection</p>
                  </motion.div>
                )}

                  {filteredItems.length === 0 && (
                  <motion.div 
                    className="text-center py-20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                      <p className="text-2xl mb-4" style={{ color: 'var(--foreground)' }}>No images found</p>
                    <p className="mb-6" style={{ color: 'var(--ape-gray)' }}>
                      Try adjusting your filters to see more results
                    </p>
                    <button onClick={clearFilters} className="btn-primary">
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </>
          )}

              {/* Infinite scroll sentinel is shown above when hasMore */}
            </section>
          </div>
        </div>
      </div>

      <Footer />
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
    </div>
  );
}
