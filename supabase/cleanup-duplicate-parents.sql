-- Run this once before creating the unique parent phone index.
-- It keeps the newest parent row for each duplicated phone_normalized value
-- and deletes older duplicated test accounts with the same parent phone.

alter table public.parents add column if not exists phone_normalized text;

update public.parents
set phone_normalized =
  case
    when length(regexp_replace(phone, '\D', '', 'g')) = 11
      and left(regexp_replace(phone, '\D', '', 'g'), 1) = '8'
      then '+7' || substring(regexp_replace(phone, '\D', '', 'g') from 2)
    when length(regexp_replace(phone, '\D', '', 'g')) = 11
      and left(regexp_replace(phone, '\D', '', 'g'), 1) = '7'
      then '+' || regexp_replace(phone, '\D', '', 'g')
    when length(regexp_replace(phone, '\D', '', 'g')) = 10
      then '+7' || regexp_replace(phone, '\D', '', 'g')
    else '+' || regexp_replace(phone, '\D', '', 'g')
  end
where phone_normalized is null or phone_normalized = '';

with ranked_parents as (
  select
    id,
    student_id,
    phone_normalized,
    row_number() over (
      partition by phone_normalized
      order by created_at desc, id desc
    ) as row_number_for_phone
  from public.parents
  where phone_normalized is not null
),
duplicate_students as (
  select student_id
  from ranked_parents
  where row_number_for_phone > 1
)
delete from public.users
where id in (select student_id from duplicate_students);

alter table public.parents alter column phone_normalized set not null;

create unique index if not exists parents_phone_normalized_unique_idx on public.parents(phone_normalized);
create unique index if not exists parents_telegram_chat_id_unique_idx
  on public.parents(telegram_chat_id)
  where telegram_chat_id is not null;
create unique index if not exists parents_invite_code_unique_idx on public.parents(invite_code);
