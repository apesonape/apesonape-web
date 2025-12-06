# Gamification System Database Setup

This directory contains SQL migration files for the full gamification system including user profiles, achievements, quests, and leaderboard functionality.

## Files

- **004_profiles_gamify_full.sql** - Complete gamification schema with:
  - User profiles with banana points and avatars
  - Achievements catalog (35+ achievements)
  - User achievements tracking
  - Quests catalog (20+ quests)
  - User quest progress
  - Notifications for earned rewards
  - Leaderboard infrastructure

## Quick Setup

### 1. Run the Migration

In your Supabase project SQL editor, run:

```sql
-- Execute the full gamification setup
\i 004_profiles_gamify_full.sql
```

Or copy and paste the contents of `004_profiles_gamify_full.sql` into the Supabase SQL Editor and execute.

### 2. Verify Tables Created

Check that these tables exist:
- `user_profiles`
- `gamify_achievements_catalog`
- `gamify_user_achievements`
- `gamify_quests_catalog`
- `gamify_user_quests`
- `gamify_notifications`

### 3. Verify Storage Bucket

Make sure the `avatars` storage bucket exists:
1. Go to Storage in Supabase Dashboard
2. Create a bucket named `avatars` if it doesn't exist
3. Make it public or run the policy from `003_storage_avatars_bucket.sql`

## Features

### Achievements (35+ total)

**Getting Started:**
- First Steps - Sign in for the first time (5🍌)
- Socialite - Link X account (10🍌)
- Community Member - Join Discord (10🍌)

**Gallery Submissions:**
- First Upload - Submit first image (5🍌)
- Prolific Creator - 5 submissions (20🍌)
- Unstoppable - 10 submissions (40🍌)
- Legend - 25 submissions (100🍌)

**Gallery Voting:**
- Voter - First vote (2🍌)
- Active Voter - 10 votes (10🍌)
- Super Voter - 50 votes (25🍌)
- Mega Voter - 100 votes (50🍌)

**Gallery Popularity:**
- Popular - Get 10 votes (15🍌)
- Viral - Get 50 votes (50🍌)
- Influencer - Get 100 votes (100🍌)

**Creative Tools:**
- Creator - Use any tool (5🍌)
- PFP Artist - Create PFP (5🍌)
- Meme Lord - Create meme (5🍌)
- Collage Master - Create collage (5🍌)
- Emote Enthusiast - Create emote (5🍌)
- Sticker Collector - Create sticker (5🍌)
- QR Genius - Create QR code (5🍌)
- Wardrobe Wizard - Use wardrobe (5🍌)
- Master Creator - Use all tools (50🍌)

**Social Engagement:**
- Sharer - First share (3🍌)
- AOA Ambassador - Use #AOA (5🍌)
- Apes Advocate - Use #ApesOnApe (5🍌)
- Ape Ally - Tag @apechainapes (5🍌)

**Milestones:**
- Banana Collector - 100 bananas (10🍌)
- Banana Hoarder - 500 bananas (25🍌)
- Banana Tycoon - 1000 bananas (50🍌)
- Rising Star - Top 10 leaderboard (50🍌)
- Elite Ape - Top 3 leaderboard (100🍌)
- Apex Ape - #1 leaderboard (200🍌)

### Quests (20+ total)

**Daily Quests:**
- Daily Voter - Vote on 5 images (5🍌)
- Daily Creator - Submit an image (5🍌)
- Daily Artist - Use any tool (3🍌)

**Gallery Quests:**
- Spread the Love - Like 5 images (5🍌)
- Super Supporter - Like 20 images (10🍌)
- Gallery Ambassador - Share a gallery image (3🍌)
- Vote Marathon - Cast 20 votes (10🍌)
- Submission Spree - Submit 3 in one day (10🍌)

**Creative Quests:**
- Tool Master - Use all 7 tools (20🍌)
- Meme Machine - Create 5 memes (15🍌)
- PFP Pro - Create 3 PFPs (10🍌)
- Collage Connoisseur - Create 2 collages (8🍌)

