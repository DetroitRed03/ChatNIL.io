# 📋 Supabase Dashboard Setup - Step by Step

## 🎯 Your Mission
Create or fix your Supabase project so ChatNIL can use a real database instead of fake mock data.

## Step 1: Access Supabase Dashboard
1. Go to **https://app.supabase.com**
2. **Sign in** to your account
3. Look at your **project list**

## Step 2: Check Existing Project
Look for a project with ID `enbuwffusjhpecyvoewb`:

### Option A: Project EXISTS ✅
If you see the project:
1. **Click on it** to open
2. Check if it shows **"Paused"** or **"Inactive"**
3. If paused, click **"Resume project"**
4. Wait for it to become active
5. Go to **Settings → API**
6. **Copy the credentials** (see Step 4 below)

### Option B: Project DOESN'T EXIST ❌
If you don't see the project:
1. Click **"New Project"**
2. **Project Name**: `ChatNIL`
3. **Organization**: Choose your organization
4. **Region**: Choose **US East** (or closest to you)
5. **Database Password**: Create a strong password (save it!)
6. Click **"Create new project"**
7. **Wait 2-3 minutes** for setup to complete
8. Go to **Settings → API**
9. **Copy the credentials** (see Step 4 below)

## Step 3: Wait for Project to be Ready
- Project status should show **"Active"** with a green indicator
- If it's still setting up, wait until fully ready
- You'll see a dashboard with graphs when ready

## Step 4: Get Your Credentials
Go to **Settings → API** and copy these values:

### Project URL
```
Copy the URL that looks like:
https://[project-id].supabase.co
```

### API Keys
```
anon/public key: Copy the "anon" key (long string starting with eyJ...)
service_role key: Copy the "service_role" key (long string starting with eyJ...)
```

## Step 5: Send Me Your New Credentials
Once you have them, provide me with:
```
Project URL: https://[your-project-id].supabase.co
Anon Key: eyJ[your-anon-key]...
Service Role Key: eyJ[your-service-role-key]...
```

## Step 6: I'll Update Your Environment
After you provide the credentials, I'll:
1. Update your `.env.local` file
2. Test the connection
3. Run the database setup
4. Switch from mock to real mode
5. Test everything works

## 🚨 Important Notes
- **Save your database password** - you might need it later
- **Don't share credentials publicly** - only share with me in our private conversation
- **Free tier is fine** for development and testing
- **The project URL will be different** from the old one

## ❓ Need Help?
If you get stuck on any step, just let me know:
- Screenshot what you're seeing
- Tell me which step you're on
- I'll guide you through it

---

**Once you complete these steps and give me the credentials, I'll handle all the technical setup automatically!** 🚀