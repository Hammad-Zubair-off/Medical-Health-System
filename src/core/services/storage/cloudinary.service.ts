import { env } from "../../config/env";
import { resourceTypeFor } from "../../utils/file.utils";

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "raw" | "video";
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  originalFilename: string;
};

export type UploadToCloudinaryOptions = {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

function cloudinaryBase(): string {
  return `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}`;
}

function deliveryBase(): string {
  return `https://res.cloudinary.com/${env.cloudinary.cloudName}`;
}

/**
 * Upload via unsigned preset.
 * Uses XMLHttpRequest so we can report upload progress (fetch cannot).
 * FormData must only include `file` + `upload_preset` — unsigned presets reject
 * most extra parameters; folder/public_id are fixed by the preset.
 */
export function uploadToCloudinary(
  file: File,
  options: UploadToCloudinaryOptions = {}
): Promise<CloudinaryUploadResult> {
  const resourceType = resourceTypeFor(file.name);
  const url = `${cloudinaryBase()}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    const onAbort = () => {
      xhr.abort();
      reject(new DOMException("Upload cancelled", "AbortError"));
    };
    if (options.signal) {
      if (options.signal.aborted) {
        onAbort();
        return;
      }
      options.signal.addEventListener("abort", onAbort, { once: true });
    }

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable || !options.onProgress) return;
      options.onProgress(Math.round((evt.loaded / evt.total) * 100));
    };

    xhr.onload = () => {
      options.signal?.removeEventListener("abort", onAbort);
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          publicId: String(body.public_id ?? ""),
          secureUrl: String(body.secure_url ?? ""),
          resourceType: (body.resource_type as CloudinaryUploadResult["resourceType"]) || resourceType,
          format: String(body.format ?? ""),
          bytes: Number(body.bytes ?? file.size) || file.size,
          width: typeof body.width === "number" ? body.width : null,
          height: typeof body.height === "number" ? body.height : null,
          originalFilename: String(body.original_filename ?? file.name),
        });
        return;
      }
      const message =
        typeof body.error === "object" &&
        body.error &&
        "message" in (body.error as object)
          ? String((body.error as { message: string }).message)
          : `Cloudinary upload failed (${xhr.status})`;
      reject(new Error(message));
    };

    xhr.onerror = () => {
      options.signal?.removeEventListener("abort", onAbort);
      reject(new Error("Network error during Cloudinary upload"));
    };

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", env.cloudinary.uploadPreset);
    xhr.send(form);
  });
}

/** Thumbnail transform — always use this in grids, never the full original. */
export function thumbnailUrl(publicId: string, w = 160, h = 160): string {
  const id = publicId.replace(/^\/+/, "");
  return `${deliveryBase()}/image/upload/c_fill,w_${w},h_${h},q_auto,f_auto/${id}`;
}

/** Force download rather than inline render. */
export function downloadUrl(publicId: string, fileName: string): string {
  const id = publicId.replace(/^\/+/, "");
  const safe = encodeURIComponent(fileName || "download");
  const resourceType = resourceTypeFor(fileName);
  return `${deliveryBase()}/${resourceType}/upload/fl_attachment:${safe}/${id}`;
}

/** Direct delivery URL builder (images/raw). Prefer stored secureUrl for display. */
export function deliveryUrl(
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image"
): string {
  const id = publicId.replace(/^\/+/, "");
  return `${deliveryBase()}/${resourceType}/upload/${id}`;
}
