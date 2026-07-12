import type { PropertyFilters } from "@/types";

/** Lightweight {id,name} shape for the option lists we hand to the model. */
export interface NamedOption {
  id: number;
  name: string;
}

export interface ParsedSearch {
  filters: PropertyFilters;
  /** A short, friendly sentence to show above the results. */
  reply: string;
}

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

// Groq is free with no credit card. Model is overridable via env in case Groq
// retires a name; default is a solid instruction-following open model.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Turn a natural-language property request into structured {@link PropertyFilters}.
 *
 * Tries LLM providers in order of preference — Groq (free, no card) first, then
 * Google Gemini — and degrades to a keyword parser if no key is set or every
 * call errors out, so search never breaks (it just becomes more literal).
 */
export async function parseSearch(
  prompt: string,
  cities: NamedOption[],
  categories: NamedOption[],
): Promise<ParsedSearch> {
  const providers: Array<[string, () => Promise<ParsedSearch>]> = [];
  if (process.env.GROQ_API_KEY)
    providers.push(["Groq", () => parseWithGroq(prompt, cities, categories, process.env.GROQ_API_KEY!)]);
  if (process.env.GEMINI_API_KEY)
    providers.push(["Gemini", () => parseWithGemini(prompt, cities, categories, process.env.GEMINI_API_KEY!)]);

  for (const [name, run] of providers) {
    try {
      return await run();
    } catch (err) {
      console.error(`[parseSearch] ${name} failed, trying next option:`, err);
    }
  }
  return keywordFallback(prompt, cities, categories);
}

/**
 * The shared instruction given to every LLM provider: describes the JSON shape
 * and the mapping rules. Kept provider-agnostic so Groq and Gemini stay in sync.
 */
function buildSystemPrompt(cities: NamedOption[], categories: NamedOption[]): string {
  const cityList = cities.map((c) => `${c.id}=${c.name}`).join(", ");
  const catList = categories.map((c) => `${c.id}=${c.name}`).join(", ");
  return [
    "You convert a user's real-estate search request into JSON filters for a property database.",
    "Respond with ONLY a JSON object using these optional keys: city_id (int), category_id (int), is_for_rent (bool), min_price (int), max_price (int), min_bedrooms (int), min_bathrooms (int), search (string), reply (string). Omit any key that does not apply.",
    "Prices are in Indian Rupees. Understand Indian number words: 1 lakh = 100000, 1 crore = 10000000.",
    `Available cities (id=name): ${cityList}.`,
    `Available property categories (id=name): ${catList}.`,
    "Rules:",
    "- Only set city_id / category_id if the request clearly matches one from the lists above; otherwise omit it.",
    "- is_for_rent: true if they want to rent, false if they want to buy, omit if unclear.",
    "- min_bedrooms / min_bathrooms: whole numbers when a count is mentioned (e.g. '3 bhk' -> min_bedrooms 3).",
    "- min_price / max_price: integers in rupees ('under 50 lakh' -> max_price 5000000).",
    "- search: ONLY a specific proper place NAME that is NOT already in the city list (e.g. 'Tapovan', 'Rajpur Road'). Do NOT put property types (villa, flat, house), adjectives (luxury, cozy, spacious, modern, cheap), amenities (pool, garden), or VAGUE location phrases ('near the river', 'near market', 'in the hills', 'peaceful area', 'quiet neighbourhood') here — omit all of those and rely on the structured fields. When unsure, omit search.",
    "- reply: one short, warm sentence confirming what you searched for.",
  ].join("\n");
}

/* ── Groq path (free, OpenAI-compatible) ─────────────────────────────── */

async function parseWithGroq(
  prompt: string,
  cities: NamedOption[],
  categories: NamedOption[],
  key: string,
): Promise<ParsedSearch> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(cities, categories) },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Groq HTTP ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const text: string | undefined = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned no content");

  const raw = JSON.parse(text) as Record<string, unknown>;
  return {
    filters: sanitizeFilters(raw, cities, categories),
    reply:
      typeof raw.reply === "string" && raw.reply.trim()
        ? raw.reply.trim()
        : "Here's what I found for you.",
  };
}

/* ── Gemini path ─────────────────────────────────────────────────────── */

async function parseWithGemini(
  prompt: string,
  cities: NamedOption[],
  categories: NamedOption[],
  key: string,
): Promise<ParsedSearch> {
  const system = buildSystemPrompt(cities, categories);

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          city_id: { type: "integer" },
          category_id: { type: "integer" },
          is_for_rent: { type: "boolean" },
          min_price: { type: "integer" },
          max_price: { type: "integer" },
          min_bedrooms: { type: "integer" },
          min_bathrooms: { type: "integer" },
          search: { type: "string" },
          reply: { type: "string" },
        },
        required: ["reply"],
      },
    },
  };

  const res = await fetch(GEMINI_URL(key), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const text: string | undefined =
    json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");

  const raw = JSON.parse(text) as Record<string, unknown>;
  return {
    filters: sanitizeFilters(raw, cities, categories),
    reply:
      typeof raw.reply === "string" && raw.reply.trim()
        ? raw.reply.trim()
        : "Here's what I found for you.",
  };
}

