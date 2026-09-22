"use client";

import { useEffect, useState } from "react";

import { useMemberData } from "@/components/member-data";
import { SiteMedia } from "@/components/site/site-media";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-provider";
import { runtimeConfig } from "@/config/runtime";
import { api } from "@/services/api";
import { type UploadedMediaResult, uploadMedia } from "@/services/workspace";

function absoluteMediaUrl(value?: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const origin = runtimeConfig.apiUrl.replace(/\/api\/v1\/?$/, "");
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`;
}

function validYoutubeUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com");
  } catch {
    return false;
  }
}

export function MemberPortfolioSection() {
  const { data, profile, refresh } = useMemberData();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [introVideo, setIntroVideo] = useState(profile.showreel ?? "");

  useEffect(() => {
    setIntroVideo(profile.showreel ?? "");
  }, [profile.showreel]);

  async function cleanupUploads(items: UploadedMediaResult[]) {
    await Promise.all(
      items.filter((item) => !item.duplicate).map((item) => api(`/media/${item.id}`, { method: "DELETE" }).catch(() => undefined)),
    );
  }

  async function removePhoto() {
    if (!removing || busy) return;
    setBusy(true);

    try {
      await api("/member/profile", {
        method: "PUT",
        body: JSON.stringify({
          portfolioMediaIds: (profile.portfolioMediaIds ?? []).filter((id) => id !== removing),
        }),
      });

      await refresh();
      setRemoving(null);
      toast.success("Photograph removed from portfolio.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove photograph.");
    } finally {
      setBusy(false);
    }
  }

  function choosePhotos() {
    if (busy) return;

    const current = profile.portfolioMediaIds ?? [];
    const available = 8 - current.length;

    if (available <= 0) {
      toast.info("Your portfolio can contain a maximum of 8 photographs.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/jpeg,image/png,image/webp";

    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (!files.length) return;

      if (files.length > available) {
        toast.info(`You can add ${available} more photograph${available === 1 ? "" : "s"}.`);
        return;
      }

      setBusy(true);
      const uploaded: UploadedMediaResult[] = [];

      try {
        for (const file of files) {
          uploaded.push(await uploadMedia(file, "member-portfolio"));
        }

        const next = [...new Set([...current, ...uploaded.map((item) => item.id)])];

        if (next.length > 8) {
          throw new Error("Your portfolio can contain a maximum of 8 photographs.");
        }

        await api("/member/profile", {
          method: "PUT",
          body: JSON.stringify({ portfolioMediaIds: next }),
        });

        await refresh();
        toast.success(`${files.length} photograph${files.length === 1 ? "" : "s"} added.`);
      } catch (error) {
        await cleanupUploads(uploaded);
        toast.error(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setBusy(false);
      }
    };

    input.click();
  }

  function chooseResume() {
    if (busy) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setBusy(true);
      let uploaded: UploadedMediaResult | undefined;

      try {
        uploaded = await uploadMedia(file, "member-resume");

        if (uploaded.kind !== "document") {
          throw new Error("Resume must be a PDF document.");
        }

        await api("/member/profile", {
          method: "PUT",
          body: JSON.stringify({ resumeMediaId: uploaded.id }),
        });

        await refresh();
        toast.success(profile.resumeMediaId ? "Resume replaced." : "Resume uploaded.");
      } catch (error) {
        if (uploaded) await cleanupUploads([uploaded]);
        toast.error(error instanceof Error ? error.message : "Resume upload failed.");
      } finally {
        setBusy(false);
      }
    };

    input.click();
  }

  async function removeResume() {
    if (!profile.resumeMediaId || busy) return;
    setBusy(true);

    try {
      await api("/member/profile", {
        method: "PUT",
        body: JSON.stringify({ resumeMediaId: null }),
      });

      await refresh();
      toast.success("Resume removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove resume.");
    } finally {
      setBusy(false);
    }
  }

  async function saveIntroVideo(nextValue = introVideo) {
    const value = nextValue.trim();

    if (value && !validYoutubeUrl(value)) {
      toast.error("Intro / pitch video must be a valid YouTube URL.");
      return;
    }

    setBusy(true);

    try {
      await api("/member/profile", {
        method: "PUT",
        body: JSON.stringify({ showreel: value || null }),
      });

      await refresh();
      setIntroVideo(value);
      toast.success(value ? "Intro / pitch video saved." : "Intro / pitch video removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save intro / pitch video.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="md-stack">
      <section className="md-page-header">
        <div>
          <p>Your work</p>
          <h1>My Portfolio</h1>
          <span>Curate the photographs, intro / pitch video and material that represent your creative identity.</span>
        </div>

        <button className="md-primary" disabled={busy || (profile.portfolioMediaIds?.length ?? 0) >= 8} onClick={choosePhotos}>
          + Add Photos
        </button>
      </section>

      <section className="md-portfolio-hero">
        <div>
          <p className="md-kicker">Portfolio health</p>
          <h2>Keep your casting material current.</h2>
          <span>Use strong recent photographs, a current intro / pitch video and an updated PDF resume.</span>
        </div>

        <div>
          <strong>{data.portfolio.length}</strong>
          <span>photos</span>
        </div>
      </section>

      <article className="md-card">
        <div className="md-card-head">
          <div>
            <p className="md-kicker">Photographs</p>
            <h2>Portfolio Gallery</h2>
          </div>
          <span>{data.portfolio.length}/8 photographs</span>
        </div>

        <div className="md-portfolio-grid">
          {data.portfolio.map((item) => (
            <div key={item.id} className="md-portfolio-item">
              <SiteMedia src={item.image} alt={item.title} kind="gallery" className="aspect-[4/5] rounded-xl" />
              <p>
                {item.title}
                <span>{item.category}</span>
              </p>
              <button type="button" onClick={() => setRemoving(item.id)} disabled={busy} aria-label={`Remove ${item.title}`}>
                ×
              </button>
            </div>
          ))}

          <button className="md-add-photo" disabled={busy || (profile.portfolioMediaIds?.length ?? 0) >= 8} onClick={choosePhotos}>
            <strong>{(profile.portfolioMediaIds?.length ?? 0) >= 8 ? "Maximum 8 photos" : "Add Photograph"}</strong>
            <span>JPG / PNG / WebP · up to 10 MB each</span>
          </button>
        </div>
      </article>

      <section className="md-media-grid">
        <article className="md-card">
          <p className="md-kicker">Video</p>
          <h2>Intro Video / Pitch Video</h2>
          <p className="md-video-help">Upload your intro or pitch video to YouTube first, then paste the YouTube video link here.</p>

          <div className="md-field md-media-editor">
            <span>YouTube intro / pitch video URL</span>
            <input
              type="url"
              value={introVideo}
              onChange={(event) => setIntroVideo(event.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              disabled={busy}
            />

            <div className="md-save-row">
              {profile.showreel && (
                <a className="md-secondary" href={profile.showreel} target="_blank" rel="noreferrer">
                  Open Video
                </a>
              )}

              {profile.showreel && (
                <button
                  className="md-secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setIntroVideo("");
                    void saveIntroVideo("");
                  }}
                >
                  Remove
                </button>
              )}

              <button className="md-primary" type="button" disabled={busy} onClick={() => void saveIntroVideo()}>
                {profile.showreel ? "Update Link" : "Save Link"}
              </button>
            </div>
          </div>
        </article>

        <article className="md-card">
          <p className="md-kicker">Document</p>
          <h2>Resume / CV</h2>

          <div className="md-empty-media">
            <strong>{profile.resume ? "Resume uploaded" : "No resume uploaded"}</strong>
            <span>PDF · up to 10 MB</span>

            <div className="md-save-row">
              {profile.resume && (
                <a className="md-secondary" href={absoluteMediaUrl(profile.resume)} target="_blank" rel="noreferrer">
                  Download Resume
                </a>
              )}

              <button className="md-primary" type="button" disabled={busy} onClick={chooseResume}>
                {profile.resume ? "Replace Resume" : "Upload Resume"}
              </button>

              {profile.resume && (
                <button className="md-secondary" type="button" disabled={busy} onClick={() => void removeResume()}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </article>
      </section>

      <ConfirmDialog
        open={!!removing}
        title="Remove this photograph?"
        description="It will be removed from your portfolio. Any other valid reference to the media is preserved."
        confirmLabel="Remove"
        destructive
        loading={busy}
        onConfirm={() => void removePhoto()}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
