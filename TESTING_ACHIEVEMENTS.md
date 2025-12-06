# 🧪 Testing Achievements System

## Quick Test Guide

### 1. **Check Your Current Achievements**

Visit this URL (replace `YOUR_USER_ID` with your Glyph user ID):
```
http://localhost:3000/api/debug/check-achievements?userId=YOUR_USER_ID
```

This will show:
- Your profile data
- All achievements earned
- Quest progress
- Total bananas

### 2. **Manually Award an Achievement** (For Testing)

Use POST request to:
```
POST http://localhost:3000/api/debug/check-achievements
Body: {
  "userId": "YOUR_USER_ID",
  "achievementCode": "link_x_account"
}
```

### 3. **Test Each Achievement Type**

#### ✅ **Sign-In Achievements**
1. Sign out completely
2. Sign in again
3. Check browser console for API calls
4. Should see `first_sign_in` achievement (if new user)
5. Should see `link_x_account` if X is linked

**Debug:**
- Open browser DevTools → Network tab
- Look for calls to `/api/auth/init-user`
- Look for calls to `/api/gamify/award`
- Check console for any errors

#### ✅ **Creative Tool Achievements**
1. Open any creative tool (e.g., `/creative/meme`)
2. Wait 3 seconds (automatic tracking delay)
3. Check Network tab for `/api/gamify/tool-use` call
4. Should award `first_tool_use` + tool-specific achievement

**Tools to test:**
- Banner: `/creative/banners` → `banner_created`
- PFP: `/creative/pfp-border` → `pfp_border_created`
- Meme: `/creative/meme` → `meme_created`
- Collage: `/creative/collage` → `collage_created`
- Emote: `/creative/emotes` → `emote_created`
- Sticker: `/creative/stickers` → `sticker_created`
- QR: `/creative/qr` → `qr_created`
- Wardrobe: `/creative/wardrobe` → `wardrobe_used`

Use all 8 tools → Get `all_tools_used` (50🍌)

#### ✅ **Gallery Voting Achievements**
1. Go to `/gallery`
2. Click ❤️ on an image
3. Check Network tab for:
   - `/api/gallery/vote` (increments vote count)
   - `/api/gamify/like` (awards achievements)
4. Should award `first_vote` on first vote
5. Vote on 10/50/100 images for milestone achievements

**Duplicate Prevention Test:**
- Try clicking the same image twice
- Second click should return `alreadyVoted: true`
- No duplicate achievements awarded

#### ✅ **Gallery Submission Achievements**
1. Go to `/gallery/submit`
2. Upload and submit an image
3. Should award `first_submission`
4. Submit 5/10/25 images for milestone achievements

#### ✅ **Social Sharing Achievements**
1. Use the `ShareButton` component
2. Click "Share on X"
3. X opens with pre-filled text
4. Sharing is tracked immediately (honor system)

**Example usage:**
```tsx
<ShareButton 
  text="Check out this awesome gallery!"
  hashtags={['AOA', 'ApesOnApe']}
  mention={true}
  shareType="gallery"
/>
```

Awards:
- `#AOA` → `hashtag_aoa` achievement
- `#ApesOnApe` → `hashtag_apesonape` achievement
- `@apechainapes` → `tag_official` achievement

## 🔍 Troubleshooting

### Issue: "X Account Achievement Not Showing"

**Check:**
1. Is X account actually linked in Privy?
2. Open browser console
3. Type: `localStorage` to see stored data
4. Check Network tab for `/api/auth/init-user` call
5. Verify response includes X username

**Manual fix:**
```javascript
// In browser console
fetch('/api/gamify/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    achievementCode: 'link_x_account'
  })
}).then(r => r.json()).then(console.log)
```

### Issue: "Tool Usage Not Tracking"

**Check:**
1. Wait 3 full seconds after opening the tool
2. Check browser console for errors
3. Check Network tab for `/api/gamify/tool-use` call
4. Verify you're signed in (userId exists)

**Debug:**
```javascript
// In browser console on a tool page
console.log('User ID:', glyph?.user?.id)
```

### Issue: "Duplicate Votes Still Counting"

