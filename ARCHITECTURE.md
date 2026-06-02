# Technical Architecture & UI/UX Design — NebulaKit

## 1. Backend Design & Data Integration

The backend is built on a serverless architecture with Supabase serving as BaaS, alongside external API orchestration triggered directly from the frontend client.

### A. Data Orchestration Flow (Core AI Engine)
1. **Trigger:** The frontend dispatches `target_industry` and `target_region` parameters to the core service function.
2. **Step 1 (Tavily API / Local B2B Proxy):** Executes a query to retrieve up to 5 public business profiles (Name, Website, Description snippet) within the target Netherlands municipality.
3. **Step 2 (Gemini API):** Forwards the business listings alongside the active product specifications to the Gemini API under strict configuration constraints. The model outputs a lead score classification, fitting rationale, and 2 complete outreach email drafts (formal English and direct Dutch) in pure, parsing-safe JSON format.
4. **Step 3 (Supabase DB):** Parses the generated JSON array and inserts the prospect records directly into the `leads` table.

### B. Database Schema (Supabase SQL)
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    base_cost NUMERIC,
    rental_price NUMERIC,
    target_industry TEXT,
    target_region TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    website TEXT,
    description TEXT,
    lead_score TEXT CHECK (lead_score IN ('Cold', 'Warm', 'Hot')),
    score_reason TEXT,
    pitch_email_en TEXT,
    pitch_email_nl TEXT,
    status TEXT CHECK (status IN ('Leads Found', 'Pitch Sent', 'Replied')) DEFAULT 'Leads Found',
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 2. UI/UX Blueprint

The application is structured as a premium **Single Page Application (SPA)** with a persistent sidebar layout and a spacious main content canvas.

### A. Interface Components

#### 1. Dashboard Tab & Intake Form
* **Left Section (Product Details):**
  * Product name text input.
  * Product/installation visual description textarea.
  * Visual asset dropzone (directly connected to Supabase Storage).
  * Numerical inputs for rental price and base overhead cost.
* **Right Section (Target Market):**
  * Industry category dropdown selector (*Nightclubs & Bars, Music Festivals, Corporate Events, Museums & Public Art*).
  * Target region text input (e.g., Amsterdam, Rotterdam).
* **Call to Action:** `"✦ Find Clients Now"` button featuring clean, premium state-transition micro-animations while the AI backend processes data.

#### 2. Lead Management Tab (Kanban CRM)
* **3-Column Kanban Board:** Horizontally aligned boards dividing prospects into workflow phases: `Leads Found` | `Pitch Sent` | `Replied`.
* **Lead Cards:** Component instances rendered dynamically in columns featuring:
  * Company name.
  * Score indicator badges styled with soft, muted pastel tokens: Hot (`bg-rose-50 text-rose-700`), Warm (`bg-amber-50 text-amber-700`), Cold (`bg-blue-50 text-blue-700`).
  * `"Review & Pitch"` primary CTA triggers the focus detail window.

#### 3. Action Center Modal
* A centered modal overlay that animates into view when a card's review button is pressed.
* **Modal Context Elements:**
  * Displays the exact product-prospect scoring rationale parsed from the AI pipeline.
  * Dynamic localization tabs: Toggle between `🇬🇧 Email (English)` and `🇳🇱 Email (Nederlands)`.
  * Instantly copies the selected pitch draft to the clipboard with a copy confirmation badge.
  * **Interactive Objection Handler:** A text input area where users paste real-time client concerns to instantly invoke the ephemeral **AI Next-Step Advice** generator to secure bookings.