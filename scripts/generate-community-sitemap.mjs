/**
 * Generate a sitemap for the Discourse community site.
 *
 * Crawls categories 38 and 11 (plus their subcategories) via the Discourse
 * REST API, paginates through all public topics, and writes a standard sitemap
 * XML file to public/community-sitemap.xml.
 *
 * The sitemap is hosted on offon.dev but contains community.offon.dev URLs.
 * Submit it in Google Search Console after verifying community.offon.dev there.
 *
 * Usage: node scripts/generate-community-sitemap.mjs
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMUNITY_BASE = "https://community.offon.dev";
const OUTPUT_PATH = resolve(__dirname, "../public/community-sitemap.xml");
const CATEGORY_IDS = [38, 11];
const RATE_LIMIT_MS = 500;
// Fail if fewer than this many URLs are collected — guards against writing an
// empty sitemap when the Discourse API returns unexpected empty responses.
const MIN_EXPECTED_URLS = 10;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchCategory(categoryId) {
  const data = await fetchJson(`${COMMUNITY_BASE}/c/${categoryId}/show.json`);
  return data.category;
}

async function fetchTopicsInCategory(slug, id) {
  const topics = [];
  let page = 0;

  while (true) {
    let data;
    try {
      data = await fetchJson(
        `${COMMUNITY_BASE}/c/${encodeURIComponent(slug)}/${id}/l/latest.json?page=${page}`
      );
    } catch (err) {
      console.warn(`  Stopping pagination for category ${id} at page ${page}: ${err.message}`);
      break;
    }

    const pageTopics = (data.topic_list?.topics ?? []).filter(
      (t) => t.id > 0 && !t.deleted_at
    );

    topics.push(...pageTopics);

    if (!data.topic_list?.more_topics_url || pageTopics.length === 0) break;
    page++;
    await delay(RATE_LIMIT_MS);
  }

  return topics;
}

function isoDate(isoString) {
  return isoString ? isoString.split("T")[0] : new Date().toISOString().split("T")[0];
}

function buildSitemapXml(entries) {
  const urlBlocks = entries
    .map(
      ({ loc, lastmod, changefreq, priority }) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlBlocks,
    "</urlset>",
    "",
  ].join("\n");
}

async function main() {
  const categories = [];

  for (const id of CATEGORY_IDS) {
    console.log(`Fetching category ${id}...`);
    const root = await fetchCategory(id);
    console.log(`  ${root.name} (${root.id})`);
    categories.push(root);

    for (const subId of root.subcategory_ids ?? []) {
      await delay(RATE_LIMIT_MS);
      try {
        const sub = await fetchCategory(subId);
        categories.push(sub);
        console.log(`  Subcategory: ${sub.name} (${sub.id})`);
      } catch (err) {
        console.warn(`  Skipping subcategory ${subId}: ${err.message}`);
      }
    }

    await delay(RATE_LIMIT_MS);
  }

  const entries = [];
  const seen = new Set();
  const today = new Date().toISOString().split("T")[0];

  // Home page
  entries.push({ loc: COMMUNITY_BASE, lastmod: today, changefreq: "daily", priority: "1.0" });
  seen.add(COMMUNITY_BASE);

  // Category index pages
  for (const cat of categories) {
    const loc = `${COMMUNITY_BASE}/c/${cat.slug}/${cat.id}`;
    if (!seen.has(loc)) {
      seen.add(loc);
      entries.push({ loc, lastmod: today, changefreq: "daily", priority: "0.8" });
    }
  }

  // Topic pages
  for (const cat of categories) {
    console.log(`Fetching topics for "${cat.name}"...`);
    let topics;
    try {
      topics = await fetchTopicsInCategory(cat.slug, cat.id);
    } catch (err) {
      console.warn(`  Skipping category ${cat.id}: ${err.message}`);
      continue;
    }

    for (const topic of topics) {
      const loc = `${COMMUNITY_BASE}/t/${topic.slug}/${topic.id}`;
      if (!seen.has(loc)) {
        seen.add(loc);
        const lastmod = isoDate(topic.bumped_at ?? topic.last_posted_at ?? topic.created_at);
        entries.push({ loc, lastmod, changefreq: "weekly", priority: "0.7" });
      }
    }

    console.log(`  ${topics.length} topic(s) collected.`);
    await delay(RATE_LIMIT_MS);
  }

  if (entries.length < MIN_EXPECTED_URLS) {
    throw new Error(
      `Only ${entries.length} URL(s) collected — expected at least ${MIN_EXPECTED_URLS}. ` +
        "The Discourse API may be returning incomplete data. Aborting to protect the existing sitemap."
    );
  }

  writeFileSync(OUTPUT_PATH, buildSitemapXml(entries));
  console.log(`\nDone. ${entries.length} URL(s) written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
