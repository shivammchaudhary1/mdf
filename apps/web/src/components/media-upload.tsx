"use client";
import { useState } from "react";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/toast-provider";
export type UploadedMedia = {
  id: string;
  kind: "image" | "document";
  urls: Record<string, string>;
};
export function MediaUpload({
  onUploaded,
  document = false,
}: {
  onUploaded: (media: UploadedMedia) => void;
  document?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const toast = useToast();
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {pending
        ? "Uploading and optimising…"
        : document
          ? "Upload a PDF (up to 10 MB)"
          : "Upload a photo (JPEG, PNG or WebP, up to 10 MB)"}
      <input
        className="field text-sm"
        type="file"
        accept={
          document ? "application/pdf" : "image/jpeg,image/png,image/webp"
        }
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
            const form = new FormData();
            form.append("file", file);
            const media = await api<UploadedMedia>("/media", {
              method: "POST",
              body: form,
            });
            onUploaded(media);
            toast.success("Upload complete.");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Upload failed.",
            );
          } finally {
            setPending(false);
            input.value = "";
          }
        }}
      />
    </label>
  );
}