/** Keep only valid filter values (guards against the model inventing ids). */
function sanitizeFilters(
  raw: Record<string, unknown>,
  cities: NamedOption[],
  categories: NamedOption[],
): PropertyFilters {
  const filters: PropertyFilters = {};
  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : undefined;

  const cityId = num(raw.city_id);
  if (cityId && cities.some((c) => c.id === cityId)) filters.city_id = cityId;

  const catId = num(raw.category_id);
  if (catId && categories.some((c) => c.id === catId)) filters.category_id = catId;

  if (typeof raw.is_for_rent === "boolean") filters.is_for_rent = raw.is_for_rent;

  const minP = num(raw.min_price);
  if (minP && minP > 0) filters.min_price = Math.round(minP);
  const maxP = num(raw.max_price);
  if (maxP && maxP > 0) filters.max_price = Math.round(maxP);

  const beds = num(raw.min_bedrooms);
  if (beds && beds > 0) filters.min_bedrooms = Math.round(beds);
  const baths = num(raw.min_bathrooms);
  if (baths && baths > 0) filters.min_bathrooms = Math.round(baths);

  if (typeof raw.search === "string" && raw.search.trim())
    filters.search = raw.search.trim().slice(0, 100);

  return filters;
}

/* ── Free keyword fallback (no API key needed) ───────────────────────── */

/**
 * Everyday words that map to each category (matched by slug). Lets the free
 * parser understand "plot", "shop", "flat" etc. instead of only the full
 * category name. Order matters: more specific categories are checked first so
 * "commercial"/"plot" win before the residential catch-all.
 */
const CATEGORY_KEYWORDS: { nameHint: string; words: string[] }[] = [
  { nameHint: "plot",        words: ["plot", "plots", "land", "parcel", "plotting"] },
  { nameHint: "commercial",  words: ["commercial", "shop", "showroom", "office", "retail", "cafe", "restaurant", "warehouse", "godown"] },
  { nameHint: "new",         words: ["new project", "upcoming", "under construction", "pre-launch", "prelaunch", "launch"] },
  { nameHint: "residential", words: ["apartment", "flat", "villa", "bungalow", "kothi", "residential", "duplex", "penthouse"] },
];

function keywordFallback(
  prompt: string,
  cities: NamedOption[],
  categories: NamedOption[],
): ParsedSearch {
  const text = prompt.toLowerCase();
  const filters: PropertyFilters = {};

  const city = cities.find((c) => text.includes(c.name.toLowerCase()));
  if (city) filters.city_id = city.id;

  if (/\brent(al|ing)?\b|for rent|to rent|lease/.test(text)) filters.is_for_rent = true;
  else if (/\bbuy|purchase|for sale|to buy\b/.test(text)) filters.is_for_rent = false;

  // Category: first try synonym keywords, then fall back to the full name.
  // Skip the residential mapping when renting — rentals live in their own
  // category, so forcing "residential" would exclude every rental.
  const catMatch = CATEGORY_KEYWORDS.find(
    (c) => (c.nameHint !== "residential" || !filters.is_for_rent) &&
      c.words.some((w) => text.includes(w)),
  );
  const cat =
    (catMatch && categories.find((c) => c.name.toLowerCase().includes(catMatch.nameHint))) ||
    categories.find((c) => text.includes(c.name.toLowerCase()));
  if (cat) filters.category_id = cat.id;

  const beds = text.match(/(\d+)\s*(?:bhk|bed|bedroom)/);
  if (beds) filters.min_bedrooms = Number(beds[1]);

  const baths = text.match(/(\d+)\s*(?:bath|bathroom|washroom)/);
  if (baths) filters.min_bathrooms = Number(baths[1]);

  const max = parseIndianAmount(text, /(?:under|below|less than|upto|up to|max)\s*/);
  if (max) filters.max_price = max;
  const min = parseIndianAmount(text, /(?:over|above|more than|min|starting)\s*/);
  if (min) filters.min_price = min;

  return { filters, reply: "Here's what I found for you." };
}

/** Parse amounts like "50 lakh", "1.5 crore", "5000000" following a cue word. */
function parseIndianAmount(text: string, cue: RegExp): number | undefined {
  const re = new RegExp(cue.source + /₹?\s*([\d.,]+)\s*(lakh|lac|crore|cr|k|thousand)?/.source, "i");
  const m = text.match(re);
  if (!m) return undefined;
  const value = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(value)) return undefined;
  const unit = (m[2] || "").toLowerCase();
  const mult =
    unit === "lakh" || unit === "lac" ? 100_000 :
    unit === "crore" || unit === "cr" ? 10_000_000 :
    unit === "k" || unit === "thousand" ? 1_000 : 1;
  return Math.round(value * mult);
}
