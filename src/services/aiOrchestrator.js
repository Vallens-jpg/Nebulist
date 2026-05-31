import { supabase } from '@/lib/supabase'

// ─── Mock Lead Database ───────────────────────────────────────────────────────
const MOCK_DB = {
  'Nightclubs & Bars': {
    Amsterdam: [
      { company_name: 'Paradiso',          website: 'paradiso.nl',         description: 'Iconic music venue & nightclub in a former church, hosting weekly themed club nights with 1,500-capacity crowds.' },
      { company_name: 'Melkweg',           website: 'melkweg.nl',          description: 'Multi-venue cultural complex offering concerts, club nights and exhibitions in the heart of Amsterdam.' },
      { company_name: 'Club NYX',          website: 'clubnyx.nl',          description: 'LGBTQ+ nightclub renowned for spectacular immersive theme nights and elaborate visual productions.' },
      { company_name: 'Shelter Amsterdam', website: 'shelteramsterdam.nl', description: 'Underground techno club beneath the A\'DAM Tower with cutting-edge visual installations and a 24-hour license.' },
    ],
    Rotterdam: [
      { company_name: 'BAR Rotterdam', website: 'barrotterdam.nl', description: 'Industrial-chic club in Rotterdam\'s creative district hosting late-night events for 800+ guests.' },
      { company_name: 'Rotown',        website: 'rotown.nl',        description: 'Rotterdam venue combining restaurant, bar and stage for live music and weekend club nights.' },
      { company_name: 'BIRD Rotterdam',website: 'bird-rotterdam.nl',description: 'Jazz-rooted venue that hosts funk, soul and electronic club nights with a dedicated dancefloor.' },
    ],
    Utrecht: [
      { company_name: 'De Helling', website: 'dehelling.nl', description: 'Utrecht\'s leading alternative music venue and club night destination.' },
      { company_name: 'Ekko',       website: 'ekko.nl',       description: 'Independent Utrecht venue known for themed club events and alternative music programming.' },
    ],
  },
  'Music Festivals': {
    Amsterdam: [
      { company_name: 'Amsterdam Dance Event', website: 'amsterdam-dance-event.nl', description: 'World\'s leading electronic music conference & festival attracting 400,000+ visitors annually.' },
      { company_name: 'DGTL Festival',         website: 'dgtl.nl',                  description: 'Sustainability-focused electronic festival at NDSM Wharf, known for large-scale art installations.' },
      { company_name: 'Dekmantel Festival',    website: 'dekmantelfestival.com',    description: 'Internationally acclaimed festival in Amsterdam combining electronic music with immersive art.' },
    ],
    Rotterdam: [
      { company_name: 'Electrisize',         website: 'electrisize.nl',       description: 'Rotterdam\'s major EDM festival drawing 20,000+ attendees each summer.' },
      { company_name: 'Rotterdam Unlimited', website: 'rotterdamunlimited.nl', description: 'Large-scale multicultural street festival celebrating diversity through music and public art.' },
    ],
  },
  'Corporate Events': {
    Amsterdam: [
      { company_name: 'Amsterdam RAI',  website: 'rai.nl',       description: 'Premier convention centre hosting 600+ events annually for international corporations.' },
      { company_name: 'Adyen',          website: 'adyen.com',    description: 'Leading fintech company hosting high-profile corporate and investor events at their Amsterdam HQ.' },
      { company_name: 'Booking.com HQ', website: 'booking.com',  description: 'Global travel tech company regularly organising large internal brand activations and client events.' },
    ],
    Rotterdam: [
      { company_name: 'Rotterdam Ahoy',              website: 'ahoy.nl',               description: 'Major convention centre hosting trade shows, corporate conferences and live entertainment.' },
      { company_name: 'Port of Rotterdam Authority', website: 'portofrotterdam.com',   description: 'Europe\'s largest port authority organising high-profile business conferences and stakeholder events.' },
    ],
  },
  'Museums & Public Art': {
    Amsterdam: [
      { company_name: 'Stedelijk Museum',    website: 'stedelijk.nl',               description: 'Amsterdam\'s premier museum of modern art, known for commissioning large-scale interactive installations.' },
      { company_name: 'Eye Filmmuseum',      website: 'eyefilm.nl',                 description: 'Architecturally iconic film museum integrating experimental art installations in its public spaces.' },
      { company_name: 'NEMO Science Museum', website: 'nemosciencemuseum.nl',       description: 'Interactive science museum with a large public rooftop frequently used for outdoor art activations.' },
      { company_name: 'Gemeente Amsterdam',  website: 'amsterdam.nl/kunst-cultuur', description: 'City of Amsterdam arts department that commissions public art installations across the city.' },
    ],
    Rotterdam: [
      { company_name: 'Kunsthal Rotterdam', website: 'kunsthal.nl', description: 'Innovative exhibition hall presenting 25+ shows per year across art, design and photography.' },
      { company_name: 'BKOR Rotterdam',     website: 'bkor.nl',     description: 'Bureau Kunst en Openbare Ruimte — commissions permanent and temporary public installations city-wide.' },
    ],
  },
}

