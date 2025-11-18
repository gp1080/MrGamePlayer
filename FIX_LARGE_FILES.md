# 🔧 Fix "File Too Large" Error in GitHub Desktop

## Problem
GitHub has a 100MB file size limit. Some files in your project are too large to commit.

## Solution: Remove Large Files from Git Tracking

### Step 1: In GitHub Desktop

1. **Open GitHub Desktop**
2. **Go to Repository → Repository Settings** (or press `Ctrl + ,`)
3. **Click "Ignored Files" tab**
4. **Make sure these are listed** (they should be auto-detected):
   - `node_modules/`
   - `*.mp4`
   - `*.zip`
   - `artifacts/`
   - `cache/`

### Step 2: Unstage Large Files

If files are already staged:

1. **In GitHub Desktop, look at the "Changes" tab**
2. **Find these large files**:
   - `Endless-Runner-development.zip`
   - `mission-unstable-master.zip`
   - `generated_video.mp4`
   - `public/generated_video.mp4`
   - Any files in `node_modules/`
   - Any files in `artifacts/`
   - Any files in `cache/`

3. **Right-click each large file** → **"Discard"** or **"Ignore"**

### Step 3: Verify .gitignore

Make sure `.gitignore` includes:
```
node_modules/
*.mp4
*.zip
artifacts/
cache/
```

### Step 4: Alternative - Use Command Line

If GitHub Desktop doesn't work, open PowerShell in your project folder and run:

```powershell
# Remove large files from git tracking
git rm --cached Endless-Runner-development.zip
git rm --cached mission-unstable-master.zip
git rm --cached generated_video.mp4
git rm --cached public/generated_video.mp4
git rm -r --cached node_modules/
git rm -r --cached artifacts/
git rm -r --cached cache/

# Commit the removal
git commit -m "Remove large files from tracking"
```

### Step 5: Commit Again

After removing large files:
1. **Review changes** in GitHub Desktop
2. **Only source code files should be visible**
3. **Write commit message**: "Initial commit - Railway ready"
4. **Click "Commit to main"**
5. **Click "Push origin"**

## ✅ What Should Be Committed

**DO Commit:**
- ✅ `src/` - All source code
- ✅ `public/` - Public assets (except videos)
- ✅ `server/` - WebSocket server
- ✅ `contracts/` - Smart contracts
- ✅ `scripts/` - Deployment scripts
- ✅ `package.json` - Dependencies
- ✅ `README.md` - Documentation
- ✅ `.gitignore` - Git ignore rules
- ✅ `Procfile` - Railway config
- ✅ `railway.json` - Railway config

**DON'T Commit:**
- ❌ `node_modules/` - Dependencies (too large)
- ❌ `*.mp4` - Video files (too large)
- ❌ `*.zip` - Archive files (too large)
- ❌ `artifacts/` - Build artifacts
- ❌ `cache/` - Cache files
- ❌ `.env` - Environment variables (secrets)

## 🎯 Quick Fix Checklist

- [ ] Large zip files removed from tracking
- [ ] Video files removed from tracking
- [ ] `node_modules/` excluded
- [ ] `artifacts/` excluded
- [ ] `cache/` excluded
- [ ] `.gitignore` updated
- [ ] Only source code files staged
- [ ] Commit successful
- [ ] Push successful

## 💡 Tips

- **GitHub Desktop** should automatically respect `.gitignore`
- If files are already tracked, you need to remove them first
- Large files can be stored elsewhere (Google Drive, Dropbox) if needed
- Railway will install `node_modules` automatically during build

---

**After fixing, try committing again!** 🚀

