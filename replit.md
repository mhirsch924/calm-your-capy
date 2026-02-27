# Epigenetic Rat Lab

## Overview
An interactive browser-based simulation exploring how maternal care shapes gene expression through epigenetics. Users click on a rat pup to simulate maternal licking/grooming and observe real-time changes in DNA methylation, histone modification, and stress response.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: Express.js (minimal - serves frontend only)
- **No database**: This is a client-side simulation with no persistent data

## Key Features
- 60-second timed simulation with lick count decay
- Real-time DNA methylation SVG visualization
- Animated rat pup with phenotype-based expressions
- Stress-O-Meter progress bar
- Results screen with molecular outcome charts
- Google AdSense integration (placeholder publisher ID)
- Donation links (PayPal, Venmo, Cash App)
- Grey monochromatic color scheme

## File Structure
- `client/src/pages/simulation.tsx` - Main simulation page with all game logic
- `client/src/App.tsx` - Router setup
- `client/index.html` - SEO meta tags + AdSense script

## Game Mechanics
- lickCount: 0-100, decays by 1 every 2 seconds
- Each click adds +3 to lickCount
- Thresholds: 0-30 (Anxious), 31-70 (Normal), 71-100 (Relaxed)
- DNA methyl groups fade as lickCount increases
- Histones spread apart as lickCount increases

## Monetization
- Google AdSense: Replace `ca-pub-XXXXXXXXXXXXXXXX` in index.html with actual publisher ID
- Donation links: Update PayPal/Venmo/Cash App URLs with actual accounts
