import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "community_templates.json");

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
      const data = fs.readFileSync(file, "utf8");
      const list = JSON.parse(data);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.warn("Could not read community templates file:", err);
  }
  return [];
}

export function saveCommunityTemplate(template: any): void {
  try {
    const list = getStoredCommunityTemplates();
    const updated = [
      template,
      ...list.filter((t: any) => t.id !== template.id && t.slug !== template.slug),
    ];
    const file = ensureStoreFile();
    fs.writeFileSync(file, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not save community template to file:", err);
  }
}

export function deleteStoredCommunityTemplate(idOrSlug: string): void {
  try {
    const list = getStoredCommunityTemplates();
    const updated = list.filter((t: any) => t.id !== idOrSlug && t.slug !== idOrSlug);
    const file = ensureStoreFile();
    fs.writeFileSync(file, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not delete community template from file:", err);
  }
}
