# CarCo — German Used Car Decision Board

A clean, client-side web application for tracking, scoring, inspecting, and comparing used car models on the German market before buying. Built with React, TypeScript, Vite, and Tailwind CSS — zero backend required, ready for GitHub Pages.

## Features

- **Fact-Based Star Scoring (1.0–5.0 ★):** Automatically computes *Value for Money*, *Reliability* (TÜV/ADAC index), *Value Retention*, *Running Costs* (based on `€/km`, annual insurance, and German vehicle tax at 15,000 km/yr), and an overall weighted score.
- **Automatic Ranking & Filtering:** Search across brand, model, generation, and buyer notes; filter by favorites, max budget (`€`), minimum star rating, drivetrain, and body style; rank automatically by overall rating, purchase price, cost/km, reliability, or value retention.
- **Multi-Image Fullscreen Viewing Mode:**
  - Switch between `Standard`, `Extended` (full metrics + buyer checklist), and `Fullscreen` (photo-only) layouts.
  - Toggle image fit between `object-contain` (no crop) and `object-cover` (full-bleed), with graceful SVG fallbacks on load errors.
  - Non-conflicting keyboard shortcuts: `ArrowLeft` / `ArrowRight` for images, `A` / `D` (or `PageUp` / `PageDown`) for switching cars, `F` for favorite, and `Escape` to close.
  - Strict top-layer modal stacking (`<dialog>.showModal()`) so clicking **Edit** inside Viewing Mode always opens above the overlay, captures focus, and updates ratings and rankings immediately on save.
- **Side-by-Side Comparison:** Compare 2 to 4 selected vehicles across specs, ratings, and configurable annual operating cost (default `15,000 km/yr`) with subtle best-value row highlighting.
- **AI Agent Prompt Generator & JSON Import:** Generate a structured German-market research prompt for an external AI assistant, paste single-car or multi-car JSON responses with schema validation (including backward compatibility for legacy `imageUrl`), and import cleanly.
- **LocalStorage Persistence & UTF-8 Base64 Sync:** Export your entire board as a compact UTF-8-safe Base64 backup string, restore with merge or replace options, or reset all local data with confirmation.

## Project Structure

```text
src/
├── components/
│   ├── CarCard.tsx              # Vehicle grid card with thumbnail, metrics, and actions
│   ├── CarFormModal.tsx         # Add/edit form with live star preview and multi-photo manager
│   ├── CarImage.tsx             # Lazy-loaded image with SVG fallback
│   ├── CompareTray.tsx          # Floating selection bar for 2–4 vehicles
│   ├── ComparisonModal.tsx      # Sticky-header side-by-side comparison table
│   ├── ConfirmDialog.tsx        # Top-layer confirmation dialog for destructive actions
│   ├── DataSyncModal.tsx        # AI research prompt, JSON import, and Base64 backup/restore
│   ├── EmptyState.tsx           # Clean onboarding screen with zero pre-filled sample data
│   ├── FilterBar.tsx            # Search, filters, ranking selector, and scoring tooltip
│   ├── Header.tsx               # Sticky application header
│   ├── NativeModal.tsx          # Accessible native <dialog> wrapper
│   ├── RatingFormulaTooltip.tsx # Toggletip explaining the star calculation formula
│   ├── StarRating.tsx           # Precision 1.0–5.0 star indicator
│   └── ViewingMode.tsx          # Fullscreen multi-image & stats inspector
├── hooks/
│   └── useCarStorage.ts         # Persistent localStorage state management
├── types/
│   └── car.ts                   # Shared TypeScript interfaces and enums
├── utils/
│   ├── __tests__/core.test.ts   # Unit tests for scoring, validation, and Base64 codec
│   ├── codec.ts                 # UTF-8 safe Base64 encode/decode
│   ├── format.ts                # EUR and number formatters
│   ├── prompt.ts                # External AI research prompt builder
│   ├── scoring.ts               # Dynamic star calculation and sorting logic
│   └── validation.ts            # Strict JSON schema validation & image normalization
├── App.tsx
├── index.css
└── main.tsx
```

## Local Development

### Prerequisites

- Node.js 20+ and npm 10+

### Setup & Commands

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev

# Run unit tests (scoring, validation, Base64 codec)
npm test

# Type-check TypeScript
npm run typecheck

# Build production bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

## Deploying to GitHub Pages

`vite.config.ts` is configured with `base: './'` so all built assets use relative paths and work on any GitHub Pages repository subpath (`https://<user>.github.io/<repo>/`) or custom domain.

### Option 1: Automatic Deployment via GitHub Actions (Recommended)

This repository includes [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Push your `main` branch to GitHub.
2. In your repository on GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Every push to `main` (or manual workflow run) will automatically build `dist/` and publish it to GitHub Pages.

### Option 2: Manual Static Upload

Run `npm run build` and upload the contents of the generated `dist/` folder to your static host or `gh-pages` branch.
