create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  grade text,
  initials text,
  role text not null default 'student',
  telegram_parent_verified boolean not null default false,
  subscription_status text not null default 'inactive'
    check (subscription_status in ('inactive', 'active', 'expired', 'cancelled')),
  subscription_plan text check (subscription_plan in ('monthly', 'three_months', 'yearly')),
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,
  diagnostic_completed boolean not null default false,
  diagnostic_score integer,
  diagnostic_weak_topics text[],
  mentor_style text not null default 'friendly'
    check (mentor_style in ('soft', 'strict', 'friendly', 'olympiad')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone text not null,
  phone_normalized text not null,
  phone_verified boolean not null default false,
  telegram_chat_id text,
  telegram_connected boolean not null default false,
  telegram_verified_at timestamptz,
  invite_code text not null unique,
  last_report_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  student_name text,
  student_email text,
  parent_phone text,
  plan_key text not null check (plan_key in ('monthly', 'three_months', 'yearly')),
  plan_name text not null,
  amount integer not null,
  currency text not null default 'KZT',
  payment_method text not null check (payment_method in ('kaspi_pay', 'kaspi_red', 'kaspi_0_0_12')),
  status text not null default 'pending'
    check (status in ('pending', 'invoice_sent', 'approved', 'rejected', 'expired')),
  kaspi_invoice_reference text,
  kaspi_payment_link text,
  admin_note text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  rejected_at timestamptz
);

create table if not exists public.weekly_report_deliveries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  week_key text not null,
  sent_at timestamptz not null default now(),
  unique (student_id, week_key)
);

create index if not exists parents_student_id_idx on public.parents(student_id);
create index if not exists parents_invite_code_idx on public.parents(invite_code);
create index if not exists payment_requests_user_id_idx on public.payment_requests(user_id);
create unique index if not exists users_email_unique_idx on public.users(email);
create unique index if not exists users_email_lower_unique_idx on public.users(lower(email));

alter table public.users
  add column if not exists mentor_style text not null default 'friendly';

alter table public.users
  drop constraint if exists users_mentor_style_check;

alter table public.users
  add constraint users_mentor_style_check
  check (mentor_style in ('soft', 'strict', 'friendly', 'olympiad'));

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

alter table public.parents alter column phone_normalized set not null;

create unique index if not exists parents_phone_normalized_unique_idx on public.parents(phone_normalized);
create unique index if not exists parents_telegram_chat_id_unique_idx
  on public.parents(telegram_chat_id)
  where telegram_chat_id is not null;
create unique index if not exists parents_invite_code_unique_idx on public.parents(invite_code);

create table if not exists public.english_vocabulary_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null check (length(trim(title_en)) > 0),
  title_kk text not null default '',
  title_ru text not null default '',
  description_en text,
  description_kk text,
  description_ru text,
  icon text,
  cover_image_url text,
  difficulty text not null default 'mixed'
    check (difficulty in ('beginner', 'intermediate', 'mixed')),
  order_index integer not null default 0,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.english_vocabulary_words (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.english_vocabulary_topics(id) on delete cascade,
  word_en text not null,
  word_en_normalized text generated always as (lower(regexp_replace(trim(word_en), '\s+', ' ', 'g'))) stored,
  translation_kk text not null,
  translation_ru text not null,
  part_of_speech text not null check (part_of_speech in ('verb', 'adjective', 'noun')),
  pronunciation text,
  phonetic_ipa text,
  audio_url text,
  image_url text,
  image_prompt text,
  example_en text,
  example_kk text,
  example_ru text,
  difficulty text not null default 'A1'
    check (difficulty in ('A1', 'beginner', 'intermediate')),
  order_index integer not null check (order_index between 1 and 15),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_id, word_en_normalized, part_of_speech)
);

create table if not exists public.student_vocabulary_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  word_id uuid not null references public.english_vocabulary_words(id) on delete cascade,
  status text not null default 'new' check (status in ('new', 'learning', 'review', 'known')),
  confidence_level integer not null default 0 check (confidence_level between 0 and 5),
  times_seen integer not null default 0,
  times_correct integer not null default 0,
  times_incorrect integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  first_learned_at timestamptz,
  mastered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, word_id)
);

create table if not exists public.student_favorite_vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  word_id uuid not null references public.english_vocabulary_words(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, word_id)
);

create table if not exists public.vocabulary_daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  activity_date date not null,
  words_learned integer not null default 0,
  words_reviewed integer not null default 0,
  cards_viewed integer not null default 0,
  daily_goal_target integer not null default 10,
  daily_goal_completed boolean not null default false,
  xp_earned integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, activity_date)
);

create index if not exists english_vocabulary_words_topic_id_idx on public.english_vocabulary_words(topic_id);
create index if not exists english_vocabulary_words_part_of_speech_idx on public.english_vocabulary_words(part_of_speech);
create index if not exists english_vocabulary_words_word_en_idx on public.english_vocabulary_words(word_en_normalized);
create index if not exists student_vocabulary_progress_user_id_idx on public.student_vocabulary_progress(user_id);
create index if not exists student_vocabulary_progress_next_review_at_idx on public.student_vocabulary_progress(next_review_at);
create index if not exists student_favorite_vocabulary_user_id_idx on public.student_favorite_vocabulary(user_id);
create index if not exists vocabulary_daily_activity_user_date_idx on public.vocabulary_daily_activity(user_id, activity_date);

