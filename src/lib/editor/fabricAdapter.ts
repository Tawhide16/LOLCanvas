import * as fabric from "fabric";
import { SnappingManager } from "./snappingGuides";
import { useEditorStore } from "./editorStore";

// Neo-brutalist styling for transformer controls
export function applyNeoBrutalistControls(obj: fabric.FabricObject) {
  obj.set({
    cornerColor: "#FAF9F5",
    cornerStrokeColor: "#000000",
    cornerSize: 10,
    cornerStyle: "rect",
    transparentCorners: false,
    borderColor: "#E11D48",
    borderScaleFactor: 2,
    borderDashArray: [4, 4],
    padding: 6,
  });
}

// Global control customization
fabric.FabricObject.ownDefaults = {
  ...fabric.FabricObject.ownDefaults,
  cornerColor: "#FAF9F5",
  cornerStrokeColor: "#000000",
  cornerSize: 10,
  cornerStyle: "rect",
  transparentCorners: false,
  borderColor: "#E11D48",
  borderScaleFactor: 2,
  borderDashArray: [4, 4],
  padding: 6,
};

export class FabricAdapter {
  public canvas: fabric.Canvas | null = null;
  private snappingManager: SnappingManager | null = null;
  private isInternalUpdate = false;
  private clipboard: fabric.FabricObject | null = null;

  public init(canvasEl: HTMLCanvasElement, width: number, height: number, backgroundColor = "#FFFFFF") {
    if (this.canvas) {
      this.destroy();
    }

    this.canvas = new fabric.Canvas(canvasEl, {
      width,
      height,
      backgroundColor,
      preserveObjectStacking: true,
      selectionColor: "rgba(225, 29, 72, 0.15)",
      selectionBorderColor: "#E11D48",
      selectionLineWidth: 1.5,
      selectionDashArray: [4, 4],
      stopContextMenu: true,
      fireRightClick: true,
    });

    this.snappingManager = new SnappingManager(this.canvas);
    this.setupEventListeners();

    // Push initial history state
    this.saveHistoryState();
    this.syncLayersToStore();

    return this.canvas;
  }

  public setDimensions(width: number, height: number) {
    if (!this.canvas) return;
    this.canvas.setDimensions({ width, height });
    this.canvas.requestRenderAll();
  }

  public setBackgroundColor(color: string) {
    if (!this.canvas) return;
    this.canvas.backgroundColor = color;
    this.canvas.requestRenderAll();
    this.saveHistoryState();
  }

  private setupEventListeners() {
    if (!this.canvas) return;

    this.canvas.on("object:moving", (e) => {
      if (e.target && this.snappingManager && useEditorStore.getState().isSnappingEnabled) {
        this.snappingManager.handleObjectMoving(e.target);
      }
    });

    this.canvas.on("object:modified", () => {
      this.snappingManager?.clearGuides();
      this.syncActiveObjectProps();
      this.syncLayersToStore();
      this.saveHistoryState();
    });

    this.canvas.on("text:changed", () => {
      this.syncActiveObjectProps();
      this.syncLayersToStore();
      this.saveHistoryState();
    });

    this.canvas.on("selection:created", () => {
      this.updateSelectionState();
    });

    this.canvas.on("selection:updated", () => {
      this.updateSelectionState();
    });

    this.canvas.on("selection:cleared", () => {
      useEditorStore.getState().setSelectedLayerIds([]);
      useEditorStore.getState().setActiveObjectProps(null);
    });
  }

  private updateSelectionState() {
    if (!this.canvas) return;
    const activeObjects = this.canvas.getActiveObjects();
    const ids = activeObjects.map((o: any) => o.id || "").filter(Boolean);
    useEditorStore.getState().setSelectedLayerIds(ids);
    this.syncActiveObjectProps();
  }

  public syncActiveObjectProps() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (!active) {
      useEditorStore.getState().setActiveObjectProps(null);
      return;
    }

