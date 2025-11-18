# 📥 Git Installation & GitHub Upload Guide

## Step 1: Install Git

1. **Download Git for Windows**
   - Go to: https://git-scm.com/download/win
   - Download the latest version (64-bit)
   - Run the installer

2. **Installation Settings** (use defaults, but check these):
   - ✅ Use Git from the command line and also from 3rd-party software
   - ✅ Use the OpenSSL library
   - ✅ Checkout Windows-style, commit Unix-style line endings
   - ✅ Use MinTTY (default terminal)
   - ✅ Enable file system caching

3. **Complete Installation**
   - Click "Install"
   - Wait for installation to finish
   - **IMPORTANT**: Restart your terminal/PowerShell after installation

## Step 2: Verify Installation

After restarting PowerShell, run:

```powershell
git --version
```

You should see something like: `git version 2.x.x`

## Step 3: Configure Git (First Time Only)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 4: Navigate to Your Project

```powershell
cd C:\Users\guill\Desktop\MrGamePlayer
```

## Step 5: Initialize Git Repository

```powershell
git init
```

## Step 6: Check What Will Be Committed

```powershell
git status
```

You should see only source code files, NOT:
- ❌ node_modules/
- ❌ *.mp4 files
- ❌ *.zip files
- ❌ artifacts/
- ❌ cache/

## Step 7: Add Files

```powershell
git add .
```

This will add all files EXCEPT those in `.gitignore`

## Step 8: Verify Files Added

```powershell
git status
```

Check that large files are NOT listed.

## Step 9: Create Initial Commit

```powershell
git commit -m "Initial commit - Railway deployment ready"
```

## Step 10: Create GitHub Repository

1. Go to https://github.com
2. Sign in or create account
3. Click "+" → "New repository"
4. Name: `MrGamePlayer`
5. Description: "Multiplayer gaming platform with MGP token"
6. Choose: Public or Private
7. **DO NOT** check "Initialize with README"
8. Click "Create repository"

## Step 11: Connect to GitHub

Copy the repository URL from GitHub (it will show after creation), then run:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/MrGamePlayer.git
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 12: Push to GitHub

```powershell
git branch -M main
git push -u origin main
```

You'll be prompted for GitHub username and password (use Personal Access Token, not password).

## Step 13: Create Personal Access Token (If Needed)

If GitHub asks for authentication:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: "MrGamePlayer"
4. Select scopes: `repo` (full control)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

## 🚨 Troubleshooting

### "File too large" error?

Make sure `.gitignore` is working:
```powershell
git check-ignore -v Endless-Runner-development.zip
```

Should show: `.gitignore:44:Endless-Runner-development.zip`

### Files still showing?

Remove them from tracking:
```powershell
git rm --cached Endless-Runner-development.zip
git rm --cached mission-unstable-master.zip
git rm --cached generated_video.mp4
git rm --cached public/generated_video.mp4
git commit -m "Remove large files"
```

### Authentication failed?

Use Personal Access Token instead of password.

---

**Ready?** Start with Step 1 and let me know when Git is installed! 🚀

