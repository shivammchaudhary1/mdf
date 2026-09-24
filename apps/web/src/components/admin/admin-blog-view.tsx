"use client";

import { type ChangeEvent, type FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminDialog, AdminDialogActions, AdminDialogForm, AdminDialogGrid, AdminFormField } from "@/components/admin/admin-dialog";
import { AdminRichTextEditor } from "@/components/admin/admin-rich-text-editor";
import { AdminCollectionState, AdminFilters, AdminPageHeader, AdminPrimaryButton, AdminSearch, AdminStatus } from "@/components/admin/admin-shared";
import { SiteMedia } from "@/components/site/site-media";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useToast } from "@/components/ui/toast-provider";
import { api } from "@/services/api";
import { dateLabel, uploadMedia } from "@/services/workspace";
import { useAppStore } from "@/store/app-store";

import { useAdminRecords } from "./use-admin-records";

const CATEGORY_OPTIONS = [
  "Filmmaking",
  "Production",
  "Casting",
  "Cinematography",
  "Post-Production",
  "Industry",
  "News",
  "Other",
] as const;

const TAG_OPTIONS = [
  "Featured",
  "Filmmaking",
  "Production",
  "Casting",
  "Cinematography",
  "Editing",
  "Sound",
  "Lighting",
  "Actors",
  "Industry",
  "News",
] as const;

type BlogSource = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  description?: string;
  body?: string[];
  coverMediaId?: string;
  coverImage?: string;
  status?: string;
  published: boolean;
  publishedAt?: string;
  order?: number;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  data?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

type BlogItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  body: string[];
  coverMediaId?: string;
  image: string;
  status: string;
  published: boolean;
  publishedAt: string;
  order: number;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  author: string;
  publishedBy: string;
  imageAlt: string;
  readTime: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type BlogSummary = {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  featured: number;
};

function mapBlog(item: BlogSource): BlogItem {
  return {
    id: item._id,
    title: item.title,
    slug: item.slug,
    category: item.category ?? "Other",
    description: item.description ?? "",
    body: item.body ?? [],
    coverMediaId: item.coverMediaId,
    image: item.coverImage ?? "",
    status: item.status ?? (item.published ? "Published" : "Draft"),
    published: item.published,
    publishedAt: item.publishedAt ?? "",
    order: item.order ?? 0,
    tags: item.tags ?? [],
    seoTitle: item.seoTitle ?? "",
    seoDescription: item.seoDescription ?? "",
    author: item.data?.author ?? "M. Dadu Films",
    publishedBy: item.data?.publishedBy ?? "M. Dadu Films Editorial",
    imageAlt: item.data?.imageAlt ?? "",
    readTime: item.data?.readTime ?? "",
    featured: item.data?.featured === "true" || (item.tags ?? []).includes("Featured"),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function cleanSlug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 150) || "blog-post"
  );
}

function dateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function plainText(blocks: string[]) {
  if (typeof document === "undefined") return blocks.join(" ").replace(/<[^>]+>/g, " ");
  const node = document.createElement("div");
  node.innerHTML = blocks.join("");
  return node.textContent ?? "";
}

function readTimeFor(blocks: string[]) {
  const words = plainText(blocks).trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function uniqueTags(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, all) => all.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)
    .slice(0, 20);
}

function CoverPreview({ file, existing, alt }: { file: File | null; existing?: string; alt: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }

    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  if (url) {
    return (
      <div
        className="ad-blog-local-cover-v1"
        role="img"
        aria-label={alt || "Blog cover preview"}
        style={{ backgroundImage: `url("${url}")` }}
      />
    );
  }

  return <SiteMedia src={existing} alt={alt || "Blog cover preview"} kind="blog" className="aspect-[16/9] rounded-xl" />;
}

