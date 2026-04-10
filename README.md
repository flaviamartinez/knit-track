# 🧶 KnitTrack

A beautiful, personal knitting project tracker built with React, Vite, and Supabase.

---

## Features

- **Project Management** — Create, track, and finish knitting projects.
- **Section-based Row Counters** — Each section (e.g. Ribbing, Body, Sleeve) has its own independent row counter with a goal and shaping support.
- **Live Stitch Count** — Automatically computes the current number of stitches based on shaping increases or decreases as you progress.
- **Pattern Attachment** — Link a URL or upload a PDF pattern file per project.
- **Project Progress** — Each project card shows a percentage progress bar calculated from the progress of all its sections.
- **Global Quick Counter** — An ad-hoc counter tool accessible from the dashboard, stored locally — no project required.
- **Google OAuth Login** — Secure authentication via Supabase Auth with Google.
- **Confetti Celebration 🎉** — Reach your row goal and get a burst of confetti.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Storage | Supabase Storage (PDF patterns) |
| Animation | Framer Motion |

---

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd knittrack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root (use `.env.example` as reference):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Supabase

Run the following SQL in your Supabase **SQL Editor** to create the required table:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  current_row INTEGER DEFAULT 0,
  total_rows INTEGER,
  sections JSONB DEFAULT '[]',
  pattern_url TEXT,
  created_at BIGINT,
  updated_at BIGINT
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own projects"
ON projects FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

For PDF pattern uploads, create a public **Supabase Storage** bucket named `patterns` and add the following policies:

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'patterns');

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'patterns');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'patterns');
```

### 5. Run the development server

```bash
npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key |

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## License

MIT — made with 🧶 and care.
