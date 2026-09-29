-- Run this once in Supabase's SQL editor for each environment (dev + prod).
-- Adds the Mantra Companion order-bump flag, set on the reports row at
-- checkout time (see app/api/payment/create-order/route.js) so it survives
-- both the client-side verify call and the server-to-server webhook path.

alter table reports add column if not exists addon_mantra boolean default false;
