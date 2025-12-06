# 🎮 Gamification System Documentation

## Overview

The Apes on Ape website includes a comprehensive gamification system that rewards users with "bananas" (points) for various actions. Users can earn achievements, complete quests, and compete on the leaderboard.

## 🍌 Bananas (Points System)

Bananas are the currency of engagement. Users earn them by:
- Completing achievements
- Completing quests  
- Contributing to the community

## 🏆 Achievements (35+)

### Getting Started (3)
| Code | Name | Description | Reward | Trigger |
|------|------|-------------|---------|---------|
| `first_sign_in` | First Steps | Sign in for the first time | 5🍌 | Automatic on first sign-in |
| `link_x_account` | Socialite | Link your X (Twitter) account | 10🍌 | Automatic when X is linked |
| `join_discord` | Community Member | Join the Discord | 10🍌 | Manual (future implementation) |

### Gallery Submissions (4)
| Code | Name | Description | Reward | Trigger |
|------|------|-------------|---------|---------|
| `first_submission` | First Upload | Submit first image | 5🍌 | First gallery submission |
| `5_submissions` | Prolific Creator | Submit 5 images | 20🍌 | 5th submission |
| `10_submissions` | Unstoppable | Submit 10 images | 40🍌 | 10th submission |
| `25_submissions` | Legend | Submit 25 images | 100🍌 | 25th submission |

### Gallery Voting (4)
| Code | Name | Description | Reward | Trigger |
|------|------|-------------|---------|---------|
| `first_vote` | Voter | Cast first vote | 2🍌 | First vote on any image |
| `10_votes_cast` | Active Voter | Cast 10 votes | 10🍌 | 10th vote cast |
| `50_votes_cast` | Super Voter | Cast 50 votes | 25🍌 | 50th vote cast |
| `100_votes_cast` | Mega Voter | Cast 100 votes | 50🍌 | 100th vote cast |

### Gallery Popularity (3)
| Code | Name | Description | Reward | Trigger |
|------|------|-------------|---------|---------|
| `10_votes_received` | Popular | Get 10 votes on submission | 15🍌 | When any submission reaches 10 votes |
| `50_votes_received` | Viral | Get 50 votes on submission | 50🍌 | When any submission reaches 50 votes |
| `100_votes_received` | Influencer | Get 100 votes on submission | 100🍌 | When any submission reaches 100 votes |

### Creative Tools (10)
| Code | Name | Description | Reward | Trigger |
|------|------|-------------|---------|---------|
| `first_tool_use` | Creator | Use any creative tool | 5🍌 | First time using any tool |
| `banner_created` | Banner Master | Create a banner | 5🍌 | Use banner generator |
| `pfp_border_created` | PFP Artist | Create PFP with border | 5🍌 | Use PFP border tool |
| `meme_created` | Meme Lord | Create a meme | 5🍌 | Use meme generator |
| `collage_created` | Collage Master | Create a collage | 5🍌 | Use collage tool |
| `emote_created` | Emote Enthusiast | Create an emote | 5🍌 | Use emote maker |
| `sticker_created` | Sticker Collector | Create sticker pack | 5🍌 | Use sticker builder |
| `qr_created` | QR Genius | Generate QR code | 5🍌 | Use QR generator |
| `wardrobe_used` | Wardrobe Wizard | Use wardrobe | 5🍌 | Use wardrobe customizer |
| `all_tools_used` | Master Creator | Use all 8 tools | 50🍌 | After using all tools |

### Social Engagement (4)
| Code | Name | Description | Reward | Trigger |
|------|------|-------------|---------|---------|
| `first_share` | Sharer | Share content | 3🍌 | First share |
| `hashtag_aoa` | AOA Ambassador | Use #AOA in post | 5🍌 | Share with #AOA hashtag |
| `hashtag_apesonape` | Apes Advocate | Use #ApesOnApe | 5🍌 | Share with #ApesOnApe |
| `tag_official` | Ape Ally | Tag @apechainapes | 5🍌 | Tag official account |

