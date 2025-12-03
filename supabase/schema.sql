-- Supabase schema for Portal

create table if not exists public.users (
  id text primary key,
  name text not null,
  username text not null unique,
  password text,
  role text not null,
  grade text,
  phone text,
  email text,
  blocked boolean not null default false,
  resetCode text
);

create table if not exists public.quizzes (
  id text primary key,
  title text not null,
  description text not null,
  createdBy text not null,
  grade text not null,
  subject text not null,
  createdAt text not null
);

create table if not exists public.questions (
  id text primary key,
  quizId text not null references public.quizzes(id) on delete cascade,
  text text not null,
  textHtml text,
  options jsonb not null,
  optionsHtml jsonb,
  correctOption text not null,
  explanation text,
  imageUrl text,
  tags jsonb,
  type text,
  answerPlaceholder text
);

create table if not exists public.results (
  id text primary key,
  userId text not null references public.users(id) on delete cascade,
  quizId text not null references public.quizzes(id) on delete cascade,
  score integer not null,
  total integer not null,
  date text not null,
  durationSec integer,
  startedAt text,
  finishedAt text,
  details jsonb not null
);

create table if not exists public.attempts (
  id text primary key,
  userId text not null references public.users(id) on delete cascade,
  quizId text not null references public.quizzes(id) on delete cascade,
  startedAt text not null,
  lastIndex integer not null,
  answers jsonb not null
);

create table if not exists public.attendance (
  id text primary key,
  userId text not null references public.users(id) on delete cascade,
  date text not null,
  content text not null
);

create table if not exists public.payments (
  id text primary key,
  userId text not null references public.users(id) on delete cascade,
  amount numeric not null,
  date text not null,
  method text,
  notes text
);

create table if not exists public.appointments (
  id text primary key,
  userId text not null references public.users(id) on delete cascade,
  dateTime text not null,
  durationMin integer not null,
  createdAt text not null
);

