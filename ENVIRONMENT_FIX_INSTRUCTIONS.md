# Environment Variable Fix - Root Cause Found

## The Problem

Your **system environment variables** have the OLD Supabase database URL hardcoded:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://enbuwffusjhpcyoveewb.supabase.co  # OLD
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # OLD
```

System environment variables **override** `.env.local` in Next.js, which is why the NEW database URL in `.env.local` is being ignored.

## The Fix

You need to **permanently remove** these OLD environment variables from your system. They're likely set in one of these places:

### Option 1: VSCode Workspace Settings (Most Likely)

1. In VSCode, press `Cmd+Shift+P`
2. Type "Preferences: Open Workspace Settings (JSON)"
3. Look for any `env`, `terminal.integrated.env`, or Supabase-related settings
4. Remove any Supabase environment variables
5. Restart VSCode

### Option 2: VSCode User Settings

1. Press `Cmd+Shift+P`
2. Type "Preferences: Open User Settings (JSON)"
3. Search for Supabase environment variables
4. Remove them
5. Restart VSCode

### Option 3: Check for `.vscode/settings.json`

```bash
cat .vscode/settings.json
```

If it contains Supabase environment variables, edit or delete them.

### Option 4: System-Wide Environment Variables

Check if they're in your shell profile:

```bash
# Check all shell profiles
grep -n "SUPABASE" ~/.zshrc ~/.bashrc ~/.bash_profile ~/.profile ~/.zshenv 2>/dev/null
```

If found, remove those lines and run:

```bash
source ~/.zshrc  # or whichever file you edited
```

## Temporary Workaround

Until you find and remove the system environment variables, you can start the dev server with:

```bash
./start-clean-dev.sh
```

This script unsets the OLD environment variables before starting the server, allowing `.env.local` to be used.

## Verification

After fixing, run this to verify the OLD variables are gone:

```bash
env | grep SUPABASE
```

You should see **nothing**, because the variables should only exist in `.env.local`, not in your system environment.

Then start the dev server normally:

```bash
npm run dev
```

And check that the browser console shows the NEW database URL:

```
📊 Supabase URL: https://lqskiijspudfocddhkqs.supabase.co
```

## Why This Happened

At some point, you likely exported Supabase environment variables to your shell or VSCode settings. These got "stuck" in your environment and have been overriding `.env.local` ever since.

The fix is to remove them permanently from wherever they're set, then rely solely on `.env.local` for environment configuration.
