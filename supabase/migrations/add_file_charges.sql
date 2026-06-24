-- Add file charges to finance_settings (loan processing fee included in EMI)
alter table public.finance_settings
  add column if not exists file_charges numeric default 2500;

update public.finance_settings
set file_charges = 2500
where id = 1 and file_charges is null;