    if (active instanceof fabric.Textbox || active instanceof fabric.FabricText) {
      const tb = active as fabric.Textbox;
      useEditorStore.getState().setActiveObjectProps({
        text: tb.text,
        fontFamily: tb.fontFamily,
        fontSize: tb.fontSize,
        fill: (tb.fill as string) || "#000000",
        stroke: (tb.stroke as string) || "",
        strokeWidth: tb.strokeWidth || 0,
        textAlign: tb.textAlign,
        isBold: tb.fontWeight === "bold" || Number(tb.fontWeight) >= 700,
        isItalic: tb.fontStyle === "italic",
        isUnderline: !!tb.underline,
        lineHeight: tb.lineHeight || 1.16,
        charSpacing: tb.charSpacing || 0,
        opacity: tb.opacity ?? 1,
        angle: tb.angle || 0,
        scaleX: tb.scaleX || 1,
        scaleY: tb.scaleY || 1,
      });
    } else {
      useEditorStore.getState().setActiveObjectProps({
        opacity: active.opacity ?? 1,
        angle: active.angle || 0,
        scaleX: active.scaleX || 1,
        scaleY: active.scaleY || 1,
      });
    }
  }

  public syncLayersToStore() {
    if (!this.canvas || this.isInternalUpdate) return;
    const objects = this.canvas.getObjects().filter((o: any) => !o.excludeFromExport);

    // Map layers in reverse order so topmost layer is on top of layer list
    const layersMeta = [...objects].reverse().map((obj: any, index) => {
      if (!obj.id) {
        obj.id = "layer_" + Math.random().toString(36).substr(2, 9);
      }
      let type: "text" | "image" | "sticker" | "group" = "text";
      if (obj instanceof fabric.FabricImage) {
        type = obj.isSticker ? "sticker" : "image";
      } else if (obj instanceof fabric.Group) {
        type = "group";
      }

      let name = obj.name;
      if (!name) {
        if (type === "text") {
          name = (obj.text || "Text Caption").slice(0, 18);
        } else if (type === "sticker") {
          name = obj.stickerSymbol || "Sticker Overlay";
        } else if (type === "image") {
          name = obj.imageName || "Image Layer";
        } else {
          name = "Group Layer";
        }
      }

      return {
        id: obj.id,
        name,
        type,
        locked: !!obj.lockMovementX,
        visible: obj.visible !== false,
        zIndex: objects.length - index,
        previewUrl: obj.previewUrl,
      };
    });

    useEditorStore.getState().setLayers(layersMeta);
  }

  public saveHistoryState() {
    if (!this.canvas || this.isInternalUpdate) return;
    const canvasJson = JSON.stringify(this.canvas.toJSON(["id", "name", "isSticker", "stickerSymbol", "imageName", "previewUrl", "lockMovementX", "lockMovementY", "lockRotation", "lockScalingX", "lockScalingY"]));
    const { width, height, backgroundColor, layers } = useEditorStore.getState();

    useEditorStore.getState().pushHistory({
      canvasJson,
      width,
      height,
      backgroundColor,
      layersMeta: layers,
    });
  }

  public async loadFromHistory(step: { canvasJson: string; width: number; height: number; backgroundColor: string; layersMeta: any[] }) {
    if (!this.canvas) return;
    this.isInternalUpdate = true;
    try {
      await this.canvas.loadFromJSON(JSON.parse(step.canvasJson));
      this.canvas.backgroundColor = step.backgroundColor;
      this.canvas.setDimensions({ width: step.width, height: step.height });

      // Apply controls to all objects
      this.canvas.getObjects().forEach((obj) => applyNeoBrutalistControls(obj));
      this.canvas.requestRenderAll();

      useEditorStore.getState().setCanvasSize(step.width, step.height);
      useEditorStore.getState().setBackgroundColor(step.backgroundColor);
      useEditorStore.getState().setLayers(step.layersMeta);
    } finally {
      this.isInternalUpdate = false;
      this.updateSelectionState();
    }
  }

  // --- Layer Creation Methods ---

  public addTextLayer(text = "NEW CAPTION", options?: Partial<fabric.TextboxProps>) {
    if (!this.canvas) return;
    const canvasWidth = this.canvas.width || 1080;
    const canvasHeight = this.canvas.height || 1080;

    const defaultFontSize = Math.round(canvasWidth * 0.06);

    const textbox = new fabric.Textbox(text, {
      id: "text_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      name: text.slice(0, 18),
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      originX: "center",
      originY: "center",
      fontFamily: "Impact",
      fontSize: defaultFontSize,
      fill: "#FFFFFF",
      stroke: "#000000",
      strokeWidth: Math.max(2, Math.round(defaultFontSize * 0.06)),
      strokeUniform: true,
      textAlign: "center",
      width: Math.min(canvasWidth * 0.85, 750),
      paintFirst: "stroke",
      ...options,
    } as any);

    applyNeoBrutalistControls(textbox);
    this.canvas.add(textbox);
    this.canvas.setActiveObject(textbox);
    this.canvas.requestRenderAll();

    this.syncLayersToStore();
    this.saveHistoryState();
  }

  public async addImageLayer(url: string, name = "Image Layer", isSticker = false, symbol?: string) {
    if (!this.canvas) return;
    const canvasWidth = this.canvas.width || 1080;
    const canvasHeight = this.canvas.height || 1080;

    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      const maxDim = isSticker ? Math.min(canvasWidth, canvasHeight) * 0.35 : Math.min(canvasWidth, canvasHeight) * 0.65;
      const currentMax = Math.max(img.width || 1, img.height || 1);
      const scale = maxDim / currentMax;

      (img as any).id = (isSticker ? "sticker_" : "img_") + Date.now();
      (img as any).name = name;
      (img as any).isSticker = isSticker;
      (img as any).stickerSymbol = symbol;
      (img as any).previewUrl = url;

      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
      });

      applyNeoBrutalistControls(img);
      this.canvas.add(img);
      this.canvas.setActiveObject(img);
      this.canvas.requestRenderAll();

      this.syncLayersToStore();
      this.saveHistoryState();
    } catch (e) {
      console.error("Failed to load image into canvas:", e);
    }
  }

  // --- Object Modification Methods ---

  public updateActiveObject(properties: Record<string, any>) {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (!active) return;

    active.set(properties as any);
    active.setCoords();
    this.canvas.requestRenderAll();

    this.syncActiveObjectProps();
    this.saveHistoryState();
  }

  public selectLayerById(id: string) {
    if (!this.canvas) return;
    const target = this.canvas.getObjects().find((o: any) => o.id === id);
    if (target) {
      this.canvas.setActiveObject(target);
      this.canvas.requestRenderAll();
      this.updateSelectionState();
    }
  }

  public toggleLayerLock(id: string) {
    if (!this.canvas) return;
    const obj = this.canvas.getObjects().find((o: any) => o.id === id);
    if (!obj) return;

    const isLocked = !obj.lockMovementX;
    obj.set({
      lockMovementX: isLocked,
      lockMovementY: isLocked,
      lockRotation: isLocked,
      lockScalingX: isLocked,
      lockScalingY: isLocked,
      hasControls: !isLocked,
    });

    this.canvas.requestRenderAll();
    useEditorStore.getState().updateLayerMeta(id, { locked: isLocked });
    this.saveHistoryState();
  }

  public toggleLayerVisibility(id: string) {
    if (!this.canvas) return;
    const obj = this.canvas.getObjects().find((o: any) => o.id === id);
    if (!obj) return;

    obj.set({ visible: !obj.visible });
    if (!obj.visible && this.canvas.getActiveObject() === obj) {
      this.canvas.discardActiveObject();
    }

    this.canvas.requestRenderAll();
    useEditorStore.getState().updateLayerMeta(id, { visible: obj.visible });
    this.saveHistoryState();
  }

  public renameLayer(id: string, newName: string) {
    if (!this.canvas) return;
    const obj: any = this.canvas.getObjects().find((o: any) => o.id === id);
    if (obj) {
      obj.name = newName;
      useEditorStore.getState().updateLayerMeta(id, { name: newName });
      this.saveHistoryState();
    }
  }

  public reorderLayers(fromIndex: number, toIndex: number) {
    if (!this.canvas) return;
    const objects = this.canvas.getObjects().filter((o: any) => !o.excludeFromExport);
    // Since UI layers list is top-to-bottom (reversed zIndex):
    // UI index 0 is top object (last in Fabric objects array)
    const total = objects.length;
    const fabricFrom = total - 1 - fromIndex;
    const fabricTo = total - 1 - toIndex;

    const targetObj = objects[fabricFrom];
    if (!targetObj) return;

    if (fabricTo >= fabricFrom) {
      for (let i = fabricFrom; i < fabricTo; i++) {
        this.canvas.bringObjectForward(targetObj);
      }
    } else {
      for (let i = fabricFrom; i > fabricTo; i--) {
        this.canvas.sendObjectBackwards(targetObj);
      }
    }

    this.canvas.requestRenderAll();
    this.syncLayersToStore();
    this.saveHistoryState();
  }

  public bringToFront() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (active) {
      this.canvas.bringObjectToFront(active);
      this.canvas.requestRenderAll();
      this.syncLayersToStore();
      this.saveHistoryState();
    }
  }

  public sendToBack() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (active) {
      this.canvas.sendObjectToBack(active);
      this.canvas.requestRenderAll();
      this.syncLayersToStore();
      this.saveHistoryState();
    }
  }

  public deleteSelected() {
    if (!this.canvas) return;
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => this.canvas?.remove(obj));
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();

    this.syncLayersToStore();
    this.saveHistoryState();
  }

  public async duplicateSelected() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (!active) return;

    const cloned = await active.clone();
    (cloned as any).id = "layer_" + Date.now();
    cloned.set({
      left: (cloned.left || 0) + 24,
      top: (cloned.top || 0) + 24,
      evented: true,
    });

    applyNeoBrutalistControls(cloned);
    this.canvas.add(cloned);
    this.canvas.setActiveObject(cloned);
    this.canvas.requestRenderAll();

    this.syncLayersToStore();
    this.saveHistoryState();
  }

  // --- Multi-Selection Tools: Group & Ungroup ---

  public groupSelected() {
    if (!this.canvas) return;
    const activeObj = this.canvas.getActiveObject();
    if (!(activeObj instanceof fabric.ActiveSelection)) return;

    const group = new fabric.Group(activeObj.getObjects(), {
      id: "group_" + Date.now(),
      name: "Group Layer",
    } as any);

    applyNeoBrutalistControls(group);
    this.canvas.remove(...activeObj.getObjects());
    this.canvas.add(group);
    this.canvas.setActiveObject(group);
    this.canvas.requestRenderAll();

    this.syncLayersToStore();
    this.saveHistoryState();
  }

  public ungroupSelected() {
    if (!this.canvas) return;
    const activeObj = this.canvas.getActiveObject();
    if (!(activeObj instanceof fabric.Group)) return;

    const objects = activeObj.removeAll();
    this.canvas.remove(activeObj);
    this.canvas.add(...objects);

    const sel = new fabric.ActiveSelection(objects, { canvas: this.canvas });
    this.canvas.setActiveObject(sel);
    this.canvas.requestRenderAll();

    this.syncLayersToStore();
    this.saveHistoryState();
  }

  // --- Alignment Tools ---

  public alignSelected(type: "left" | "center" | "right" | "top" | "middle" | "bottom") {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (!active) return;

    const canvasWidth = this.canvas.width || 0;
    const canvasHeight = this.canvas.height || 0;
    const bound = active.getBoundingRect();

    switch (type) {
      case "left":
        active.set({ left: active.left - bound.left });
        break;
      case "center":
        active.set({ left: active.left + (canvasWidth / 2 - (bound.left + bound.width / 2)) });
        break;
      case "right":
        active.set({ left: active.left + (canvasWidth - (bound.left + bound.width)) });
        break;
      case "top":
        active.set({ top: active.top - bound.top });
        break;
      case "middle":
        active.set({ top: active.top + (canvasHeight / 2 - (bound.top + bound.height / 2)) });
        break;
      case "bottom":
        active.set({ top: active.top + (canvasHeight - (bound.top + bound.height)) });
        break;
    }

    active.setCoords();
    this.canvas.requestRenderAll();
    this.saveHistoryState();
  }

  // --- Nudge with Arrow Keys ---

  public nudgeSelected(dx: number, dy: number) {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (!active || active.lockMovementX) return;

    active.set({
      left: (active.left || 0) + dx,
      top: (active.top || 0) + dy,
    });

    active.setCoords();
    this.canvas.requestRenderAll();
    this.saveHistoryState();
  }

  // --- Export Actions ---

  public exportImage(format: "png" | "jpeg" | "webp" = "png", multiplier = 1, quality = 0.95): string {
    if (!this.canvas) return "";
    this.canvas.discardActiveObject();
    this.snappingManager?.clearGuides();
    this.canvas.requestRenderAll();

    return this.canvas.toDataURL({
      format,
      multiplier,
      quality,
    });
  }

  public destroy() {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }
}

export const fabricAdapter = new FabricAdapter();
