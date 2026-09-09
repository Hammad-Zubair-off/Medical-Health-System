# File Manager (Cloudinary + Firestore)

## Architecture

- **Assets** live in **Cloudinary** (folder `medical-health-system`).
- **Metadata** lives in Firestore `FileObject` / `FileFolder`.
- Browser uploads with an **unsigned upload preset** — no Cloud Functions, no Blaze, no card.
- Firebase Storage stays **default-deny** (`storage.rules`).

Upload flow:

1. Client UX pre-check (type/size/quota) — cosmetic only
2. `XMLHttpRequest` POST to Cloudinary (`file` + `upload_preset` only)
3. On HTTP 200 → `addDoc(FileObject)` with `withAudit`

## Accepted security risks (§0)

### 1. Anyone can upload into your Cloudinary folder

The cloud name and unsigned preset ship in the JS bundle. A stranger can `curl` uploads into the locked folder. They **cannot** read existing files, delete them, or see Firestore metadata. Mitigations: folder lock + format/size caps **in Cloudinary**, usage alert, 2-minute preset rotation. Orphaned uploads never appear in-app without a Firestore doc.

### 2. A leaked file URL works forever

Delivery URLs are public. Random `public_id`s make guessing hard, but a forwarded URL cannot be revoked except by deleting the Cloudinary asset. Firestore rules only gate **in-app** visibility.

**Upgrade path:** one small serverless function holding `CLOUDINARY_API_SECRET`, verifying Firebase ID tokens, issuing signed upload signatures / short-TTL delivery URLs. Change only `cloudinary.service.ts` and `useFileUpload.ts` — `publicId` is already stored (no schema migration).

## Env (public by design)

```
VITE_CLOUDINARY_CLOUD_NAME=…
VITE_CLOUDINARY_UPLOAD_PRESET=medical_files_unsigned
```

**Never** add `VITE_CLOUDINARY_API_SECRET` or `VITE_CLOUDINARY_API_KEY`.

## Limits

| Limit | Value |
|---|---|
| Max file size | 10 MB (Cloudinary preset; client mirrors for UX) |
| Formats | pdf, jpg, jpeg, png, webp, docx |
| Soft quota / user | 200 MB (advisory in-app) |

## Soft delete

In-app delete sets `status: "deleted"`. The Cloudinary asset remains until purged from the Media Library (API secret required). Users should know “delete” hides the file in the app but does not erase the blob.

## Rotate the preset (abuse)

1. Cloudinary → Settings → Upload → delete `medical_files_unsigned`
2. Recreate with the same settings under a new name
3. Update `VITE_CLOUDINARY_UPLOAD_PRESET` and redeploy

Existing files are unaffected.

## Routes

- `/application/file-manager`
- `/application/file-manager/folder/:folderId`

Doctor and patient sidebars expose File Manager. Appointment detail pages include an Attachments panel (`FileObject.appointmentId` + auto `sharedWith`).