const CITY_KEYS = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'The Hague', 'Eindhoven', 'Groningen']

function detectCity(region) {
  return CITY_KEYS.find((c) => region.toLowerCase().includes(c.toLowerCase())) ?? null
}

function getMockLeads(industry, region) {
  const city  = detectCity(region)
  const byInd = MOCK_DB[industry] ?? {}
  if (city && byInd[city]) return byInd[city]
  return [
    { company_name: `Creative Hub ${region}`,  website: 'creativehub.nl',   description: `Dynamic creative venue in ${region} suitable for art installations and experiential events.` },
    { company_name: `EventSpace ${region}`,    website: 'eventspace.nl',    description: `Professional event venue in ${region} hosting cultural and corporate activations.` },
    { company_name: `Cultuurhuis ${region}`,   website: 'cultuurhuis.nl',   description: `Community arts centre in ${region} regularly presenting public installations and live performances.` },
  ]
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildPrompt(leads, spec, industry) {
  return `You are a B2B sales strategist for Stichting Nebulist, a Dutch company that creates ethereal bubble experiences for events across the Netherlands and Europe.

COMPANY PROFILE:
- Name: Stichting Nebulist
- Website: nebulist.nl
- Contact: de.nebulist@gmail.com
- Team: Alex Bakker (Concept Developer), Christiaan Schuinder (Installation Artist), Thijs Rijkers (Mechanic Artist)
- USP: 100% biodegradable, non-toxic bubble solution. Professional operator included. Works indoors & outdoors.

PRODUCT BEING PITCHED:
- Name: ${spec.name}
- Description: ${spec.description}
- Rental Price: €${spec.rentalPrice} per day (all-in, operator included)
- Base Cost: €${spec.baseCost}
- Target Industry: ${industry}

PROSPECTS:
${JSON.stringify(leads, null, 2)}

TASK: For each prospect, return a JSON array. Each element MUST match this schema exactly:
{
  "company_name": "<exact name>",
  "website": "<exact website>",
  "description": "<exact description>",
  "lead_score": "Hot" | "Warm" | "Cold",
  "score_reason": "<2 sentences explaining the score based on how well a bubble installation fits this specific venue>",
  "pitch_email_en": "<full formal B2B email in English — Subject:, personalised opening referencing their specific venue, 3 paragraphs, sign-off from Stichting Nebulist>",
  "pitch_email_nl": "<volledige zakelijke e-mail in het Nederlands — directe Nederlandse toon, Onderwerp:, persoonlijke aanhef, 3 alinea's, afsluiting namens Stichting Nebulist>"
}

RULES:
- Return ONLY the raw JSON array. No markdown. No code fences. No extra text.
- lead_score must be exactly "Hot", "Warm", or "Cold".
- Hot = venues that regularly host large events where a bubble experience creates strong visual impact.
- Warm = venues with moderate fit — could work but needs tailored pitch.
- Cold = venues where bubble installations are a stretch or rarely relevant.
- Both emails must be fully written and personalised to the specific company — mention their venue by name.`
}

// ─── Fallback Scorer (used when Gemini API is unavailable) ───────────────────
const HOT_KEYWORDS  = ['festival', 'immersive', 'installation', 'art', 'museum', 'culture', 'dgtl', 'dekmantel', 'ndsm', 'experimental']
const COLD_KEYWORDS = ['restaurant', 'café', 'cafe', 'community centre', 'community center']

function inferScore(lead) {
  const text = `${lead.company_name} ${lead.description}`.toLowerCase()
  if (HOT_KEYWORDS.some(k => text.includes(k)))  return 'Hot'
  if (COLD_KEYWORDS.some(k => text.includes(k))) return 'Cold'
  return 'Warm'
}

function buildFallbackLead(lead, spec, industry, projectId) {
  const score = inferScore(lead)

  const pitchEn = `Subject: Bubble Experience Proposal for ${lead.company_name} — Stichting Nebulist

Dear ${lead.company_name} team,

My name is Alex Bakker from Stichting Nebulist — we create ethereal bubble experiences that transform events into unforgettable visual spectacles. Our bubble installations have brought magic to festivals, nightclubs, corporate events, and art spaces across the Netherlands and Europe.

We believe ${lead.company_name} would be a perfect setting for our ${spec.name || 'bubble installation'}. At €${spec.rentalPrice} per day (fully operated, all-in), it creates an immersive atmosphere that guests remember and share on social media. Our bubble solution is 100% biodegradable, non-toxic, and safe for all audiences.

We’d love to schedule a short call to show you how it works in practice. Feel free to reply here or visit nebulist.nl to see our installations in action.

Warm regards,
Alex Bakker — Stichting Nebulist
de.nebulist@gmail.com | nebulist.nl
Instagram: @nebulist.nl`

  const pitchNl = `Onderwerp: Bubble Experience Voorstel voor ${lead.company_name} — Stichting Nebulist

Geachte ${lead.company_name} team,

Mijn naam is Alex Bakker van Stichting Nebulist — wij creëren etherische bubble-ervaringen die evenementen transformeren tot onvergetelijke visuele belevenissen. Onze installaties brachten magie naar festivals, clubs, bedrijfsevenementen en kunstlocaties door heel Nederland en Europa.

Wij zijn ervan overtuigd dat ${lead.company_name} een perfecte setting is voor onze ${spec.name || 'bubble installatie'}. Vanaf €${spec.rentalPrice} per dag (inclusief professionele operator, alles inbegrepen) creëert de installatie een meeslepende sfeer die gasten bijblijft en volop gedeeld wordt op social media. Onze bubbelvloeistof is 100% biologisch afbreekbaar, niet-giftig en veilig voor alle bezoekers.

Graag plannen we een kort gesprek om te laten zien hoe het werkt. U kunt direct reageren of ons bekijken op nebulist.nl.

Met vriendelijke groet,
Alex Bakker — Stichting Nebulist
de.nebulist@gmail.com | nebulist.nl
Instagram: @nebulist.nl`

  const reasonMap = {
    Hot:  `${lead.company_name} is een sterke match — hun focus op belevenisevenementen en grote programmering sluit direct aan bij de meeslepende potentie van de ${spec.name || 'bubble installatie'}. Hoge kans op conversie op basis van venueprofiel en publieksbereik.`,
    Warm: `${lead.company_name} toont goed potentieel — hun evenementenprofiel is compatibel met de bubble installatie, maar huurbudget en planningsafstemming moeten worden bevestigd in het eerste gesprek.`,
    Cold: `${lead.company_name} is een speculatief prospect — hoewel hun kernactiviteit kan profiteren van een bubble beleving, is een meer toegespitste waardepropositie nodig om duidelijke ROI-afstemming te vestigen.`,
  }

  return {
    project_id:     projectId,
    company_name:   lead.company_name,
    website:        lead.website        ?? '',
    description:    lead.description    ?? '',
    lead_score:     score,
    score_reason:   reasonMap[score],
    pitch_email_en: pitchEn,
    pitch_email_nl: pitchNl,
    status:         'Leads Found',
  }
}

// ─── Main Export ─────────────────────────────────────────────────────────────
/**
 * Full AI prospecting pipeline:
 *   1. Mock lead search  (Tavily stub)
 *   2. Gemini API call   (score + pitch generation) — falls back to local heuristic scorer if API fails
 *   3. Supabase bulk insert
 *
 * @param {{ projectId: string, targetIndustry: string, targetRegion: string, productSpec: object }} params
 * @returns {{ leadsCreated: number, usedFallback: boolean }}
 */
export async function runProspectingEngine({ projectId, targetIndustry, targetRegion, productSpec }) {
  // ── 1. Mock Lead Search ──────────────────────────────────────────────────
  const rawLeads = getMockLeads(targetIndustry, targetRegion)
  if (!rawLeads?.length) throw new Error('No prospects found for the selected industry and region.')

  let rows
  let usedFallback = false

  // ── 2. Gemini API Call ───────────────────────────────────────────────────
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  try {
    if (!apiKey) throw new Error('No Gemini API key — falling back to local scorer.')

    // Try models in order of preference for free-tier compatibility
    const MODELS = [
      'gemini-2.0-flash',
      'gemini-2.5-flash-preview-05-20',
      'gemini-1.5-flash',
    ]
    let response
    let lastErr
    for (const model of MODELS) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
              contents: [{ parts: [{ text: buildPrompt(rawLeads, productSpec, targetIndustry) }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: 'application/json' },
            }),
          }
        )
        if (response.ok) break // found working model
        lastErr = `Gemini ${model} → HTTP ${response.status}`
      } catch (fetchErr) {
        lastErr = fetchErr.message
      }
      response = null
    }
    if (!response || !response.ok) throw new Error(lastErr ?? 'All Gemini models failed')

    // response.ok already asserted above

    const json    = await response.json()
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    if (!rawText) throw new Error('Gemini returned empty response')

    const clean  = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const scored = JSON.parse(clean)
    if (!Array.isArray(scored) || scored.length === 0) throw new Error('Invalid Gemini response shape')

    const VALID = new Set(['Hot', 'Warm', 'Cold'])
    rows = scored
      .filter(l => typeof l?.company_name === 'string')
      .map(l => ({
        project_id:     projectId,
        company_name:   l.company_name,
        website:        l.website        ?? '',
        description:    l.description    ?? '',
        lead_score:     VALID.has(l.lead_score) ? l.lead_score : 'Cold',
        score_reason:   l.score_reason   ?? '',
        pitch_email_en: l.pitch_email_en ?? '',
        pitch_email_nl: l.pitch_email_nl ?? '',
        status:         'Leads Found',
      }))

    if (rows.length === 0) throw new Error('No valid leads parsed from Gemini')

  } catch (geminiErr) {
    // ── Graceful fallback: local heuristic scoring + template pitch emails ──
    console.warn('[NebulaKit] Gemini unavailable, using local scorer:', geminiErr.message)
    usedFallback = true
    rows = rawLeads.map(lead => buildFallbackLead(lead, productSpec, targetIndustry, projectId))
  }

  // ── 3. Bulk Insert to Supabase ───────────────────────────────────────────
  const { error } = await supabase.from('leads').insert(rows)
  if (error) throw new Error(`Supabase insert failed: ${error.message}`)

  return { leadsCreated: rows.length, usedFallback }
}