function BlogTagPicker({
  tags,
  featured,
  onTags,
  onFeatured,
}: {
  tags: string[];
  featured: boolean;
  onTags: (value: string[]) => void;
  onFeatured: (value: boolean) => void;
}) {
  const [custom, setCustom] = useState("");

  function toggle(tag: string) {
    if (tag === "Featured") {
      onFeatured(!featured);
      return;
    }

    const active = tags.some((value) => value.toLowerCase() === tag.toLowerCase());
    onTags(active ? tags.filter((value) => value.toLowerCase() !== tag.toLowerCase()) : uniqueTags([...tags, tag]));
  }

  function addCustom() {
    const value = custom.trim().slice(0, 100);
    if (!value) return;
    onTags(uniqueTags([...tags, value]));
    setCustom("");
  }

  return (
    <div className="ad-blog-tags-v1">
      <div className="ad-blog-tag-options-v1">
        {TAG_OPTIONS.map((tag) => {
          const active = tag === "Featured" ? featured : tags.some((value) => value.toLowerCase() === tag.toLowerCase());
          return (
            <button type="button" key={tag} className={active ? "active" : ""} onClick={() => toggle(tag)}>
              {active ? "✓ " : "+ "}
              {tag}
            </button>
          );
        })}
      </div>

      <div className="ad-blog-custom-tag-v1">
        <input
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          maxLength={100}
          placeholder="Custom tag / keyword"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" onClick={addCustom}>Add</button>
      </div>

      {!!tags.length && (
        <div className="ad-blog-selected-tags-v1">
          {tags.map((tag) => (
            <button type="button" key={tag} onClick={() => onTags(tags.filter((value) => value !== tag))}>
              {tag} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BlogEditorDialog({
  mode,
  initial,
  open,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: BlogItem;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const toast = useToast();
  const signedInAdminName = useAppStore((state) => state.account?.name ?? "");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("Filmmaking");
  const [author, setAuthor] = useState("M. Dadu Films");
  const [publishedBy, setPublishedBy] = useState("M. Dadu Films Editorial");
  const [status, setStatus] = useState("Draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [body, setBody] = useState<string[]>(["<p><br></p>"]);
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setTitle(initial.title);
      setSlug(initial.slug);
      setSlugTouched(true);
      setCategory(initial.category || "Other");
      setAuthor(initial.author || "M. Dadu Films");
      setPublishedBy(initial.publishedBy || "M. Dadu Films Editorial");
      setStatus(initial.status);
      setScheduledAt(initial.status === "Scheduled" ? dateTimeLocal(initial.publishedAt) : "");
      setTags(initial.tags.filter((tag) => tag !== "Featured"));
      setFeatured(initial.featured);
      setBody(initial.body.length ? initial.body : ["<p><br></p>"]);
      setCover(null);
    } else {
      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setCategory("Filmmaking");
      setAuthor("M. Dadu Films");
      setPublishedBy("M. Dadu Films Editorial");
      setStatus("Draft");
      setScheduledAt("");
      setTags([]);
      setFeatured(false);
      setBody(["<p><br></p>"]);
      setCover(null);
    }
    setSaving(false);
  }, [open, mode, initial]);

  const closeDialog = useCallback(() => {
    if (!saving) onClose();
  }, [saving, onClose]);

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(cleanSlug(value));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = new FormData(event.currentTarget);
    const summary = String(form.get("summary") ?? "").trim();
    const imageAlt = String(form.get("imageAlt") ?? "").trim();
    const seoTitle = String(form.get("seoTitle") ?? "").trim();
    const seoDescription = String(form.get("seoDescription") ?? "").trim();
    const order = Number(form.get("order") ?? 0) || 0;
    const articleText = plainText(body).trim();

    if (!title.trim()) {
      toast.error("Blog title is required.");
      return;
    }
    if (!summary) {
      toast.error("Add a short summary / excerpt.");
      return;
    }
    if (articleText.length < 40) {
      toast.error("Write the article content before saving.");
      return;
    }
    if (status === "Scheduled" && !scheduledAt) {
      toast.error("Choose a future publish date and time.");
      return;
    }

    const finalTags = uniqueTags([
      ...tags.filter((tag) => tag !== "Featured"),
      ...(featured ? ["Featured"] : []),
      ...(category && category !== "Other" ? [category] : []),
    ]);

    let coverMediaId: string | undefined;
    let coverDuplicate = false;
    setSaving(true);

    try {
      if (cover) {
        const uploaded = await uploadMedia(cover, "blog");
        coverMediaId = uploaded.id;
        coverDuplicate = !!uploaded.duplicate;
      }

      const payload = {
        title: title.trim(),
        ...(mode === "create" ? { slug: cleanSlug(slug || title) } : {}),
        category,
        description: summary,
        body,
        ...(coverMediaId ? { coverMediaId } : {}),
        status,
        published: status === "Published" || status === "Scheduled",
        ...(status === "Scheduled"
          ? { publishedAt: new Date(scheduledAt).toISOString() }
          : status === "Draft"
            ? { publishedAt: null }
            : {}),
        order,
        tags: finalTags,
        seoTitle,
        seoDescription,
        data: {
          author: author.trim() || "M. Dadu Films",
          publishedBy: publishedBy.trim() || "M. Dadu Films Editorial",
          imageAlt: imageAlt || title.trim(),
          readTime: readTimeFor(body),
          featured: featured ? "true" : "false",
        },
      };

      await api(mode === "edit" && initial ? `/admin/content/blog/${initial.id}` : "/admin/content/blog", {
        method: mode === "edit" ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      await onSaved();
      toast.success(mode === "edit" ? "Blog post updated." : "Blog post created.");
      onClose();
    } catch (saveError) {
      if (coverMediaId && !coverDuplicate) await api(`/media/${coverMediaId}`, { method: "DELETE" }).catch(() => undefined);
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save blog post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog
      open={open}
      onClose={closeDialog}
      eyebrow={mode === "create" ? "New article" : "Edit article"}
      title={mode === "create" ? "Create Blog Post" : initial?.title ?? "Edit Blog Post"}
      description="Write the article, configure publishing and SEO, and keep the post ready for the future dynamic public blog."
      width="wide"
    >
      <AdminDialogForm onSubmit={submit}>
        <div className="ad-blog-editor-layout-v1">
          <div className="ad-blog-editor-main-v1">
            <section className="ad-blog-editor-section-v1">
              <p className="ad-kicker">Article</p>

              <AdminFormField label="Title" wide>
                <input
                  value={title}
                  onChange={(event) => updateTitle(event.target.value)}
                  required
                  maxLength={160}
                  disabled={saving}
                  placeholder="A clear, useful article title"
                />
              </AdminFormField>

              {mode === "create" && (
                <AdminFormField label="URL Slug" wide>
                  <div className="ad-blog-slug-v1">
                    <span>/blog/</span>
                    <input
                      value={slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        setSlug(cleanSlug(event.target.value));
                      }}
                      required
                      maxLength={160}
                      disabled={saving}
                    />
                  </div>
                </AdminFormField>
              )}

              <AdminFormField label="Summary / Excerpt" wide>
                <textarea
                  name="summary"
                  rows={4}
                  required
                  maxLength={1500}
                  defaultValue={initial?.description ?? ""}
                  placeholder="Short introduction used in admin cards and future blog listings"
                  disabled={saving}
                />
              </AdminFormField>

              <div>
                <p className="ad-blog-field-label-v1">Rich Article Content</p>
                <AdminRichTextEditor value={body} onChange={setBody} disabled={saving} />
              </div>
            </section>
          </div>

          <aside className="ad-blog-editor-side-v1">
            <section className="ad-blog-editor-section-v1">
              <p className="ad-kicker">Publishing</p>

              <AdminDialogGrid>
                <AdminFormField label="Status" wide>
                  <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={saving}>
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Scheduled</option>
                  </select>
                </AdminFormField>

                {status === "Scheduled" && (
                  <AdminFormField label="Publish Date & Time" wide>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(event) => setScheduledAt(event.target.value)}
                      disabled={saving}
                    />
                  </AdminFormField>
                )}

                <AdminFormField label="Category" wide>
                  <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={saving}>
                    {CATEGORY_OPTIONS.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </AdminFormField>

                <AdminFormField label="Author / Byline" wide>
                  <input value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={100} disabled={saving} />
                </AdminFormField>

                <AdminFormField label="Published By" wide>
                  <select value={publishedBy} onChange={(event) => setPublishedBy(event.target.value)} disabled={saving}>
                    <option value="M. Dadu Films Editorial">M. Dadu Films Editorial</option>
                    {signedInAdminName && signedInAdminName !== "M. Dadu Films Editorial" && (
                      <option value={signedInAdminName}>{signedInAdminName}</option>
                    )}
                  </select>
                </AdminFormField>

                <AdminFormField label="Display Order" wide>
                  <input name="order" type="number" min="0" max="10000" defaultValue={initial?.order ?? 0} disabled={saving} />
                </AdminFormField>
              </AdminDialogGrid>
            </section>

            <section className="ad-blog-editor-section-v1">
              <p className="ad-kicker">Cover Image</p>
              <CoverPreview file={cover} existing={initial?.image} alt={title} />
              <label className="ad-blog-cover-input-v1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={saving}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setCover(event.currentTarget.files?.[0] ?? null)}
                />
                <span>{cover ? "Change Selected Image" : initial?.image ? "Replace Cover" : "Choose Cover"}</span>
              </label>

              <AdminFormField label="Image Alt Text" wide>
                <input
                  name="imageAlt"
                  defaultValue={initial?.imageAlt ?? ""}
                  maxLength={200}
                  placeholder="Describe the cover image"
                  disabled={saving}
                />
              </AdminFormField>
            </section>

            <section className="ad-blog-editor-section-v1">
              <p className="ad-kicker">Tags & Discovery</p>
              <BlogTagPicker tags={tags} featured={featured} onTags={setTags} onFeatured={setFeatured} />
            </section>

            <section className="ad-blog-editor-section-v1">
              <p className="ad-kicker">SEO</p>
              <AdminFormField label="SEO Title" wide>
                <input name="seoTitle" defaultValue={initial?.seoTitle ?? ""} maxLength={160} disabled={saving} />
              </AdminFormField>
              <AdminFormField label="SEO Description" wide>
                <textarea
                  name="seoDescription"
                  rows={4}
                  defaultValue={initial?.seoDescription ?? ""}
                  maxLength={300}
                  disabled={saving}
                />
              </AdminFormField>

              <div className="ad-blog-readtime-v1">
                <span>Automatic read time</span>
                <strong>{readTimeFor(body)}</strong>
              </div>
            </section>
          </aside>
        </div>

        <AdminDialogActions onCancel={onClose} primaryLabel={saving ? "Saving Article…" : mode === "create" ? "Create Post" : "Save Changes"} />
      </AdminDialogForm>
    </AdminDialog>
  );
}

export function AdminBlogView() {
  const toast = useToast();
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("newest");

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (deferredQuery) params.set("search", deferredQuery);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    params.set("sort", sort);
    return `/admin/content/blog?${params.toString()}`;
  }, [status, deferredQuery, category, tag, sort]);

  const [posts, , refresh, meta, setPage, , loading, error] = useAdminRecords<BlogSource, BlogItem>(
    path,
    mapBlog,
    true,
    1,
    20,
  );

  const [summary, setSummary] = useState<BlogSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BlogItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<BlogItem | null>(null);
  const [archiving, setArchiving] = useState(false);

  async function loadSummary() {
    try {
      setSummary(await api<BlogSummary>("/admin/content/blog/summary"));
    } catch {
      setSummary(null);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  async function changed() {
    await Promise.allSettled([refresh(), loadSummary()]);
  }

  async function openEditor(id: string) {
    setDetailLoading(true);

    try {
      setEditing(mapBlog(await api<BlogSource>(`/admin/content/blog/${id}`)));
    } catch (detailError) {
      toast.error(detailError instanceof Error ? detailError.message : "Unable to load blog post.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function archive() {
    if (!archiveTarget || archiving) return;
    setArchiving(true);

    try {
      await api(`/admin/content/blog/${archiveTarget.id}`, { method: "DELETE" });
      setArchiveTarget(null);
      await changed();
      toast.success("Blog post archived.");
    } catch (archiveError) {
      toast.error(archiveError instanceof Error ? archiveError.message : "Unable to archive blog post.");
    } finally {
      setArchiving(false);
    }
  }

  const noResults = !loading && !error && posts.length === 0;

  return (
    <div className="ad-stack">
      <AdminPageHeader
        eyebrow="Editorial CMS"
        title="Blog & News"
        description="Create, edit, schedule and organise long-form articles with a focused editorial workflow."
        action={<AdminPrimaryButton onClick={() => setCreating(true)}>New Blog Post</AdminPrimaryButton>}
      />

      <section className="ad-blog-overview-v1">
        <div><span>Total posts</span><strong>{summary?.total ?? "—"}</strong></div>
        <div><span>Published</span><strong>{summary?.published ?? "—"}</strong></div>
        <div><span>Drafts</span><strong>{summary?.drafts ?? "—"}</strong></div>
        <div><span>Scheduled</span><strong>{summary?.scheduled ?? "—"}</strong></div>
        <div><span>Featured</span><strong>{summary?.featured ?? "—"}</strong></div>
      </section>

      <section className="ad-blog-how-v1">
        <div><b>1</b><span><strong>Write</strong>Use the rich editor for headings, lists, quotes, links and formatting.</span></div>
        <div><b>2</b><span><strong>Prepare</strong>Add cover, category, author, tags, summary and SEO metadata.</span></div>
        <div><b>3</b><span><strong>Publish</strong>Keep a draft, publish immediately or schedule it for later.</span></div>
      </section>

      <section className="ad-toolbar">
        <AdminFilters values={["All", "Published", "Draft", "Scheduled"]} active={status} onChange={setStatus} />
        <AdminSearch value={query} onChange={setQuery} placeholder="Search title, summary, author, category or tags" />
      </section>

      <section className="ad-blog-filters-v1">
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>

        <label>
          <span>Tag</span>
          <select value={tag} onChange={(event) => setTag(event.target.value)}>
            <option value="">All tags</option>
            {TAG_OPTIONS.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>

        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest created</option>
            <option value="updated">Recently updated</option>
            <option value="published">Publish date</option>
            <option value="oldest">Oldest created</option>
            <option value="title-asc">Title A–Z</option>
            <option value="title-desc">Title Z–A</option>
            <option value="order">Display order</option>
          </select>
        </label>

        {(category || tag || query || status !== "All" || sort !== "newest") && (
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setTag("");
              setQuery("");
              setStatus("All");
              setSort("newest");
            }}
          >
            Clear Filters
          </button>
        )}
      </section>

      <AdminCollectionState loading={loading} error={error} empty={false} onRetry={() => void refresh()} />

      {noResults && (
        <section className="ad-blog-empty-v1">
          <div>✎</div>
          <p className="ad-kicker">{query || category || tag || status !== "All" ? "No results" : "Editorial workspace"}</p>
          <h2>{query || category || tag || status !== "All" ? "No posts match these filters." : "Create your first dashboard blog post."}</h2>
          <p>
            {query || category || tag || status !== "All"
              ? "Clear filters or use a different search."
              : "Your current public static blog remains untouched. These posts are prepared and managed in the backend CMS."}
          </p>
          <button type="button" className="ad-dialog-primary" onClick={() => setCreating(true)}>Create Blog Post</button>
        </section>
      )}

      {!!posts.length && (
        <section className="ad-blog-grid-v1">
          {posts.map((post) => (
            <article className={`ad-blog-card-v1 ${post.featured ? "featured" : ""}`} key={post.id}>
              <div className="ad-blog-cover-v1">
                <SiteMedia src={post.image} alt={post.imageAlt || post.title} kind="blog" className="aspect-[16/10]" />
                <div className="ad-blog-status-v1"><AdminStatus value={post.status} /></div>
                {post.featured && <span className="ad-blog-featured-v1">Featured</span>}
              </div>

              <div className="ad-blog-card-body-v1">
                <div className="ad-blog-card-meta-v1">
                  <span>{post.category}</span>
                  <span>{post.readTime || "Read time pending"}</span>
                </div>

                <h2>{post.title}</h2>
                <p>{post.description || "No summary added."}</p>

                {!!post.tags.length && (
                  <div className="ad-blog-card-tags-v1">
                    {post.tags.slice(0, 3).map((value) => <span key={value}>{value}</span>)}
                    {post.tags.length > 3 && <span>+{post.tags.length - 3}</span>}
                  </div>
                )}

                <div className="ad-blog-card-info-v1">
                  <div><span>Published by</span><strong>{post.publishedBy}</strong></div>
                  <div><span>{post.status === "Scheduled" ? "Scheduled" : post.publishedAt ? "Published" : "Created"}</span><strong>{dateLabel(post.publishedAt || post.createdAt)}</strong></div>
                </div>

                <div className="ad-blog-card-actions-v1">
                  <button type="button" disabled={detailLoading} onClick={() => void openEditor(post.id)}>
                    {detailLoading ? "Loading…" : "Open Editor →"}
                  </button>
                  <button type="button" onClick={() => setArchiveTarget(post)}>Archive</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <PaginationControls meta={meta} onPage={setPage} />

      <BlogEditorDialog mode="create" open={creating} onClose={() => setCreating(false)} onSaved={changed} />
      <BlogEditorDialog mode="edit" initial={editing ?? undefined} open={!!editing} onClose={() => setEditing(null)} onSaved={changed} />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive this blog post?"
        description={archiveTarget ? `"${archiveTarget.title}" will be removed from active CMS results and unpublished.` : undefined}
        confirmLabel="Archive Post"
        destructive
        loading={archiving}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => void archive()}
      />
    </div>
  );
}
