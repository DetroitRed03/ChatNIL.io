# Dev Server Management Guide

## Problem
The project was experiencing multiple ghost dev servers running simultaneously, causing:
- Port conflicts
- API calls not persisting (changes reverting after refresh)
- Confusion about which server is actually serving the app

## Solution

### Safe Dev Server Script

Use the **safe dev server script** to ensure only ONE server runs at a time:

```bash
npm run dev:safe
```

Or directly:

```bash
./dev.sh
```

### What it does:
1. ✅ Kills any existing Next.js dev servers
2. ✅ Kills any processes on port 3000
3. ✅ Waits for processes to fully terminate
4. ✅ Verifies port is free before starting
5. ✅ Starts a single clean dev server

### Manual Cleanup (if needed)

If you still have ghost servers, run:

```bash
# Kill all Next.js dev servers
pkill -9 -f "next dev"
pkill -9 -f "npm run dev"

# Kill anything on port 3000
lsof -ti:3000 | xargs kill -9

# Or use the all-in-one nuclear option:
killall -9 node npm next
```

## How to Prevent Multiple Servers

### DO ✅
- Always use `npm run dev:safe` to start the server
- Check if a server is already running: `lsof -ti:3000`
- Kill existing servers before starting new ones

### DON'T ❌
- Don't run `npm run dev` multiple times
- Don't leave background dev servers running when testing
- Don't ignore port conflict warnings

## Checking Running Servers

```bash
# See all dev servers
ps aux | grep -E "npm run dev|next dev" | grep -v grep

# See what's on port 3000
lsof -ti:3000
```

## Recent Fixes

### Chat Persistence Issues (FIXED ✅)

Both chat **rename** and **delete** operations now persist after page refresh:

- **File**: `lib/chat-history-store.ts`
  - `renameChat()` - Now calls PUT API before updating local state
  - `deleteChat()` - Now calls DELETE API before updating local state

- **File**: `components/Sidebar.tsx`
  - `handleRenameChat()` - Now awaits async renameChat()
  - `handleDeleteChat()` - Now awaits async deleteChat()

### How it works:
1. User performs action (rename/delete)
2. Function calls API endpoint to update database
3. After API success, local state is updated
4. On page refresh, data is loaded from database (changes persist)

## Testing

To verify everything works:

1. Start server: `npm run dev:safe`
2. Open: `http://localhost:3000`
3. Test rename: Rename a chat, refresh page → name persists ✅
4. Test delete: Delete a chat, refresh page → chat stays deleted ✅
5. Check console for: `✅ Successfully renamed/deleted chat in database`
