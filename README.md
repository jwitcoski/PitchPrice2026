# PitchPrice — World Cup 2026 Map

React + [MapTiler SDK](https://docs.maptiler.com/sdk-js/) entry for the MapTiler World Cup Map Competition.

## Setup

```bash
npm install
cp .env.example .env
# Add your MapTiler API key to .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Demo recording (`?demo=1`)

1. Run `npm run dev` and open `http://localhost:5173?demo=1`
2. Modal opens with Bosnia pre-selected; app auto-starts the team flow after ~3.5s
3. Wait for fly-to choreography, then SoFi is auto-selected (~9s)
4. Hover the ticket bar for the easter egg tooltip
5. Record at 1920×1080 with `npm run build && npm run preview` for smoother WebGL

## Features

- **Three personas** (team / city / tournament) with code-first map theming
- **65/35** map + sidebar layout
- **Local JSON** for fixtures and ticket price ranges (no ticket API)
- **IP-safe** — no FIFA logos; illustrative match copy

## Data

Edit `public/data/*.json` to add stadiums, teams, fixtures, and ticket ranges.

## Deploy (witcoskitech.com)

The app is a static build deployed to **https://witcoskitech.com/pitchprice/** via the same S3 + CloudFront setup as the [Cloud Resume Challenge](https://witcoskitech.com) site. It syncs only the `pitchprice/` prefix so the main site is untouched.

### 1. Create the GitHub repo

From this folder (not your home directory):

```bash
git init
git add .
git commit -m "Initial PitchPrice 2026 map"
git branch -M main
git remote add origin https://github.com/YOUR_USER/PitchPrice2026.git
git push -u origin main
```

### 2. Add repository secrets

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|--------|
| `VITE_MAPTILER_API_KEY` | Your MapTiler API key |
| `AWS_ACCESS_KEY_ID` | Same as Cloud Resume Challenge deploy |
| `AWS_SECRET_ACCESS_KEY` | Same as Cloud Resume Challenge deploy |
| `CLOUDFRONT_DISTRIBUTION_ID` | Same as Cloud Resume Challenge deploy |

After each push to `main`, the workflow builds with the key baked in and uploads `dist/` to `s3://witcoskitech.com/pitchprice/`.

### 3. MapTiler key restrictions

In [MapTiler Cloud](https://cloud.maptiler.com/), restrict the key to your domain, e.g. `witcoskitech.com` and `*.witcoskitech.com`. The key is still visible in the built JS; domain limits reduce misuse.

### Local dev with production base path

```bash
VITE_BASE_PATH=/pitchprice/ npm run dev
```
