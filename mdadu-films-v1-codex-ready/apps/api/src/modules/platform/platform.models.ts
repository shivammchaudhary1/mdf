import { Schema } from "mongoose";
export const contentKinds = [
  "projects",
  "casting",
  "blog",
  "team",
  "gallery",
  "behind-the-scenes",
  "shows",
  "settings",
  "legal",
] as const;
export type ContentKind = (typeof contentKinds)[number];
export interface ContentRecord {
  _id: unknown;
  kind: ContentKind;
  slug: string;
  title: string;
  category: string;
  description: string;
  body: string[];
  image: string;
  images: string[];
  status: string;
  published: boolean;
  archived: boolean;
  location: string;
  role: string;
  deadline?: Date;
  shootDate?: Date;
  ageMin?: number;
  ageMax?: number;
  gender: string;
  experience: string;
  compensation: string;
  requirements: string;
  projectId: string;
  videoUrl: string;
  credits: string;
  order: number;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  data: Record<string, string>;
  createdAt: Date;
}
export const ContentSchema = new Schema<ContentRecord>(
  {
    kind: { type: String, enum: contentKinds, required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, default: "" },
    description: { type: String, default: "" },
    body: { type: [String], default: [] },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    status: { type: String, default: "Upcoming" },
    published: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    location: { type: String, default: "" },
    role: { type: String, default: "" },
    deadline: Date,
    shootDate: Date,
    ageMin: Number,
    ageMax: Number,
    gender: { type: String, default: "" },
    experience: { type: String, default: "" },
    compensation: { type: String, default: "" },
    requirements: { type: String, default: "" },
    projectId: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    credits: { type: String, default: "" },
    order: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    data: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);
ContentSchema.index({ kind: 1, slug: 1 }, { unique: true });
ContentSchema.index({ kind: 1, published: 1, archived: 1, order: 1 });
export interface Profile {
  userId: string;
  bio: string;
  city: string;
  profession: string;
  gender: string;
  birthDate?: Date;
  skills: string[];
  languages: string[];
  experience: string;
  availability: string;
  photo: string;
  portfolio: string[];
  videos: string[];
  showreel: string;
  previousWork: string;
  socialLinks: string[];
  resume: string;
}
export const ProfileSchema = new Schema<Profile>(
  {
    userId: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    city: { type: String, default: "" },
    profession: { type: String, default: "" },
    gender: { type: String, default: "" },
    birthDate: Date,
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    experience: { type: String, default: "" },
    availability: { type: String, default: "" },
    photo: { type: String, default: "" },
    portfolio: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    showreel: { type: String, default: "" },
    previousWork: { type: String, default: "" },
    socialLinks: { type: [String], default: [] },
    resume: { type: String, default: "" },
  },
  { timestamps: true },
);
export const applicationStatuses = [
  "Submitted",
  "Under Review",
  "Shortlisted",
  "Selected",
  "Rejected",
] as const;
export interface Application {
  _id: unknown;
  userId: string;
  opportunityId: string;
  opportunityTitle: string;
  coverNote: string;
  portfolio: string[];
  showreel: string;
  pitch: string;
  document: string;
  status: string;
  adminNotes: string;
  createdAt: Date;
}
export const ApplicationSchema = new Schema<Application>(
  {
    userId: { type: String, required: true, index: true },
    opportunityId: { type: String, required: true, index: true },
    opportunityTitle: String,
    coverNote: String,
    portfolio: [String],
    showreel: String,
    pitch: String,
    document: String,
    status: { type: String, enum: applicationStatuses, default: "Submitted" },
    adminNotes: { type: String, default: "", select: false },
  },
  { timestamps: true },
);
ApplicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
export interface SavedList {
  _id: unknown;
  ownerId: string;
  name: string;
  memberIds: string[];
  projectId: string;
}
export const SavedListSchema = new Schema<SavedList>(
  {
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    memberIds: { type: [String], default: [] },
    projectId: { type: String, default: "" },
  },
  { timestamps: true },
);
export interface Contact {
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
}
export const ContactSchema = new Schema<Contact>(
  {
    name: String,
    email: String,
    subject: String,
    message: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export interface Media {
  _id: unknown;
  ownerId: string;
  kind: "image" | "document";
  files: Record<string, string>;
  originalName: string;
}
export const MediaSchema = new Schema<Media>(
  {
    ownerId: { type: String, required: true, index: true },
    kind: { type: String, enum: ["image", "document"], required: true },
    files: { type: Map, of: String, required: true },
    originalName: String,
  },
  { timestamps: true },
);
