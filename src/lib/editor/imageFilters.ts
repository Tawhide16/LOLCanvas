import * as fabric from "fabric";

export interface ImageFilterValues {
  brightness: number; // -1 to 1 (default 0)
  contrast: number; // -1 to 1 (default 0)
  saturation: number; // -1 to 1 (default 0)
  blur: number; // 0 to 1 (default 0)
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  isDeepFried: boolean;
}

export function applyImageFilters(img: fabric.FabricImage, values: Partial<ImageFilterValues>) {
  img.filters = [];

  // 1. Grayscale
  if (values.grayscale) {
    img.filters.push(new fabric.filters.Grayscale());
  }

  // 2. Sepia
  if (values.sepia) {
    img.filters.push(new fabric.filters.Sepia());
  }

  // 3. Invert
  if (values.invert) {
    img.filters.push(new fabric.filters.Invert());
  }

  // 4. Deep Fry Meme Effect (extreme saturation + extreme contrast + noise)
  if (values.isDeepFried) {
    img.filters.push(new fabric.filters.Saturation({ saturation: 2.2 }));
    img.filters.push(new fabric.filters.Contrast({ contrast: 0.9 }));
    img.filters.push(new fabric.filters.Noise({ noise: 120 }));
    img.filters.push(new fabric.filters.Brightness({ brightness: 0.15 }));
  } else {
    // Standard Brightness
    if (values.brightness !== undefined && values.brightness !== 0) {
      img.filters.push(new fabric.filters.Brightness({ brightness: values.brightness }));
    }

    // Standard Contrast
    if (values.contrast !== undefined && values.contrast !== 0) {
      img.filters.push(new fabric.filters.Contrast({ contrast: values.contrast }));
    }

    // Standard Saturation
    if (values.saturation !== undefined && values.saturation !== 0) {
      img.filters.push(new fabric.filters.Saturation({ saturation: values.saturation }));
    }
  }

  // 5. Blur
  if (values.blur !== undefined && values.blur > 0) {
    img.filters.push(new fabric.filters.Blur({ blur: values.blur }));
  }

  img.applyFilters();
}

/**
 * Client-side Chroma Key / Background Color Removal
 * Removes pixels matching the sample color within a tolerance threshold
 */
export async function removeColorBackground(
  img: fabric.FabricImage,
  targetColor = "#FFFFFF",
  threshold = 30
): Promise<void> {
  const filter = new fabric.filters.RemoveColor({
    color: targetColor,
    distance: threshold / 100,
  });

  img.filters.push(filter);
  img.applyFilters();
}
