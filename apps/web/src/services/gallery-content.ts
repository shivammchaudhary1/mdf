import { type ApiContent, getCollection } from "@/services/content";

export type GallerySectionSlug = "featured-images" | "behind-the-scenes" | "others";

export type PublicGalleryItem = {
  id: string;
  title: string;
  caption: string;
  image: string;
  imageAlt: string;
  category: string;
  tags: string[];
  uploadedAt: string;
};

type ClassifiableGalleryItem = Pick<ApiContent, "category" | "tags">;

function normalized(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function hasTag(item: ClassifiableGalleryItem, tag: string) {
  const target = tag.toLowerCase();
  return (item.tags ?? []).some((value) => normalized(value) === target);
}

function isBehindTheScenes(item: ClassifiableGalleryItem) {
  return normalized(item.category) === "behind the scenes" || hasTag(item, "Behind the Scenes");
}

function isFeatured(item: ClassifiableGalleryItem) {
  return hasTag(item, "Featured");
}

function belongsTo(item: ClassifiableGalleryItem, section: GallerySectionSlug) {
  if (section === "featured-images") return isFeatured(item);
  if (section === "behind-the-scenes") return isBehindTheScenes(item);
  return !isFeatured(item) && !isBehindTheScenes(item);
}

function mapItem(item: ApiContent): PublicGalleryItem | null {
  const image = item.image?.trim() ?? "";
  if (!image) return null;

  return {
    id: item._id,
    title: item.title.trim() || "Gallery Image",
    caption: item.description?.trim() || "",
    image,
    imageAlt: item.title.trim() || "M. Dadu Films gallery image",
    category: item.category?.trim() || "Other",
    tags: item.tags ?? [],
    uploadedAt: item.publishedAt || item.createdAt || "",
  };
}

export async function getPublicGalleryItems() {
  try {
    const first = await getCollection("gallery", 1, 100);
    const pages = [first];

    if (first.meta.pages > 1) {
      const rest = await Promise.all(
        Array.from({ length: first.meta.pages - 1 }, (_, index) => getCollection("gallery", index + 2, 100)),
      );
      pages.push(...rest);
    }

    return pages.flatMap((page) => page.items).map(mapItem).filter((item): item is PublicGalleryItem => !!item);
  } catch {
    return [];
  }
}

export async function getPublicGallerySection(section: GallerySectionSlug) {
  const items = await getPublicGalleryItems();
  return items.filter((item) => belongsTo(item, section));
}

export async function getPublicGallerySections() {
  const items = await getPublicGalleryItems();

  const result: Record<GallerySectionSlug, PublicGalleryItem[]> = {
    "featured-images": [],
    "behind-the-scenes": [],
    others: [],
  };

  for (const item of items) {
    if (belongsTo(item, "featured-images")) result["featured-images"].push(item);
    if (belongsTo(item, "behind-the-scenes")) result["behind-the-scenes"].push(item);
    if (belongsTo(item, "others")) result.others.push(item);
  }

  return result;
}
