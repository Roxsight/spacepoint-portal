\# SpacePoint Portal — Project Context



\## What We're Building

A gamified space education portal with role-based dashboards for 

Instructors, Ambassadors, Interns, and an Admin command center.



\## Tech Stack

\- Frontend: React + Vite + Tailwind CSS

\- Backend/Auth/DB: Supabase

\- Hosting: Vercel



\## Supabase Config

\- URL: https://pcosjflsjhchevkwghgi.supabase.co

\- Tables: profiles, instructor\_gates, crm\_leads, recruits, 

&#x20; impact\_reports, challenges, submissions, todos, 

&#x20; opportunities, content\_library



\## User Roles

\- instructor → /instructor dashboard

\- ambassador → /ambassador dashboard  

\- intern → /intern dashboard

\- admin → /admin dashboard



\## Key Logic

\- New user signs up → email verification → onboarding wizard 

&#x20; (name, country, org, role selection) → dashboard

\- Instructor gates 1-5 unlock sequentially via admin approval

\- XP awarded: gate cleared +100, challenge submitted +50, 

&#x20; lead approved +75, impact report approved +60

\- SatKit Academy content is view-only, no download



\## Role Split

\- CODEX owns: Supabase RLS, gate unlock triggers, XP logic, 

&#x20; edge functions, backend debugging

\- Claude (this chat) owns: all UI components, pages, 

&#x20; design system, routing



\## Current Status

\- Supabase tables created ✓

\- Auth context set up ✓

\- React Router with role-based routing ✓

\- Landing, Login, Signup, Onboarding pages built ✓

\- Dashboard placeholders being fixed (encoding issue on Windows)

\- Next: Instructor dashboard + Admin command center