create table if not exists public.student_topic_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  topic_id uuid not null references public.english_vocabulary_topics(id) on delete cascade,
  status text not null default 'locked'
    check (status in ('locked', 'available', 'in_progress', 'completed', 'mastered', 'needs_review')),
  unlocked_at timestamptz,
  completed_at timestamptz,
  mastered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

create index if not exists student_topic_unlocks_user_id_idx on public.student_topic_unlocks(user_id);
create index if not exists student_topic_unlocks_topic_id_idx on public.student_topic_unlocks(topic_id);
create index if not exists student_topic_unlocks_status_idx on public.student_topic_unlocks(status);

create table if not exists public.vocabulary_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.english_vocabulary_topics(id) on delete cascade,
  word_id uuid references public.english_vocabulary_words(id) on delete set null,
  part_of_speech text not null check (part_of_speech in ('verb', 'adjective', 'noun')),
  question_type text not null check (
    question_type in (
      'translation_choice',
      'sentence_completion',
      'listening_choice',
      'type_word',
      'image_choice',
      'matching',
      'antonym_choice',
      'context_choice',
      'word_order',
      'true_false'
    )
  ),
  question_text_en text,
  question_text_kk text,
  question_text_ru text,
  prompt_audio_url text,
  prompt_image_url text,
  correct_answer text not null,
  options_json jsonb,
  explanation_en text,
  explanation_kk text,
  explanation_ru text,
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate')),
  source text not null default 'system' check (source in ('admin', 'generated', 'system')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vocabulary_test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  topic_id uuid not null references public.english_vocabulary_topics(id) on delete cascade,
  part_of_speech text check (part_of_speech in ('verb', 'adjective', 'noun')),
  test_type text not null check (test_type in ('verb_section', 'adjective_section', 'noun_section', 'mixed_topic', 'ai_generated', 'weak_words')),
  total_questions integer not null,
  correct_answers integer not null default 0,
  incorrect_answers integer not null default 0,
  percentage integer not null default 0,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  xp_earned integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vocabulary_test_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.vocabulary_test_attempts(id) on delete cascade,
  question_id uuid references public.vocabulary_questions(id) on delete set null,
  word_id uuid references public.english_vocabulary_words(id) on delete set null,
  question_snapshot_json jsonb not null,
  selected_answer text,
  typed_answer text,
  correct_answer text not null,
  is_correct boolean not null,
  response_time_ms integer,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.vocabulary_game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  topic_id uuid references public.english_vocabulary_topics(id) on delete set null,
  part_of_speech text check (part_of_speech in ('verb', 'adjective', 'noun')),
  game_type text not null check (
    game_type in (
      'match_pairs',
      'memory',
      'drag_drop',
      'listen_choose',
      'type_word',
      'unscramble',
      'image_to_word',
      'word_to_image',
      'speed_round',
      'sentence_builder'
    )
  ),
  mode text not null default 'normal' check (mode in ('easy', 'normal', 'challenge')),
  total_items integer not null,
  correct_items integer not null default 0,
  incorrect_items integer not null default 0,
  hints_used integer not null default 0,
  score integer not null default 0,
  duration_seconds integer,
  xp_earned integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_vocabulary_word_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  word_id uuid not null references public.english_vocabulary_words(id) on delete cascade,
  total_attempts integer not null default 0,
  correct_attempts integer not null default 0,
  incorrect_attempts integer not null default 0,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  average_response_time_ms integer,
  last_answer_correct boolean,
  difficulty_score integer not null default 0,
  weakness_score integer not null default 0,
  review_stage integer not null default 0,
  last_practiced_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, word_id)
);

create table if not exists public.vocabulary_pronunciation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  word_id uuid not null references public.english_vocabulary_words(id) on delete cascade,
  transcript text,
  score integer,
  feedback_kk text,
  feedback_ru text,
  audio_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.vocabulary_reward_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reward_key text not null,
  xp integer not null default 0,
  coins integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, reward_key)
);

create index if not exists vocabulary_questions_topic_idx on public.vocabulary_questions(topic_id);
create index if not exists vocabulary_questions_word_idx on public.vocabulary_questions(word_id);
create index if not exists vocabulary_test_attempts_user_id_idx on public.vocabulary_test_attempts(user_id);
create index if not exists vocabulary_test_attempts_topic_id_idx on public.vocabulary_test_attempts(topic_id);
create index if not exists vocabulary_test_answers_attempt_id_idx on public.vocabulary_test_answers(attempt_id);
create index if not exists vocabulary_game_sessions_user_id_idx on public.vocabulary_game_sessions(user_id);
create index if not exists vocabulary_game_sessions_topic_id_idx on public.vocabulary_game_sessions(topic_id);
create index if not exists vocabulary_pronunciation_attempts_user_id_idx on public.vocabulary_pronunciation_attempts(user_id);
create index if not exists vocabulary_pronunciation_attempts_word_id_idx on public.vocabulary_pronunciation_attempts(word_id);
create index if not exists student_vocabulary_word_metrics_user_id_idx on public.student_vocabulary_word_metrics(user_id);
create index if not exists student_vocabulary_word_metrics_weakness_score_idx on public.student_vocabulary_word_metrics(weakness_score);
create index if not exists student_vocabulary_word_metrics_next_review_at_idx on public.student_vocabulary_word_metrics(next_review_at);
