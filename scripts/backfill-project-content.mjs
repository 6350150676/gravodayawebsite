#!/usr/bin/env node
/**
 * One-off: lift each project's existing free-text content into the structured
 * columns the redesigned detail page renders from.
 *
 * Projects were written as one long `description` ("PROJECT HIGHLIGHTS", a
 * bullet list, "LOCATION ADVANTAGE", …) and one `payment_plan` blob. The new
 * page reads highlights, amenity categories, location advantages, payment rows
 * and charges as separate lists an admin edits in the panel. The page can read
 * those out of the old text on the fly — but doing it once, here, puts the
 * result in the database where the admin can actually edit it.
 *
 * The parsing itself lives in lib/project-legacy-content.ts, so what this
 * writes is exactly what the page would have shown.
 *
 * Run it after applying supabase/migrations/20260830000000_project_page_content.sql:
 *
 *   node scripts/backfill-project-content.mjs                  # preview only
 *   node scripts/backfill-project-content.mjs --apply          # write (backs up first)
 *   node scripts/backfill-project-content.mjs --apply --force  # redo a project that already has content
 *
 * Everything it writes stays editable in Admin → Projects → Edit.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { deriveLegacyContent } from "../lib/project-legacy-content.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      for (const line of readFileSync(join(ROOT, file), "utf8").split("\n")) {
        const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    } catch {
      /* file is optional */
    }
  }
}

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

const isEmpty = (value) => !Array.isArray(value) || value.length === 0;

loadEnv();
const supabase = client();

const { data: projects, error } = await supabase
  .from("projects")
  .select(
    "id, name, slug, description, payment_plan, overview, payment_note, highlights, amenity_groups, location_advantages, payment_plans, additional_charges",
  )
  .order("created_at", { ascending: true });

if (error) {
  console.error(
    error.message.includes("does not exist")
      ? `${error.message}\n\nRun supabase/migrations/20260830000000_project_page_content.sql in the Supabase SQL Editor first.`
      : error.message,
  );
  process.exit(1);
}

const updates = [];

for (const project of projects) {
  const already =
    !isEmpty(project.highlights) ||
    !isEmpty(project.amenity_groups) ||
    !isEmpty(project.location_advantages) ||
    !isEmpty(project.payment_plans) ||
    !isEmpty(project.additional_charges);

  if (already && !FORCE) {
    console.log(`· ${project.name} — already has structured content, skipping (--force to redo)`);
    continue;
  }

  const content = deriveLegacyContent(project);

  const patch = {
    overview: project.overview?.trim() || content.overview || null,
    // Whatever moved into a section comes out of the description; anything the
    // parser didn't understand stays exactly where it was.
    description: content.description || project.description,
    highlights: content.highlights,
    amenity_groups: content.amenityGroups,
    location_advantages: content.locationAdvantages,
    payment_plans: content.paymentRows,
    additional_charges: content.additionalCharges,
    payment_note: project.payment_note?.trim() || content.paymentNote || null,
    // Emptied only when every line of it was understood, so nothing is lost.
    payment_plan: content.paymentPlanText || null,
  };

  console.log(
    `\n▸ ${project.name} (/projects/${project.slug})\n` +
      `    overview            ${patch.overview ? `${patch.overview.slice(0, 60)}…` : "—"}\n` +
      `    highlights          ${patch.highlights.length}\n` +
      `    amenity categories  ${patch.amenity_groups.length}` +
      `${patch.amenity_groups.length ? ` (${patch.amenity_groups.map((g) => `${g.title} ×${g.items.length}`).join(", ")})` : ""}\n` +
      `    location advantages ${patch.location_advantages.length}\n` +
      `    payment rows        ${patch.payment_plans.length}\n` +
      `    additional charges  ${patch.additional_charges.length}\n` +
      `    free-text plan      ${patch.payment_plan ? "kept — not fully understood, still rendered as-is" : "moved into the table"}\n` +
      `    description         ${(project.description ?? "").length} → ${patch.description.length} chars`,
  );

  updates.push({ project, patch });
}

if (!updates.length) {
  console.log("\nNothing to do.");
  process.exit(0);
}

if (!APPLY) {
  console.log("\nPreview only. Re-run with --apply to write these changes.");
  process.exit(0);
}

// Back up the previous values before touching anything.
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "scripts", "backups");
mkdirSync(backupDir, { recursive: true });
const backup = join(backupDir, `projects-${stamp}.json`);
writeFileSync(backup, JSON.stringify(updates.map((u) => u.project), null, 2));
console.log(`\nBacked up previous values to ${backup}`);

for (const { project, patch } of updates) {
  const { error: writeError } = await supabase.from("projects").update(patch).eq("id", project.id);
  console.log(writeError ? `✗ ${project.name}: ${writeError.message}` : `✓ ${project.name} updated`);
}

console.log("\nDone. Review and fine-tune each project in Admin → Projects → Edit.");
