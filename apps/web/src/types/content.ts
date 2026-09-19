export type ContentItem = {
  _id?: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  body: string[];
  image?: string;
  status?: string;
  location?: string;
  role?: string;
  deadline?: string;
};
export type CollectionKind = "projects" | "casting" | "blog" | "team" | "gallery" | "behind-the-scenes" | "shows";
