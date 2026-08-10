-- Electricity rate for EV savings simulator
alter table public.finance_settings
  add column if not exists electricity_rate_per_unit numeric default 7;

-- Contact messages read flag for admin inbox
alter table public.contact_messages
  add column if not exists is_read boolean default false;
