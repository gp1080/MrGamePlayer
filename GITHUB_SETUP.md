# 📦 GitHub Setup Guide

## Option 1: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop**
   - Go to [desktop.github.com](https://desktop.github.com)
   - Download and install

2. **Add Repository**
   - Open GitHub Desktop
   - File → Add Local Repository
   - Select: `C:\Users\guill\Desktop\MrGamePlayer`
   - Click "Add Repository"

3. **Create GitHub Repository**
   - Click "Publish repository" button
   - Name: `MrGamePlayer` (or your preferred name)
   - Description: "Multiplayer gaming platform with MGP token"
   - Choose: Public or Private
   - Click "Publish Repository"

4. **Commit and Push**
   - Review changes in GitHub Desktop
   - Write commit message: "Initial commit - Railway deployment ready"
   - Click "Commit to main"
   - Click "Push origin"

## Option 2: Using Git Command Line

### Step 1: Install Git

1. **Download Git for Windows**
   - Go to [git-scm.com/download/win](https://git-scm.com/download/win)
   - Download and install
   - Restart terminal after installation

### Step 2: Initialize Git Repository

```bash
# Navigate to project directory
cd C:\Users\guill\Desktop\MrGamePlayer

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Railway deployment ready"
```

### Step 3: Create GitHub Repository

1. **Go to GitHub**
   - Visit [github.com](https://github.com)
   - Sign in or create account
   - Click "+" → "New repository"

2. **Repository Settings**
   - Name: `MrGamePlayer`
   - Description: "Multiplayer gaming platform with MGP token"
   - Choose: Public or Private
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

### Step 4: Connect and Push

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/MrGamePlayer.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Option 3: Using GitHub Web Interface

1. **Create Repository on GitHub**
   - Go to github.com → New repository
   - Name: `MrGamePlayer`
   - Create repository

2. **Upload Files**
   - Click "uploading an existing file"
   - Drag and drop all project files
   - Commit changes

## 📋 Pre-Upload Checklist

Before uploading, make sure:

- ✅ `.env` file is NOT included (already in .gitignore)
- ✅ `node_modules` is NOT included (already in .gitignore)
- ✅ `build/` folder is NOT included (already in .gitignore)
- ✅ Large files (videos, zips) are NOT included (already in .gitignore)
- ✅ Sensitive keys are NOT in code (use environment variables)

## 🔒 Security Notes

**DO NOT commit:**
- `.env` files (contains private keys)
- `PRIVATE_KEY` values
- API keys or secrets
- Hardhat cache/artifacts

**Safe to commit:**
- Source code
- Configuration files
- Documentation
- `.env.example` (template file)

## 📝 Recommended Repository Structure

```
MrGamePlayer/
├── src/                    ✅ Commit
├── public/                 ✅ Commit
├── contracts/              ✅ Commit
├── server/                 ✅ Commit
├── scripts/                ✅ Commit
├── package.json            ✅ Commit
├── .gitignore             ✅ Commit
├── README.md              ✅ Commit
├── Procfile               ✅ Commit
├── railway.json           ✅ Commit
├── .env.example           ✅ Commit
├── node_modules/          ❌ Ignore
├── build/                 ❌ Ignore
├── .env                   ❌ Ignore
└── artifacts/             ❌ Ignore
```

## 🚀 After Uploading

Once uploaded to GitHub:

1. **Connect to Railway**
   - Go to railway.app
   - New Project → Deploy from GitHub
   - Select your repository
   - Railway will auto-deploy!

2. **Set Environment Variables**
   - In Railway dashboard
   - Add variables from `.env.example`
   - See `RAILWAY_DEPLOYMENT.md` for details

## 💡 Tips

- Use descriptive commit messages
- Commit frequently
- Push regularly
- Use branches for features (optional)
- Keep `.gitignore` updated

---

**Need help?** Choose the option that works best for you. GitHub Desktop is the easiest for beginners!

