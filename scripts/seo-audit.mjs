import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const baseUrl = "https://chatgptchongzhi.github.io/chatgpt-plus-guide/";
const ignoredDirectories = new Set([".git", "node_modules", "apps"]);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".audit") || ignoredDirectories.has(entry.name)) return [];
    const fullPath = join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function pageUrl(file) {
  const path = relative(root, file).split(sep).join("/");
  if (path === "index.html") return baseUrl;
  return baseUrl + (path.endsWith("/index.html") ? path.slice(0, -10) : path);
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function schemaNodes(value) {
  if (Array.isArray(value)) return value.flatMap(schemaNodes);
  if (!value || typeof value !== "object") return [];
  return [value, ...schemaNodes(value["@graph"] ?? [])];
}

const htmlFiles = walk(root).filter((file) => file.endsWith(".html"));
const pages = htmlFiles.map((file) => ({
  file,
  rel: relative(root, file).split(sep).join("/"),
  html: readFileSync(file, "utf8"),
}));
const indexablePages = pages.filter(({ html }) => !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html));
const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const errors = [];
const seen = { title: new Map(), description: new Map(), canonical: new Map() };
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
const expectedSitemapUrls = new Set(indexablePages.map(({ file }) => pageUrl(file)));

for (const url of sitemapUrls) {
  if (sitemapUrls.indexOf(url) !== sitemapUrls.lastIndexOf(url)) errors.push(`sitemap.xml: duplicate URL ${url}`);
  if (!expectedSitemapUrls.has(url)) errors.push(`sitemap.xml: non-canonical or non-indexable URL ${url}`);
}
for (const url of expectedSitemapUrls) {
  if (!sitemapUrls.includes(url)) errors.push(`sitemap.xml: missing canonical URL ${url}`);
}

function recordUnique(kind, value, rel) {
  if (!value) return;
  if (seen[kind].has(value)) errors.push(`${rel}: ${kind} duplicates ${seen[kind].get(value)}`);
  else seen[kind].set(value, rel);
}

for (const { file, rel, html } of indexablePages) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, " ").trim() ?? "";
  const descriptionTag = html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0] ?? "";
  const canonicalTag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] ?? "";
  const description = attr(descriptionTag, "content");
  const canonical = attr(canonicalTag, "href");
  const expectedUrl = pageUrl(file);

  if (!title) errors.push(`${rel}: missing title`);
  if (!description) errors.push(`${rel}: missing meta description`);
  if (canonical !== expectedUrl) errors.push(`${rel}: canonical must be ${expectedUrl}`);
  if ((html.match(/<h1\b/gi) ?? []).length !== 1) errors.push(`${rel}: must contain exactly one h1`);
  recordUnique("title", title, rel);
  recordUnique("description", description, rel);
  recordUnique("canonical", canonical, rel);

  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!jsonLd.length) errors.push(`${rel}: missing JSON-LD`);
  const expectedSchema = rel.startsWith("topics/") ? "CollectionPage" : "BlogPosting";
  let hasExpectedSchema = false;
  let schemaMatchesPage = false;
  for (const match of jsonLd) {
    try {
      const value = JSON.parse(match[1]);
      const schemaNode = schemaNodes(value).find((node) => {
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        return types.includes(expectedSchema);
      });
      if (schemaNode) {
        hasExpectedSchema = true;
        const schemaUrl = expectedSchema === "CollectionPage"
          ? schemaNode.url
          : (typeof schemaNode.mainEntityOfPage === "string" ? schemaNode.mainEntityOfPage : schemaNode.mainEntityOfPage?.["@id"]);
        if (schemaUrl === expectedUrl) schemaMatchesPage = true;
      }
    } catch (error) {
      errors.push(`${rel}: invalid JSON-LD (${error.message})`);
    }
  }
  if (!hasExpectedSchema) errors.push(`${rel}: missing ${expectedSchema} schema`);
  else if (!schemaMatchesPage) errors.push(`${rel}: ${expectedSchema} URL must match canonical ${expectedUrl}`);
  if (expectedSchema === "BlogPosting" && (!/"datePublished"\s*:/.test(html) || !/"dateModified"\s*:/.test(html))) errors.push(`${rel}: missing structured publication dates`);
  if (expectedSchema === "BlogPosting") {
    const relatedBlock = html.match(/<!-- related-articles:start -->([\s\S]*?)<!-- related-articles:end -->/i)?.[1] ?? "";
    const relatedCount = (relatedBlock.match(/<a\b/gi) ?? []).length;
    const deliberateOptOut = html.includes("<!-- related-articles:none-no-relevant-content -->");
    if (!deliberateOptOut && (relatedCount < 3 || relatedCount > 5)) {
      errors.push(`${rel}: related articles must contain 3 to 5 links, or use the explicit no-relevant-content marker`);
    }
  }
  if (!sitemap.includes(`<loc>${expectedUrl}</loc>`)) errors.push(`${rel}: missing from sitemap.xml`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\balt=["'][^"']*["']/i.test(tag)) errors.push(`${rel}: image missing alt`);
    if (!/\bwidth=["'][^"']+["']/i.test(tag) || !/\bheight=["'][^"']+["']/i.test(tag)) errors.push(`${rel}: image missing width/height`);
  }

  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)) {
    const href = match[1];
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    const clean = href.split("?")[0];
    const siteRelative = clean.startsWith("/chatgpt-plus-guide/") ? clean.slice("/chatgpt-plus-guide/".length) : null;
    const target = siteRelative === null ? resolve(dirname(file), clean) : resolve(root, siteRelative);
    const candidates = [target, join(target, "index.html")];
    if (!candidates.some(existsSync)) errors.push(`${rel}: broken local link ${href}`);
  }
}

if (!existsSync(join(root, "404.html"))) errors.push("missing custom 404.html");

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`SEO audit passed: ${indexablePages.length} indexable pages checked.`);

