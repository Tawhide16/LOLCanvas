import * as fabric from "fabric";

const SNAP_THRESHOLD = 8;
const GUIDE_COLOR = "#E11D48"; // Neo-brutalist vibrant pink/red guide
const GUIDE_LINE_WIDTH = 1.5;

export interface GuideLine {
  type: "vertical" | "horizontal";
  position: number;
}

export class SnappingManager {
  private canvas: fabric.Canvas;
  private activeGuides: fabric.Line[] = [];

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  public handleObjectMoving(target: fabric.FabricObject) {
    this.clearGuides();

    const canvasWidth = this.canvas.width || 0;
    const canvasHeight = this.canvas.height || 0;

    const bound = target.getBoundingRect();
    const targetCenterX = bound.left + bound.width / 2;
    const targetCenterY = bound.top + bound.height / 2;

    const vSnapPoints = [
      0, // Canvas Left
      canvasWidth / 2, // Canvas Center X
      canvasWidth, // Canvas Right
    ];

    const hSnapPoints = [
      0, // Canvas Top
      canvasHeight / 2, // Canvas Center Y
      canvasHeight, // Canvas Bottom
    ];

    // Collect snap points from other objects
    const objects = this.canvas.getObjects().filter((obj) => obj !== target && obj.visible !== false);
    for (const obj of objects) {
      const objBound = obj.getBoundingRect();
      vSnapPoints.push(objBound.left);
      vSnapPoints.push(objBound.left + objBound.width / 2);
      vSnapPoints.push(objBound.left + objBound.width);

      hSnapPoints.push(objBound.top);
      hSnapPoints.push(objBound.top + objBound.height / 2);
      hSnapPoints.push(objBound.top + objBound.height);
    }

    // 1. Check Horizontal snapping (vertical lines)
    let snappedX = false;
    for (const snapX of vSnapPoints) {
      // Center to snapX
      if (Math.abs(targetCenterX - snapX) < SNAP_THRESHOLD) {
        target.set({ left: target.left + (snapX - targetCenterX) });
        this.drawVerticalGuide(snapX);
        snappedX = true;
        break;
      }
      // Left edge to snapX
      if (Math.abs(bound.left - snapX) < SNAP_THRESHOLD) {
        target.set({ left: target.left + (snapX - bound.left) });
        this.drawVerticalGuide(snapX);
        snappedX = true;
        break;
      }
      // Right edge to snapX
      if (Math.abs(bound.left + bound.width - snapX) < SNAP_THRESHOLD) {
        target.set({ left: target.left + (snapX - (bound.left + bound.width)) });
        this.drawVerticalGuide(snapX);
        snappedX = true;
        break;
      }
    }

    // 2. Check Vertical snapping (horizontal lines)
    let snappedY = false;
    for (const snapY of hSnapPoints) {
      // Center to snapY
      if (Math.abs(targetCenterY - snapY) < SNAP_THRESHOLD) {
        target.set({ top: target.top + (snapY - targetCenterY) });
        this.drawHorizontalGuide(snapY);
        snappedY = true;
        break;
      }
      // Top edge to snapY
      if (Math.abs(bound.top - snapY) < SNAP_THRESHOLD) {
        target.set({ top: target.top + (snapY - bound.top) });
        this.drawHorizontalGuide(snapY);
        snappedY = true;
        break;
      }
      // Bottom edge to snapY
      if (Math.abs(bound.top + bound.height - snapY) < SNAP_THRESHOLD) {
        target.set({ top: target.top + (snapY - (bound.top + bound.height)) });
        this.drawHorizontalGuide(snapY);
        snappedY = true;
        break;
      }
    }

    if (snappedX || snappedY) {
      target.setCoords();
      this.canvas.requestRenderAll();
    }
  }

  private drawVerticalGuide(x: number) {
    const line = new fabric.Line([x, 0, x, this.canvas.height || 0], {
      stroke: GUIDE_COLOR,
      strokeWidth: GUIDE_LINE_WIDTH,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      excludeFromExport: true,
    } as any);
    this.canvas.add(line);
    this.activeGuides.push(line);
  }

  private drawHorizontalGuide(y: number) {
    const line = new fabric.Line([0, y, this.canvas.width || 0, y], {
      stroke: GUIDE_COLOR,
      strokeWidth: GUIDE_LINE_WIDTH,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      excludeFromExport: true,
    } as any);
    this.canvas.add(line);
    this.activeGuides.push(line);
  }

  public clearGuides() {
    if (this.activeGuides.length === 0) return;
    for (const line of this.activeGuides) {
      this.canvas.remove(line);
    }
    this.activeGuides = [];
    this.canvas.requestRenderAll();
  }
}
