import { type ApplicationRecord, type ContentRecord, dateLabel, mediaUrl, type ProfileRecord } from "./workspace";

export type TalentRecord = {
  id: string;
  name: string;
  email: string;
  memberCode?: string;
  verified: boolean;
  suspended: boolean;
  createdAt: string;
  profile: ProfileRecord | null;
};

export type MemberView = {
  id: string;
  name: string;
  email: string;
  memberCode: string;
  role: string;
  city: string;
  joined: string;
  completion: number;
  verified: boolean;
  status: string;
  image: string;
  suspended: boolean;
};

export const memberView = (x: TalentRecord): MemberView => ({
  id: x.id,
  name: x.name,
  email: x.email,
  memberCode: x.memberCode ?? "",
  verified: x.verified,
  status: x.suspended ? "Suspended" : x.verified ? "Active" : "Needs Review",
  role: x.profile?.profession ?? "",
  city: x.profile?.city ?? "",
  joined: dateLabel(x.createdAt),
  completion: x.profile?.completion ?? 0,
  image: mediaUrl(x.profile?.photo),
  suspended: x.suspended,
});

export const applicationView = (x: ApplicationRecord) => ({
  id: x._id,
  applicant: x.applicant.name,
  role: x.roleSnapshot ?? x.opportunityTitle,
  project: x.opportunityTitle,
  city: x.applicant.city ?? "—",
  applied: dateLabel(x.createdAt),
  status: x.status,
  notes: x.adminNotes ?? "",
});

export type ProjectCredit = { name: string; role: string };
export type ProjectLink = { title: string; url: string };

export type ProjectRecord = {
  _id: string;
  slug: string;
  title: string;
  type?: string;
  summary?: string;
  description?: string;
  body?: string[];
  creditsText?: string;
  status: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  coverMediaId?: string;
  coverImage?: string;
  galleryMediaIds?: string[];
  galleryImages?: string[];
  credits?: ProjectCredit[];
  links?: ProjectLink[];
  trailerUrl?: string;
  tags?: string[];
  published: boolean;
  order?: number;
  updatedAt: string;
  applications?: number;
};

export type ProjectView = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  applications: number;
  team: number;
  updated: string;
  image: string;
  location: string;
  summary: string;
  description: string;
  body: string[];
  creditsText: string;
  startDate: string;
  endDate: string;
  coverMediaId?: string;
  galleryMediaIds: string[];
  galleryImages: string[];
  credits: ProjectCredit[];
  links: ProjectLink[];
  trailerUrl: string;
  tags: string[];
  published: boolean;
  order?: number;
};

export const projectView = (x: ProjectRecord): ProjectView => ({
  id: x._id,
  slug: x.slug,
  title: x.title,
  type: x.type ?? "",
  status: x.status,
  applications: x.applications ?? 0,
  team: x.credits?.length ?? 0,
  updated: dateLabel(x.updatedAt),
  image: mediaUrl(x.coverImage),
  location: x.location ?? "",
  summary: x.summary ?? "",
  description: x.description ?? "",
  body: x.body ?? [],
  creditsText: x.creditsText ?? "",
  startDate: x.startDate?.slice(0, 10) ?? "",
  endDate: x.endDate?.slice(0, 10) ?? "",
  coverMediaId: x.coverMediaId,
  galleryMediaIds: x.galleryMediaIds ?? [],
  galleryImages: x.galleryImages ?? [],
  credits: x.credits ?? [],
  links: x.links ?? [],
  trailerUrl: x.trailerUrl ?? "",
  tags: x.tags ?? [],
  published: !!x.published,
  order: x.order,
});

export type CastingRecord = {
  _id: string;
  slug: string;
  title: string;
  projectId?: string;
  projectTitle?: string;
  role?: string;
  category?: string;
  summary?: string;
  description?: string;
  details?: string[];
  location?: string;
  shootDate?: string;
  deadline?: string;
  status: string;
  closingSoon: boolean;
  deadlineExpired?: boolean;
  acceptingApplications?: boolean;
  published: boolean;
  applications?: number;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  experience?: string;
  compensation?: string;
  requirements?: string;
  coverMediaId?: string;
  coverImage?: string;
  tags?: string[];
};

export type CastingView = {
  id: string;
  slug: string;
  title: string;
  projectId?: string;
  project: string;
  role: string;
  category: string;
  summary: string;
  description: string;
  details: string[];
  location: string;
  shootDate: string;
  deadline: string;
  status: string;
  workflowStatus: string;
  applications: number;
  ageMin?: number;
  ageMax?: number;
  age: string;
  gender: string;
  experience: string;
  compensation: string;
  requirements: string;
  coverMediaId?: string;
  coverImage: string;
  tags: string[];
  published: boolean;
};

export const castingView = (x: CastingRecord): CastingView => ({
  id: x._id,
  slug: x.slug,
  title: x.title,
  projectId: x.projectId,
  project: x.projectTitle ?? "—",
  role: x.role ?? "",
  category: x.category ?? "",
  summary: x.summary ?? "",
  description: x.description ?? "",
  details: x.details ?? [],
  location: x.location ?? "",
  shootDate: x.shootDate?.slice(0, 10) ?? "",
  deadline: x.deadline?.slice(0, 10) ?? "",
  status: !x.published ? "Draft" : x.deadlineExpired && x.status === "Open" ? "Closed" : x.closingSoon ? "Closing Soon" : x.status,
  workflowStatus: x.status,
  applications: x.applications ?? 0,
  ageMin: x.ageMin,
  ageMax: x.ageMax,
  age: x.ageMin !== undefined || x.ageMax !== undefined ? `${x.ageMin ?? 0}–${x.ageMax ?? 120}` : "",
  gender: x.gender ?? "",
  experience: x.experience ?? "",
  compensation: x.compensation ?? "",
  requirements: x.requirements ?? "",
  coverMediaId: x.coverMediaId,
  coverImage: x.coverImage ?? "",
  tags: x.tags ?? [],
  published: x.published,
});

export const contentView = (x: ContentRecord): Record<string, string> => ({
  id: x._id,
  title: x.title,
  name: x.title,
  category: x.category ?? "",
  role: x.role ?? "",
  status: x.status ?? (x.published ? "Published" : "Draft"),
  date: x.publishedAt?.slice(0, 10) ?? "",
  url: x.videoUrl ?? "",
  summary: x.description ?? "",
  image: mediaUrl(x.coverImage),
  author: x.data?.author ?? "",
  platform: x.data?.platform ?? "",
  group: x.data?.group ?? "",
});

export type ContactRecord = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export const contactView = (x: ContactRecord) => ({
  id: x._id,
  name: x.name,
  email: x.email,
  subject: x.subject,
  message: x.message,
  status: x.status,
  received: dateLabel(x.createdAt),
});

export type ListRecord = {
  _id: string;
  name: string;
  purpose?: string;
  memberCount: number;
  ownerId: string;
  projectId?: string;
  updatedAt: string;
};

export type ListView = { id: string; name: string; purpose: string; members: number; owner: string; projectId?: string; updated: string };

export const listView = (x: ListRecord): ListView => ({
  id: x._id,
  name: x.name,
  purpose: x.purpose ?? "",
  members: x.memberCount,
  owner: "Current account",
  projectId: x.projectId,
  updated: dateLabel(x.updatedAt),
});
