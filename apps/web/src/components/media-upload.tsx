"use client";
import { useState } from "react";

import { useToast } from "@/components/ui/toast-provider";
import { type MediaPurpose, type UploadedMediaResult, uploadMedia } from "@/services/workspace";

export type UploadedMedia = UploadedMediaResult;

export function MediaUpload({
  onUploaded,
  purpose,
  document = false,
}: {
  onUploaded: (media: UploadedMedia) => void;
  purpose: MediaPurpose;
  document?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const toast = useToast();
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {pending ? "Uploading and optimising…" : document ? "Upload a PDF (up to 10 MB)" : "Upload a photo (JPEG, PNG or WebP, up to 10 MB)"}
      <input
        className="field text-sm"
        type="file"
        accept={document ? "application/pdf" : "image/jpeg,image/png,image/webp"}
        disabled={pending}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const input = event.target;
          if (file.size > 10 * 1024 * 1024) {
            toast.error("Choose a file up to 10 MB.");
            input.value = "";
            return;
          }
          setPending(true);
          try {
            const media = await uploadMedia(file, purpose);
            onUploaded(media);
            toast.success(media.duplicate ? "This file was already uploaded." : "Upload complete.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed.");
          } finally {
            setPending(false);
            input.value = "";
          }
        }}
      />
    </label>
  );
}