**Social Quests:**
- AOA Hashtag Hero - Share with #AOA (5🍌)
- ApesOnApe Promoter - Share with #ApesOnApe (5🍌)
- Official Mention - Tag @apechainapes (5🍌)
- Social Butterfly - Share 3 times (10🍌)

**Community Quests:**
- Connect Your Identity - Link X account (10🍌)
- Explorer - Visit all main pages (8🍌)
- Quest Hunter - Complete 5 quests (15🍌)
- Achievement Hunter - Unlock 10 achievements (25🍌)

## How It Works

### Awarding Achievements

```typescript
// Award an achievement
await fetch('/api/gamify/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: 'user-id', 
    achievementCode: 'first_submission' 
  })
});
```

### Progressing Quests

```typescript
// Progress a quest
await fetch('/api/gamify/quest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: 'user-id', 
    questCode: 'daily_vote_5',
    increment: 1
  })
});
```

### Getting User Summary

```typescript
// Fetch user's profile, achievements, and quests
const res = await fetch(`/api/profile/summary?userId=${userId}`);
const data = await res.json();
// { bananas, achievements, quests, profile }
```

### Leaderboard

```typescript
// Fetch top 10 users
const res = await fetch('/api/leaderboard?limit=10');
const data = await res.json();
// { leaderboard: [ { rank, userId, displayName, bananas, ... } ] }
```

### Notifications

```typescript
// Fetch unread notifications
const res = await fetch(`/api/notifications?userId=${userId}&unreadOnly=true`);
const data = await res.json();
// { notifications: [ { title, message, bananas_earned, ... } ] }

// Mark as read
await fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notificationIds: ['id1', 'id2'] })
});
```

## Automatic Triggers

The system includes PostgreSQL functions that automatically:
- Award bananas when achievements are earned
- Create notifications for earned achievements/quests
- Track quest progress and auto-complete when targets are met
- Update user profiles with latest point totals

## Adding New Achievements/Quests

### Add a New Achievement

```sql
INSERT INTO public.gamify_achievements_catalog 
  (achievement_code, title, description, badge_icon, bananas_reward, category) 
VALUES 
  ('new_achievement', 'New Achievement Title', 'Description here', '🎯', 10, 'milestone');
```

### Add a New Quest

```sql
INSERT INTO public.gamify_quests_catalog 
  (quest_code, title, description, quest_icon, bananas_reward, category, target_count) 
VALUES 
  ('new_quest', 'New Quest Title', 'Description here', '🎮', 15, 'daily', 5);
```

## Quick Fix for "is_read" Column Error

If you see `ERROR: 42703: column "is_read" does not exist`, run this:

```sql
-- Run 005_fix_notifications_column.sql
```

Or manually add the column:

```sql
ALTER TABLE public.gamify_notifications 
ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;
```

## Complete Reset (Optional)

If you want to start completely fresh:

1. **Run cleanup script:**
   ```sql
   -- Execute 000_cleanup_gamify.sql
   ```

2. **Then run the full migration:**
   ```sql
   -- Execute 004_profiles_gamify_full.sql
   ```

⚠️ **WARNING:** This will delete ALL gamification data (points, achievements, quests)!

## Troubleshooting

### RLS Policies

If you get permission errors:
1. Check that RLS policies are enabled on all tables
2. Verify service role is being used for write operations
3. Check that read policies allow public access for leaderboard/catalogs

### Functions Not Working

If `award_achievement` or `progress_quest` functions fail:
1. Check function definitions in Supabase SQL Editor
2. Verify tables exist and have correct schema
3. Check PostgreSQL logs for detailed error messages

### Notifications Not Appearing

1. Verify `gamify_notifications` table has data
2. Check that `NotificationToast` component is included in layout
3. Ensure user is signed in (userId is required)

## Support

For issues or questions:
- Check Supabase logs for database errors
- Review browser console for API call errors
- Ensure all environment variables are set correctly

