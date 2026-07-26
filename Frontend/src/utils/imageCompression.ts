/**
 * Client-side image compression, run in the browser before a file is ever
 * sent over the network (or stuffed into localStorage). Resizes the image
 * down to a max dimension and re-encodes it as JPEG at a given quality
 * using a <canvas>. Falls back to the original file if anything goes wrong
 * (e.g. SVGs, GIFs, or a browser that struggles with canvas export) so a
 * failed compression never blocks the actual upload.
 */

export interface CompressImageOptions {
  /** Longest side (width or height) the output image is capped at. */
  maxDimension?: number;
  /** JPEG quality, 0–1. */
  quality?: number;
  /** Skip compression entirely if the file is already under this size. */
  skipIfUnderBytes?: number;
}

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
  maxDimension: 1600,
  quality: 0.8,
  skipIfUnderBytes: 300 * 1024, // 300KB
};

// Formats where re-encoding to JPEG would lose something important
// (transparency, animation) or gain nothing (already compressed vector).
const SKIP_TYPES = new Set(["image/svg+xml", "image/gif"]);

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't load image for compression."));
    };
    img.src = url;
  });

const canvasToFile = (canvas: HTMLCanvasElement, fileName: string, quality: number): Promise<File> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed."));
          return;
        }
        const jpgName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
        resolve(new File([blob], jpgName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      quality
    );
  });

/**
 * Compress an image File. Always resolves — returns the original file
 * untouched if compression isn't applicable or fails for any reason.
 */
export const compressImage = async (
  file: File,
  options: CompressImageOptions = {}
): Promise<File> => {
  const { maxDimension, quality, skipIfUnderBytes } = { ...DEFAULT_OPTIONS, ...options };

  if (SKIP_TYPES.has(file.type) || !file.type.startsWith("image/")) {
    return file;
  }
  if (file.size <= skipIfUnderBytes) {
    return file;
  }

  try {
    const img = await loadImage(file);

    let { width, height } = img;
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height / width) * maxDimension);
        width = maxDimension;
      } else {
        width = Math.round((width / height) * maxDimension);
        height = maxDimension;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);

    const compressed = await canvasToFile(canvas, file.name, quality);

    // Only use the compressed version if it's actually smaller.
    return compressed.size < file.size ? compressed : file;
  } catch {
    return file;
  }
};

/** Compress a batch of files in parallel. */
export const compressImages = (files: File[], options?: CompressImageOptions): Promise<File[]> =>
  Promise.all(files.map((file) => compressImage(file, options)));
