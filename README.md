# MemeMind AI — Intelligent Meme Finder, GIF Searcher & AI Generator

MemeMind AI is a full-stack web application powered by **Google Gemini API (gemini-3.8-flash & gemini-3.1-flash-lite-image)**, external media search APIs (**GIPHY & Tenor**), and **Supabase PostgreSQL / Persistent Storage**.

Users describe any scenario or emotion in everyday language. MemeMind AI analyzes the humor, searches the internet for both animated reaction GIFs and iconic meme templates, determines whether an animated GIF or static image fits best, ranks results by comedic timing, or generates an original AI meme on demand.

---

## 🚀 Key Features

1. **Scenario Comprehension with Google Gemini 3.8**:
   - Deeply understands the irony, panic, awkwardness, or relief in natural language scenarios.
   - Determines whether an **Animated GIF** or a **Static Image** makes the joke punchier.
   - Expands search into 4–6 targeted keywords for reaction media.
2. **Real GIF & Internet Meme Search**:
   - Live integration with GIPHY Search API and Tenor.
   - Access to top 100 iconic internet meme templates (Distracted Boyfriend, Two Buttons, Buff Doge vs Cheems, Roll Safe, Woman Yelling at Cat, Panik Kalm Panik, etc.).
   - Curated high-speed reaction cache ensuring zero downtime.
3. **AI Meme Studio & Canvas Editor**:
   - Create custom memes on an interactive HTML5 Canvas.
   - Choose between **Classic Impact** (Top/Bottom text), **Modern Tweet / Card style**, and **Breaking News ticker**.
   - Gemini writes 5 instant witty punchlines tailored to your situation.
   - Export high-resolution PNG or save directly.
4. **Persistent Database & Storage**:
   - Automatic local file persistence (`data/memes_store.json`) for saved memes, search history, favorites, and match ratings.
   - Complete Supabase PostgreSQL schema (`supabase_schema.sql`) ready to run in Supabase SQL editor.
5. **No Broken Promises**:
   - Transparent diagnostic screen showing exact key status.
   - Graceful fallback with zero mock crashes.

---

## 💻 Windows 10 / 11 and VS Code Setup

### 1. Prerequisites
- **Node.js**: Install Node.js LTS (v20+ recommended) from [nodejs.org](https://nodejs.org).
- **VS Code**: Install Visual Studio Code from [code.visualstudio.com](https://code.visualstudio.com).
- **Git**: (Optional) Install Git from [git-scm.com](https://git-scm.com).

### 2. Quickstart PowerShell Commands
Open **Windows PowerShell** or the integrated terminal in VS Code:

```powershell
# Step 1: Navigate to the project directory
cd "C:\Path\To\MemeMind-AI"

# Step 2: Open in VS Code
code .

# Step 3: Install dependencies
npm install

# Step 4: Create your .env file
Copy-Item .env.example .env

# Step 5: Open .env to add your Gemini API Key
notepad .env
```

Inside `.env`, configure your keys:
```env
# Required for Gemini AI reasoning and image generation
GEMINI_API_KEY="AIzaSy..."

# Gemini Models
GEMINI_TEXT_MODEL="gemini-3.8-flash"
GEMINI_IMAGE_MODEL="gemini-3.1-flash-lite-image"

# Optional: GIPHY API key (leave blank to use built-in search)
GIPHY_API_KEY=""

# Optional: Supabase PostgreSQL credentials
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJhbG..."

# Server Port
PORT=3000
```

### 3. Start the Application
Run the full-stack server (starts both Express backend and Vite frontend on port 3000):

```powershell
npm run dev
```

Open your browser at:
👉 **`http://localhost:3000`**

---

## 🗄️ Supabase PostgreSQL Setup (Optional)

If you want cloud-hosted PostgreSQL storage via Supabase:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase_schema.sql` in this repo, copy its contents, paste into Supabase, and click **Run**.
4. Copy your **Project URL** and **anon public key** from *Project Settings > API*.
5. Paste them into `.env`:
   ```env
   SUPABASE_URL="https://xyz.supabase.co"
   SUPABASE_ANON_KEY="eyJhbGci..."
   ```

---

## 🧪 Testing Checklist

- [x] **Scenario Analysis**: Enter *"When I study all night but forget everything in the exam"*. Gemini extracts panic/irony, recommends animated reaction GIF, and queries GIPHY/Tenor.
- [x] **GIF Animation**: Reaction GIFs animate smoothly without freezing or converting to static images.
- [x] **Static Meme Comparison**: Browse alternative candidate templates and swap any alternative into the primary slot.
- [x] **AI Meme Generation**: Click *"Generate AI Meme"* or *"Generate Anyway"* to generate an original custom meme.
- [x] **Meme Studio**: Switch to the Studio tab, use *"Gemini Punchline Writer"* to generate 5 captions, adjust font size, and download PNG.
- [x] **Persistent Storage**: Save a meme or add to favorites, refresh the browser, and verify it remains in *My Memes*.
- [x] **Match Rating**: Rate a match (thumbs up/down) to record feedback.
- [x] **Search History**: Past queries are recorded with thumbnails and can be re-searched with 1 click.

---

## 🛡️ Safe Git Commits

Your `.gitignore` automatically prevents `.env` and `data/` from being committed to GitHub.

```powershell
git status
git add .
git commit -m "feat: complete MemeMind AI full-stack application"
git push origin main
```
