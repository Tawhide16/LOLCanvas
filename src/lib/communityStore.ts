import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "community_templates.json");

let cachedTemplates: any[] | null = null;
let cachedMtimeMs: number = 0;

function ensureStoreFile(): string {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Could not ensure community store file:", err);
  }
  return STORE_FILE;
}

export function getStoredCommunityTemplates(): any[] {
  try {
    const file = ensureStoreFile();
    if (fs.existsSync(file)) {
      const stat = fs.statSync(file);
      // Fast-path: return cached in-memory array if file has not changed
      if (cachedTemplates && stat.mtimeMs <= cachedMtimeMs) {
        return cachedTemplates;
      }
      const data = fs.readFileSync(file, "utf8");
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        cachedTemplates = list;
        cachedMtimeMs = stat.mtimeMs;
        return cachedTemplates;
      }
    }
  } catch (err) {
    console.warn("Could not read community templates file:", err);
  }
  return cachedTemplates || [];
}

export function saveCommunityTemplate(template: any): void {
  try {
    const list = getStoredCommunityTemplates();
    const updated = [
      template,
      ...list.filter((t: any) => t.id !== template.id && t.slug !== template.slug),
    ];
    cachedTemplates = updated;
    const file = ensureStoreFile();
    fs.writeFileSync(file, JSON.stringify(updated, null, 2), "utf8");
    try {
      cachedMtimeMs = fs.statSync(file).mtimeMs;
    } catch {}
  } catch (err) {
    console.warn("Could not save community template to file:", err);
  }
}

export function deleteStoredCommunityTemplate(idOrSlug: string): void {
  try {
    const list = getStoredCommunityTemplates();
    const updated = list.filter((t: any) => t.id !== idOrSlug && t.slug !== idOrSlug);
    cachedTemplates = updated;
    const file = ensureStoreFile();
    fs.writeFileSync(file, JSON.stringify(updated, null, 2), "utf8");
    try {
      cachedMtimeMs = fs.statSync(file).mtimeMs;
    } catch {}
  } catch (err) {
    console.warn("Could not delete community template from file:", err);
  }
}
