# 🎧 AmbientMix — README (Short Version)

AmbientMix is a modern AI-enhanced ambience generator.

Users can mix ambient layers (rain, wind, fire, forest, etc.), save custom mixes, unlock premium ambience packs, and upgrade to Pro or Lifetime via Stripe.

Built with Next.js 15, Supabase Auth, and Stripe Checkout.

## ⭐ Features

### Core

- Mix ambient layers (rain, thunder, wind, fire, forest, etc.)
- Volume control, presets, and ambience packs
- Responsive UI (mobile + desktop)
- Save unlimited mixes (for logged-in users)

### Auth (Supabase Magic Link)

- Passwordless login via email
- Persistent sessions
- Logout
- User context (`useUser()`)

### Stripe Integration

- Pro Monthly subscription (£6.99)
- Lifetime purchase (£89)
- Stripe Checkout & Billing Portal
- Webhook sync → Supabase `subscriptions` table
- Automatic customer linking (`customerId` saved to profile)
- Pro gating system for premium packs & features

### Pro Features

- Premium ambience packs (e.g., Deep Thunderstorm, Night Forest)
- Multiple mixer layers
- Unlimited saving
- Cloud sync

## 🧱 Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Supabase (Auth + DB + RLS)
- Stripe (Checkout + Webhooks + Billing Portal)
- TailwindCSS
- Vercel (deployment)

## 🔧 Environment Variables

Add these to `.env.local` (dev) and Vercel → Environment Variables (prod):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Live
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_PRO_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_LIFETIME_PRICE_ID=price_xxx

# App
NEXT_PUBLIC_SITE_URL=https://ambientmix.vercel.app
```

## 🔄 Stripe Webhook Events Used

The `/api/stripe/webhook` route processes:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

All events sync into Supabase `subscriptions` table.

## 🔐 Pro Gating System

Use:

```tsx
import { useSubscriptionStatus } from "@/app/hooks/useSubscriptionStatus";
```

or wrap features with:

```tsx
<ProGate>
  <PremiumFeature />
</ProGate>
```

## 📁 Database Tables (Supabase)

### `profiles`
- `id`
- `email`
- `customer_id`

### `subscriptions`
- `customer_id`
- `status`
- `plan_type` (`subscription` | `lifetime`)
- `current_period_end`
- `price_id`

### `mixes`
- `user_id`
- `name`
- `settings` (JSON)

All tables protected using RLS.

## 🚀 Deployment Notes

- Vercel automatically builds Next.js 15
- Stripe keys and webhook secret must exist in Vercel env
- Webhook endpoint: `https://ambientmix.vercel.app/api/stripe/webhook`
- Supabase service role key used ONLY server-side (webhook, sync)

## 📦 Roadmap

- Add more ambience packs
- Add AI-generated ambience layers
- Add "My Mixes" page UI
- Add onboarding flow
- Add analytics + usage tracking
