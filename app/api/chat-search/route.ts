import { NextResponse } from "next/server";
import { getProperties, getCities, getCategories } from "@/lib/queries/properties";
import { parseSearch } from "@/lib/chat/parse-search";
import { chatRatelimit } from "@/lib/ratelimit";

const RESULT_LIMIT = 6;

export async function POST(req: Request) {
  let prompt = "";
  try {
    const body = await req.json();
    prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: "Please type what you're looking for." }, { status: 400 });
  }
  if (prompt.length > 500) {
    return NextResponse.json({ error: "That message is a bit too long." }, { status: 400 });
  }

  // rate limit is best-effort; search still works if Upstash isn't configured
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const { success } = await chatRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "You're searching very fast — please wait a moment and try again." },
        { status: 429 },
      );
    }
  } catch {}

  const [cities, categories] = await Promise.all([getCities(), getCategories()]);

  const { filters, reply } = await parseSearch(
    prompt,
    cities.map((c) => ({ id: c.id, name: c.name })),
    categories.map((c) => ({ id: c.id, name: c.name })),
  );

  const { items, total } = await getProperties(filters, 1, RESULT_LIMIT);

  return NextResponse.json({
    reply,
    filters,
    total,
    properties: items,
  });
}
