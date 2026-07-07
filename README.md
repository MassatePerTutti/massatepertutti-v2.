# MassatePerTutti v2

Sito React + Vite predisposto per Netlify e Supabase.

## Comandi

```bash
npm install
npm run dev
npm run build
```

## Variabili ambiente Netlify

Imposta in Netlify > Site configuration > Environment variables:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Supabase Auth

In Supabase > Authentication > URL Configuration:

- Site URL: https://massatepertutti.click
- Redirect URLs:
  - https://massatepertutti.click/*
  - http://localhost:5173/*

## Database consigliato

Esegui in Supabase SQL Editor:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'user',
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);
```
