/**
 * LOLCanvas Image Optimization Utility
 * 
 * Compresses images for lightning-fast website and template card loading,
 * while preserving the original full-resolution image for high-quality downloads.
 */

export interface OptimizedImageResult {
  previewDataUri: string; // Fast compressed web preview (720px WebP/JPEG, ~40KB-90KB)
  originalDataUri: string; // Original full-resolution image (real uncompressed size)
  width: number;
  height: number;
  originalSizeBytes: number;
  previewSizeBytes: number;
}

/**
 * Resizes an image file, blob, or base64 string to a crisp, lightweight web preview
 * while preserving the uncompressed original for full-size PNG export.
 */
export async function processImageForWeb(
  input: File | Blob | string,
  maxDimension = 720,
  quality = 0.85
): Promise<OptimizedImageResult> {
  let originalDataUri = "";
  let originalSizeBytes = 0;

  // 1. Obtain original data URI
  if (typeof input === "string") {
    originalDataUri = input;
    originalSizeBytes = Math.round((input.length * 3) / 4);
  } else {
    originalSizeBytes = input.size;
    originalDataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(input);
    });
  }

  // 2. Load into HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(new Error("Failed to load image for optimization: " + err));
    image.src = originalDataUri;
  });

  const originalWidth = img.naturalWidth || 1080;
  const originalHeight = img.naturalHeight || 1080;

  // If the image is already small (under 150KB and under maxDimension), no need to compress
  if (originalSizeBytes < 150 * 1024 && originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return {
      previewDataUri: originalDataUri,
      originalDataUri,
      width: originalWidth,
      height: originalHeight,
      originalSizeBytes,
      previewSizeBytes: originalSizeBytes,
    };
  }

  // 3. Calculate aspect-ratio preserved dimensions
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth >= targetHeight) {
      targetHeight = Math.round((originalHeight / originalWidth) * maxDimension);
      targetWidth = maxDimension;
    } else {
      targetWidth = Math.round((originalWidth / originalHeight) * maxDimension);
      targetHeight = maxDimension;
    }
  }

  // 4. Draw to Offscreen Canvas for high-quality downsampling
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return {
      previewDataUri: originalDataUri,
      originalDataUri,
      width: originalWidth,
      height: originalHeight,
      originalSizeBytes,
      previewSizeBytes: originalSizeBytes,
    };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // 5. Encode preview as WebP (or fallback to JPEG if WebP is unsupported)
  let previewDataUri = canvas.toDataURL("image/webp", quality);
  if (!previewDataUri.startsWith("data:image/webp")) {
    previewDataUri = canvas.toDataURL("image/jpeg", quality);
  }

  const previewSizeBytes = Math.round((previewDataUri.length * 3) / 4);

  return {
    previewDataUri,
    originalDataUri,
    width: originalWidth,
    height: originalHeight,
    originalSizeBytes,
    previewSizeBytes,
  };
}
