# Aelthar Compendium — DM Campaign Manager

## Project Overview
D&D 5e campaign management web app + PWA for personal use.
DM has full access. Players access only their own characters.
World: Aelthar (fantasy setting, Slavic/medieval aesthetic).
Active campaign: "Тіні Валдаару" (session 4).

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- Supabase (auth + database)
- Vercel (hosting)

## Design System
- Dark grimoire aesthetic
- Primary accent: `#c8843a` (copper/bronze)
- Background: `#0d0f14`
- Text: `#e8e0d0`
- Font: EB Garamond (serif, full Cyrillic support)
- Mobile-first, max-width 430px centered
- Bottom navigation bar

## Project Structure
```
src/app/          → pages (App Router)
src/components/   → reusable UI components
src/lib/          → supabase client, helpers
src/hooks/        → custom React hooks
src/types/        → TypeScript interfaces
```

## Key Rules
- NEVER change localStorage key names once set
- Always mobile-first
- Auto-save with 500ms debounce to Supabase
- localStorage as primary (offline-first), Supabase for sync
- ESLint errors: `ignoreDuringBuilds: true` in `next.config.mjs`
- After every feature: `npm run build` to verify

## Deploy Flow
```bash
git add . && git commit -m "description" && git push origin main
```
Vercel auto-deploys on every push to main.

## Roles
- **DM (Denys):** full access to all campaigns, NPCs, story, secrets
- **Player:** access only to own character + unlocked compendium content

## Database Tables (Supabase)
- `campaigns` (id, name, dm_id, invite_code, setting, description)
- `characters` (id, user_id, campaign_id, name, race, class, stats...)
- `inventory_items` (id, character_id, name, category, quantity)
- `character_spells` (id, character_id, spell_id, prepared)
- `sessions` (id, campaign_id, title, date, summary, dm_notes)
- `npcs` (id, campaign_id, name, role, public_info, secret_notes)
