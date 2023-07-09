## Supabase Auth Example
This example tests for creating an user and deleting.

### Set Environment Keys

```
$ touch .env.local
```

Dashborad > Project Settings > API

`Project URL` and `Project API Keys`
```
VITE_SUPABASE_URL=https://example.supabase.co
VITE_SUPABASE_KEY=eyExampleKey
```

### Database Setup
Dashboard > SQL Editor, Open New Query

Paste these code and run it.
```
create table public.profiles (
  id uuid not null references auth.users on delete cascade not null,
  first_name text,
  last_name text,

  primary key (id)
);

alter table public.profiles enable row level security;
```

### Database Trigger Setup
Dashboard > SQL Editor, Open New Query

Paste these code and run it.
```
-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

This is a tigger when new user signed up. Insert user id into public profile table.

Once you run it, you can see Dashboard > Database > Functions 

`handle_new_user`

### Deploy Supabase Edge Function

```
npx supabase functions deploy functionName123 --project-ref projectReferenceId123
```

### Running on local

`npm run dev`