### Milestones (7)
| Code | Name | Description | Reward | Trigger |
|------|------|-------------|---------|---------|
| `100_bananas` | Banana Collector | Earn 100 bananas | 10🍌 | Reach 100 total bananas |
| `500_bananas` | Banana Hoarder | Earn 500 bananas | 25🍌 | Reach 500 total bananas |
| `1000_bananas` | Banana Tycoon | Earn 1000 bananas | 50🍌 | Reach 1000 total bananas |
| `top_10_leaderboard` | Rising Star | Reach top 10 | 50🍌 | Enter top 10 on leaderboard |
| `top_3_leaderboard` | Elite Ape | Reach top 3 | 100🍌 | Enter top 3 on leaderboard |
| `rank_1_leaderboard` | Apex Ape | Reach #1 | 200🍌 | Reach #1 on leaderboard |

## 🎯 Quests (20+)

### Daily Quests (3)
| Code | Name | Description | Target | Reward | Reset |
|------|------|-------------|--------|--------|-------|
| `daily_vote_5` | Daily Voter | Vote on 5 images | 5 | 5🍌 | Daily* |
| `daily_submit` | Daily Creator | Submit an image | 1 | 5🍌 | Daily* |
| `daily_tool_use` | Daily Artist | Use any tool | 1 | 3🍌 | Daily* |

*Note: Currently quests don't auto-reset daily. Once completed, they're hidden.

### Gallery Quests (5)
| Code | Name | Description | Target | Reward |
|------|------|-------------|--------|--------|
| `like_5_images` | Spread the Love | Like 5 images | 5 | 5🍌 |
| `like_20_images` | Super Supporter | Like 20 images | 20 | 10🍌 |
| `share_gallery_image` | Gallery Ambassador | Share a gallery image | 1 | 3🍌 |
| `vote_on_20` | Vote Marathon | Cast 20 votes | 20 | 10🍌 |
| `submit_3_one_day` | Submission Spree | Submit 3 in one day | 3 | 10🍌 |

### Creative Quests (4)
| Code | Name | Description | Target | Reward |
|------|------|-------------|--------|--------|
| `use_all_tools` | Tool Master | Use all 8 tools | 8 | 20🍌 |
| `create_5_memes` | Meme Machine | Create 5 memes | 5 | 15🍌 |
| `create_3_pfps` | PFP Pro | Create 3 PFPs | 3 | 10🍌 |
| `create_2_collages` | Collage Connoisseur | Create 2 collages | 2 | 8🍌 |

### Social Quests (4)
| Code | Name | Description | Target | Reward |
|------|------|-------------|--------|--------|
| `share_with_aoa` | AOA Hashtag Hero | Share with #AOA | 1 | 5🍌 |
| `share_with_apesonape` | ApesOnApe Promoter | Share with #ApesOnApe | 1 | 5🍌 |
| `tag_apechainapes` | Official Mention | Tag @apechainapes | 1 | 5🍌 |
| `share_3_times` | Social Butterfly | Share 3 times | 3 | 10🍌 |

### Community Quests (4)
| Code | Name | Description | Target | Reward |
|------|------|-------------|--------|--------|
| `link_x_account_quest` | Connect Identity | Link X account | 1 | 10🍌 |
| `visit_all_pages` | Explorer | Visit all main pages | 4 | 8🍌 |
| `complete_5_quests` | Quest Hunter | Complete 5 quests | 5 | 15🍌 |
| `complete_10_achievements` | Achievement Hunter | Unlock 10 achievements | 10 | 25🍌 |

## 📋 Automatic Tracking

### Sign-In Flow
1. User signs in → `POST /api/auth/init-user`
   - Creates user profile in Supabase
   - Awards `first_sign_in` achievement (if new user)
   - Fetches X profile data
   - Awards `link_x_account` achievement (if X linked)

### Gallery Submissions
1. User submits image → `POST /api/gallery/submit`
   - Awards `first_submission` achievement
   - Progresses `daily_submit` and `submit_3_one_day` quests
   - Checks total submission count
   - Awards milestone achievements (`5_submissions`, `10_submissions`, `25_submissions`)

### Gallery Voting
1. User clicks like → `POST /api/gallery/vote`
   - Prevents duplicate votes (by user ID or IP hash)
   - Only awards points/achievements on new votes
2. If new vote → `POST /api/gamify/like`
   - Awards `first_vote` achievement
   - Progresses voting quests (`like_5_images`, `like_20_images`, `vote_on_20`, `daily_vote_5`)
   - Checks total vote count
   - Awards milestone achievements (`10_votes_cast`, `50_votes_cast`, `100_votes_cast`)
   - Checks author's submission vote count
   - Awards popularity achievements to author (`10_votes_received`, `50_votes_received`, `100_votes_received`)