**Check:**
1. Are you signed in? (logged-in users can't double-vote)
2. Check Supabase `gallery_votes` table
3. Verify unique constraint exists on `(submission_id, voter_ip_hash, day)`

### Issue: "Achievements Not Appearing in Profile"

**Check:**
1. Run database migration: `sql/004_profiles_gamify_full.sql`
2. Verify `award_achievement()` function exists in Supabase
3. Check Supabase logs for errors
4. Verify RLS policies allow read access

**Check database function:**
```sql
SELECT * FROM pg_proc WHERE proname = 'award_achievement';
```

### Issue: "Bananas Not Updating"

**Check:**
1. Verify `user_profiles` table has `bananas` column
2. Check `award_achievement()` function calls `award_bananas()`
3. Manually update:
```sql
UPDATE user_profiles 
SET bananas = bananas + 10 
WHERE glyph_user_id = 'YOUR_USER_ID';
```

## 📊 Verify Database State

### Check User Profile
```sql
SELECT * FROM user_profiles WHERE glyph_user_id = 'YOUR_USER_ID';
```

### Check User Achievements
```sql
SELECT ua.achievement_code, ua.earned_at, ac.title, ac.bananas_reward
FROM gamify_user_achievements ua
JOIN gamify_achievements_catalog ac ON ua.achievement_code = ac.achievement_code
WHERE ua.glyph_user_id = 'YOUR_USER_ID'
ORDER BY ua.earned_at DESC;
```

### Check Quest Progress
```sql
SELECT uq.quest_code, uq.progress, uq.target, uq.status, qc.title
FROM gamify_user_quests uq
JOIN gamify_quests_catalog qc ON uq.quest_code = qc.quest_code
WHERE uq.glyph_user_id = 'YOUR_USER_ID';
```

### Check All Achievements Catalog
```sql
SELECT achievement_code, title, description, bananas_reward, category
FROM gamify_achievements_catalog
ORDER BY category, achievement_code;
```

## 🎯 Test Scenarios

### Scenario 1: New User Journey
1. Sign in → +5🍌 (first_sign_in)
2. X linked → +10🍌 (link_x_account)
3. Submit image → +5🍌 (first_submission)
4. Vote on image → +2🍌 (first_vote)
5. Use meme tool → +5🍌 (first_tool_use) + +5🍌 (meme_created)
**Expected: 32🍌 total**

### Scenario 2: Tool Master
1. Use all 8 creative tools (3 second delay each)
2. Check profile after each tool
3. Should see 8 individual tool achievements
4. After 8th tool → `all_tools_used` +50🍌
**Expected: 8×5🍌 + 50🍌 = 90🍌 from tools**

### Scenario 3: Gallery Power User
1. Submit 5 images → `5_submissions` +20🍌
2. Vote on 10 images → `10_votes_cast` +10🍌
3. Get 10 votes on one submission → `10_votes_received` +15🍌
**Expected: Multiple milestone achievements**

### Scenario 4: Social Butterfly
1. Click share button with `#AOA` → `hashtag_aoa` +5🍌
2. Click share button with `#ApesOnApe` → `hashtag_apesonape` +5🍌
3. Click share button with `@apechainapes` → `tag_official` +5🍌
4. Share 3 times → Complete `share_3_times` quest +10🍌
**Expected: 25🍌 from social sharing**

## 🚀 Quick Test All Features

Run this in browser console (replace YOUR_USER_ID):

```javascript
const userId = 'YOUR_USER_ID';

// Check current state
fetch(`/api/debug/check-achievements?userId=${userId}`)
  .then(r => r.json())
  .then(data => {
    console.log('=== CURRENT STATE ===');
    console.log('Bananas:', data.totalBananas);
    console.log('Achievements:', data.totalAchievements);
    console.log('Quests:', data.quests.length);
    console.table(data.achievements);
  });
```

## 📝 Notes

- Tool tracking has a **3 second delay** to ensure users actually interact
- Duplicate votes are **prevented by userId + submissionId hash**
- Achievements can only be earned **once** (database enforces uniqueness)
- Quests **disappear when completed** (hidden from UI)
- Notifications **poll every 10 seconds** for new achievements
- X sharing uses **honor system** (opens share dialog, tracks on click)

## 🔗 Useful Links

- Profile: `http://localhost:3000/profile`
- Leaderboard: `http://localhost:3000/leaderboard`
- Debug API: `http://localhost:3000/api/debug/check-achievements?userId=YOUR_ID`
- Supabase Dashboard: Check your project URL

## ❓ FAQ

**Q: Why don't I see the X account achievement?**
A: Make sure X is linked in Privy, then sign out and sign back in. The achievement is awarded on sign-in.

**Q: Can I test achievements without waiting?**
A: Yes! Use the debug POST endpoint to manually award any achievement.

**Q: How do I reset my achievements for testing?**
A: Delete rows from `gamify_user_achievements` table for your user ID.

**Q: Do I need to actually post on X to get social achievements?**
A: No! The ShareButton tracks when you click it (opens X dialog). It's honor system.

**Q: Why are completed quests hidden?**
A: Design choice! Once completed, they're removed from the active quests list to reduce clutter.

