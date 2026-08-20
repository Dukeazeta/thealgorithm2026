import {
  MAX_IMAGE_EDGE,
  MAX_SOURCE_IMAGE_BYTES,
  MAX_UPLOAD_IMAGE_BYTES,
  SOURCE_IMAGE_TYPES,
} from "@/lib/contribution";

const SOURCE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

export function createClientFileId() {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export function validateSourceImage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (
    !SOURCE_IMAGE_TYPES.includes(
      file.type.toLowerCase() as (typeof SOURCE_IMAGE_TYPES)[number],
    ) &&
    !SOURCE_EXTENSIONS.includes(extension)
  ) {
    return `${file.name} is not a JPEG, PNG, WebP, HEIC, or HEIF image.`;
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    return `${file.name} is larger than 25 MB.`;
  }
  return null;
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  type: "image/webp" | "image/jpeg",
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

async function decodeRaster(blob: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.src = url;
  await image.decode();
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    close: () => URL.revokeObjectURL(url),
  };
}

async function decodeImage(file: File): Promise<DecodedImage> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    extension === "heic" ||
    extension === "heif";

  if (isHeic) {
    const { heicTo } = await import("heic-to/next");
    const converted = await heicTo({ blob: file, type: "image/jpeg", quality: 1 });
    return decodeRaster(converted);
  }
  return decodeRaster(file);
}

export async function optimizeContributionImage(file: File) {
  const bitmap = await decodeImage(file);
  try {
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("This browser cannot prepare the photo.");
    context.drawImage(bitmap.source, 0, 0, canvas.width, canvas.height);

    let blob = await canvasBlob(canvas, "image/webp", 0.84);
    if (blob?.type === "image/webp" && blob.size > MAX_UPLOAD_IMAGE_BYTES) {
      blob = await canvasBlob(canvas, "image/webp", 0.72);
    }

    let extension: "webp" | "jpg" = "webp";
    if (!blob || blob.type !== "image/webp" || blob.size > MAX_UPLOAD_IMAGE_BYTES) {
      blob = await canvasBlob(canvas, "image/jpeg", 0.86);
      extension = "jpg";
    }
    if (!blob || blob.size > MAX_UPLOAD_IMAGE_BYTES) {
      throw new Error(`${file.name} is still over 10 MB after optimization.`);
    }

    const basename = file.name.replace(/\.[^.]+$/, "").slice(0, 180) || "photo";
    return {
      file: new File([blob], `${basename}.${extension}`, {
        type: blob.type,
        lastModified: Date.now(),
      }),
      extension,
    };
  } finally {
    bitmap.close();
  }
}