### Creative Tool Usage
1. User opens tool → `useToolTracking` hook (3 second delay)
2. After delay → `POST /api/gamify/tool-use`
   - Awards `first_tool_use` achievement
   - Awards tool-specific achievement
   - Progresses `daily_tool_use` quest
   - Progresses `use_all_tools` quest
   - Progresses tool-specific quests (memes, PFPs, collages)
   - Checks if all 8 tools used → Awards `all_tools_used`

### Profile Loading
1. User views profile → `GET /api/profile/summary`
2. Background → `POST /api/gamify/check-milestones`
   - Checks banana milestones (`100_bananas`, `500_bananas`, `1000_bananas`)
   - Checks leaderboard position
   - Awards leaderboard achievements (`top_10_leaderboard`, `top_3_leaderboard`, `rank_1_leaderboard`)

## 🔒 Duplicate Prevention

### Gallery Votes
- Stored in `gallery_votes` table
- Unique constraint on `(submission_id, voter_ip_hash, day)`
- Logged-in users: hash includes `user:{userId}:{submissionId}`
- Anonymous users: hash includes `ip:{ip}:{submissionId}`
- Duplicate votes are silently ignored
- Achievements only awarded on new votes

### Achievements
- Stored in `gamify_user_achievements` table
- Unique constraint on `(glyph_user_id, achievement_code)`
- Database function `award_achievement()` checks for duplicates
- Returns `false` if already earned
- No double rewards

### Quests
- Stored in `gamify_user_quests` table
- Unique constraint on `(glyph_user_id, quest_code)`
- Database function `progress_quest()` handles progress
- Auto-completes when target reached
- Completed quests hidden from UI

## 📊 Data Storage

### User Profiles
```sql
user_profiles (
  glyph_user_id TEXT PRIMARY KEY,
  avatar_url TEXT,
  display_name TEXT,
  x_username TEXT,
  bananas INTEGER DEFAULT 0
)
```

### Avatar Storage Priority
1. **Supabase custom avatar** (if uploaded via profile)
2. **X/Twitter profile picture** (from Privy API)

Profile data fetched from Supabase first, then falls back to Privy.

## 🔔 Notifications

Real-time toast notifications appear when users:
- Earn an achievement
- Complete a quest
- Receive bananas

Notifications:
- Auto-appear bottom-right
- Show banana rewards
- Auto-dismiss after 5 seconds
- Poll every 10 seconds for new notifications

## 🏅 Leaderboard

- Top users ranked by total bananas
- Tiebreaker: Earlier sign-up time
- Updates in real-time
- Accessible at `/leaderboard`
- Preview in `/profile` (top 10)

## 🚀 Setup

See `sql/README.md` for database setup instructions.

## 📝 Adding New Achievements

1. Add to `gamify_achievements_catalog` table:
```sql
INSERT INTO gamify_achievements_catalog 
  (achievement_code, title, description, badge_icon, bananas_reward, category)
VALUES 
  ('new_code', 'Title', 'Description', '🎯', 10, 'category');
```

2. Add trigger in relevant API endpoint:
```typescript
await supabase.rpc('award_achievement', {
  p_glyph_user_id: userId,
  p_achievement_code: 'new_code'
});
```

3. Document in this file!

## 🐛 Troubleshooting

### Achievements not triggering
- Check browser console for API errors
- Verify user is signed in (userId exists)
- Check Supabase logs for database errors
- Ensure `award_achievement()` function exists

### Duplicate votes not prevented
- Check `gallery_votes` table has unique constraint
- Verify IP hash generation in `/api/gallery/vote`
- Check for RLS policy issues

### Notifications not appearing
- Verify `NotificationToast` component in layout
- Check `gamify_notifications` table has data
- Verify `is_read` column exists
- Check browser console for fetch errors

## 📈 Analytics Ideas

Track these metrics for community engagement:
- Total bananas distributed
- Most earned achievements
- Quest completion rates
- Average submissions per user
- Vote distribution (givers vs receivers)
- Tool usage popularity
- Leaderboard turnover rate

