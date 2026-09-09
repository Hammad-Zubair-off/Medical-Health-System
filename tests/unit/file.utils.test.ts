import { describe, expect, it } from "vitest";
import {
  extensionOf,
  formatBytes,
  isPreviewable,
  resourceTypeFor,
  validateUploadClientSide,
} from "../../src/core/utils/file.utils";

describe("file.utils", () => {
  it("maps image extensions to image resource type", () => {
    expect(resourceTypeFor("photo.JPG")).toBe("image");
    expect(resourceTypeFor("a.png")).toBe("image");
    expect(resourceTypeFor("x.webp")).toBe("image");
  });

  it("maps pdf/docx to raw", () => {
    expect(resourceTypeFor("report.pdf")).toBe("raw");
    expect(resourceTypeFor("note.docx")).toBe("raw");
  });

  it("formats bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("previewable images and pdf", () => {
    expect(isPreviewable("jpg", "image")).toBe(true);
    expect(isPreviewable("pdf", "raw")).toBe(true);
    expect(isPreviewable("docx", "raw")).toBe(false);
  });

  it("client-side validation rejects exe and oversized", () => {
    const exe = new File([new Uint8Array(10)], "bad.exe", {
      type: "application/octet-stream",
    });
    expect(validateUploadClientSide(exe)).toMatch(/Unsupported/i);

    const big = new File([new Uint8Array(11 * 1024 * 1024)], "big.pdf", {
      type: "application/pdf",
    });
    expect(validateUploadClientSide(big)).toMatch(/exceeds/i);

    const ok = new File([new Uint8Array(100)], "ok.pdf", {
      type: "application/pdf",
    });
    expect(validateUploadClientSide(ok)).toBeNull();
  });

  it("extensionOf", () => {
    expect(extensionOf("a.B.Pdf")).toBe("pdf");
    expect(extensionOf("noext")).toBe("");
  });
});
