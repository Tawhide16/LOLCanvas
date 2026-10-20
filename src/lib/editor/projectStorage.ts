import { fabricAdapter } from "./fabricAdapter";
import { useEditorStore } from "./editorStore";

const DB_NAME = "LOLCanvasDB";
const STORE_NAME = "projects";
const AUTOSAVE_KEY = "active_project";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface ProjectData {
  version: number;
  canvasJson: string;
  width: number;
  height: number;
  backgroundColor: string;
  savedAt: string;
}

export async function autosaveProject(): Promise<void> {
  try {
    if (!fabricAdapter.canvas) return;
    const canvasJson = JSON.stringify((fabricAdapter.canvas as any).toJSON(["id", "name", "isSticker", "stickerSymbol", "imageName", "previewUrl", "lockMovementX", "lockMovementY", "lockRotation", "lockScalingX", "lockScalingY"]));
    const { width, height, backgroundColor } = useEditorStore.getState();

    const data: ProjectData = {
      version: 1,
      canvasJson,
      width,
      height,
      backgroundColor,
      savedAt: new Date().toISOString(),
    };

    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(data, AUTOSAVE_KEY);
  } catch (err) {
    console.warn("Autosave to IndexedDB failed:", err);
  }
}

export async function getAutosavedProject(): Promise<ProjectData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(AUTOSAVE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function clearAutosavedProject(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(AUTOSAVE_KEY);
  } catch {}
}

export function exportProjectJsonFile(): void {
  if (!fabricAdapter.canvas) return;
  const canvasJson = JSON.stringify((fabricAdapter.canvas as any).toJSON(["id", "name", "isSticker", "stickerSymbol", "imageName", "previewUrl", "lockMovementX", "lockMovementY", "lockRotation", "lockScalingX", "lockScalingY"]));
  const { width, height, backgroundColor, activePresetName } = useEditorStore.getState();

  const data: ProjectData = {
    version: 1,
    canvasJson,
    width,
    height,
    backgroundColor,
    savedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lolcanvas-project-${activePresetName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importProjectJsonFile(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const data: ProjectData = JSON.parse(text);
    if (!data.canvasJson || !data.width || !data.height) return false;

    await fabricAdapter.loadFromHistory({
      canvasJson: data.canvasJson,
      width: data.width,
      height: data.height,
      backgroundColor: data.backgroundColor || "#FFFFFF",
      layersMeta: [],
    });
    return true;
  } catch (e) {
    console.error("Failed to parse project JSON:", e);
    return false;
  }
}
