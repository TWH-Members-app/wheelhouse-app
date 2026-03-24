# Wheelhouse App — Project TODO

## Setup & Infrastructure
- [x] Database schema: users, membership_tiers, events, rsvps, points_transactions, community_posts, community_channels, polls, poll_votes, referrals, notifications
- [x] Global styles: Navy/Yellow brand colors, Oswald font, mobile-first layout
- [x] Bottom navigation bar (Home, Events, Community, Rewards, Profile)
- [x] App routing structure

## Home Dashboard
- [x] Welcome header with member name and tier badge
- [x] Points balance widget with progress to next redemption
- [x] Digital membership card preview (tap to expand)
- [x] Upcoming events list
- [x] Recent points activity feed
- [x] Refer-a-friend CTA banner

## Digital Membership Card
- [x] QR code generation for in-store scanning
- [x] Tier display (The Refined / The Elite / The Ultimate)
- [x] Member name, member since, membership number
- [x] Perks summary for current tier
- [x] Annual spend tracker with progress bar
- [x] Total savings calculator

## Events
- [x] Event listings with category filter (All, Rides, Workshops, Special Events, Camps)
- [x] Event detail page with description, date/time, location
- [x] One-tap RSVP/registration with points award
- [x] Add to Calendar (Google, Apple, Outlook)
- [x] Points badge showing points earned per event type
- [x] Attendee count and spots remaining

## Community Feed
- [x] Channel selector (General Chat, Ride Call-outs, Gear Buy/Sell/Trade)
- [x] WhatsApp-style post feed with reactions
- [x] Create post / gear listing / poll
- [x] Polling feature with vote counts and progress bars
- [x] Comment threads
- [x] Like/reaction system

## Rewards & Points
- [x] Real-time points balance display
- [x] Points history / transaction log
- [x] How to Earn breakdown (purchase, ride, workshop, special event, camp, referral)
- [x] Redeem points (1000 pts = $10 store credit)
- [x] Refer-a-Friend with unique invite link and referral history

## Profile & Settings
- [x] Profile page with membership tier details and avatar
- [x] Annual spend and total savings metrics
- [x] Tier upgrade progress bar
- [x] Notification preferences (events, community, rewards, email toggles)
- [x] Logout

## Backend / API
- [x] tRPC routers: events, community, rewards, referrals, profile
- [x] Points allocation on event RSVP
- [x] Referral link generation and tracking
- [x] Seed data: 7 events, 3 community channels
- [x] Vitest test suite (15 tests passing)

## Pending / Future Enhancements
- [ ] Push notification service worker (PWA)
- [ ] Admin panel for event management
- [ ] Photo uploads for community posts
- [ ] In-app purchase flow for paid events
- [ ] Tier multiplier on points (Elite 1.5x, Ultimate 2x)

## Service Booking (HubTiger Integration)
- [x] Service Booking page with branded intro and service type cards
- [x] HubTiger iFrame embed with Wheelhouse brand styling
- [x] Add booking tab/entry point to bottom navigation and Home dashboard
- [x] Push to GitHub with new feature

## Strava Integration
- [x] Store Strava credentials as environment secrets
- [x] Build Strava tRPC router with club activities, routes, and segments endpoints
- [x] Build Rides screen with live Strava club feed (distance, elevation, map)
- [x] Add Strava Connect OAuth flow for member accounts (via Rides screen)
- [x] Push to GitHub with Strava integration

## Bug Fixes
- [x] Fix Strava routes 404 error — route detail view should use cached list data instead of separate API call

## Send to Device (GPX Export)
- [ ] Add GPX export tRPC endpoint that proxies Strava route GPX download
- [ ] Build Send to Device bottom sheet UI with Garmin, Karoo, Wahoo options
- [ ] Implement Karoo/Wahoo native share sheet with GPX file
- [ ] Implement Garmin Connect web import deep link
- [ ] Wire Send to Device button into route detail view
- [ ] Push to GitHub
