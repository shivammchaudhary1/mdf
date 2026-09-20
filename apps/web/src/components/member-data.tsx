"use client";
import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { LoadingState } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import { ApiError, cachedApi } from "@/services/api";
import {
  type ApplicationRecord,
  type ContentRecord,
  dateLabel,
  fetchPage,
  mediaUrl,
  type MemberProfile,
  type OpportunityRecord,
  type ProfileRecord,
} from "@/services/workspace";
import { useAppStore } from "@/store/app-store";
type View = {
  member: {
    name: string;
    firstName: string;
    email: string;
    mobile: string;
    location: string;
    profession: string;
    verified: boolean;
    profileCompletion: number;
    availability: string;
    memberSince: string;
    photo: string;
  };
  stats: Array<{ label: string; value: string; helper: string }>;
  profileChecklist: Array<{ label: string; done: boolean }>;
  applications: Array<{
    id: string;
    role: string;
    project: string;
    type: string;
    location: string;
    appliedOn: string;
    status: string;
    tone: string;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    project: string;
    category: string;
    location: string;
    deadline: string;
    match: string;
    paid: boolean;
    compensation?: string;
    image: string;
  }>;
  portfolio: Array<{ id: string; title: string; category: string; image: string }>;
  profile: {
    bio: string;
    city: string;
    profession: string;
    gender: string;
    birthDate: string;
    experience: string;
    availability: string;
    skills: string[];
    languages: string[];
  };
  activity: Array<{ title: string; time: string }>;
  posts: Array<{ title: string; category: string; date: string; image: string }>;
};
type Dashboard = { applicationSummary: { total: number; shortlisted: number; submitted: number; underReview: number } };
const empty: View = {
  member: {
    name: "",
    firstName: "",
    email: "",
    mobile: "",
    location: "",
    profession: "",
    verified: false,
    profileCompletion: 0,
    availability: "",
    memberSince: "",
    photo: "",
  },
  stats: [],
  profileChecklist: [],
  applications: [],
  opportunities: [],
  portfolio: [],
  profile: { bio: "", city: "", profession: "", gender: "", birthDate: "", experience: "", availability: "", skills: [], languages: [] },
  activity: [],
  posts: [],
};
const Context = createContext({ data: empty, profile: {} as ProfileRecord, memberId: "", refresh: async () => {} });
export const useMemberData = () => useContext(Context);
export function MemberData({ children }: { children: ReactNode }) {
  const [value, setValue] = useState({ data: empty, profile: {} as ProfileRecord, memberId: "" }),
    [ready, setReady] = useState(false);
  const toast = useToast(),
    router = useRouter();
  const refresh = useCallback(async () => {
    const [account, dashboard, appsPage, oppsPage, postsPage] = await Promise.all([
      cachedApi<MemberProfile>("/member/profile", { ttl: 60_000 }),
      cachedApi<Dashboard>("/member/dashboard", { ttl: 30_000 }),
      fetchPage<ApplicationRecord>("/member/applications", 1, 5),
      fetchPage<OpportunityRecord>("/member/opportunities", 1, 4),
      fetchPage<ContentRecord>("/content/blog", 1, 2),
    ]);
    const applications = appsPage.items,
      opportunities = oppsPage.items,
      posts = postsPage.items,
      p = account.profile ?? {},
      a = account.account,
      counts = dashboard.applicationSummary;
    useAppStore.getState().setProfilePhoto(mediaUrl(p.photo));
    setValue({
      memberId: a.id,
      profile: p,
      data: {
        member: {
          name: a.name,
          firstName: a.name.split(" ")[0],
          email: a.email,
          mobile: a.mobile,
          location: p.city ?? "",
          profession: p.profession ?? "",
          verified: a.verified,
          profileCompletion: account.completion,
          availability: p.availability ?? "",
          memberSince: p.createdAt ? new Date(p.createdAt).getFullYear().toString() : "—",
          photo: mediaUrl(p.photo),
        },
        stats: [
          { label: "Applications", value: String(counts.total), helper: `${counts.submitted + counts.underReview} active` },
          { label: "Shortlisted", value: String(counts.shortlisted), helper: "" },
          { label: "Profile views", value: "—", helper: "" },
          { label: "Saved roles", value: String(p.savedOpportunityIds?.length ?? 0), helper: "" },
        ],
        profileChecklist: [
          { label: "Basic information", done: !!(p.bio && p.city && p.profession) },
          { label: "Profile photograph", done: !!p.photoMediaId },
          { label: "Skills & languages", done: !!(p.skills?.length && p.languages?.length) },
          { label: "Portfolio photographs", done: !!p.portfolioMediaIds?.length },
          { label: "Showreel", done: !!p.showreel },
        ],
        profile: {
          bio: p.bio ?? "",
          city: p.city ?? "",
          profession: p.profession ?? "",
          gender: p.gender ?? "",
          birthDate: p.birthDate?.slice(0, 10) ?? "",
          experience: p.experience ?? "",
          availability: p.availability ?? "",
          skills: p.skills ?? [],
          languages: p.languages ?? [],
        },
        applications: applications.map((x) => ({
          id: x._id,
          role: x.roleSnapshot ?? x.opportunityTitle,
          project: x.opportunityTitle,
          type: x.opportunityType,
          location: x.applicant.city ?? "—",
          appliedOn: dateLabel(x.createdAt),
          status: x.status === "Rejected" ? "Not Selected" : x.status,
          tone:
            x.status === "Shortlisted" || x.status === "Selected"
              ? "success"
              : x.status === "Under Review"
                ? "warning"
                : x.status === "Rejected"
                  ? "danger"
                  : "neutral",
        })),
        opportunities: opportunities.map((x) => ({
          id: x._id,
          title: x.title,
          project: x.role ?? x.title,
          category: x.category ?? "",
          location: x.location ?? "—",
          deadline: dateLabel(x.deadline),
          match: "—",
          paid: !!x.compensation,
          compensation: x.compensation ?? "",
          image: mediaUrl(x.coverImage),
        })),
        portfolio: (p.portfolioMediaIds ?? []).map((id, i) => ({
          id,
          title: `Photograph ${i + 1}`,
          category: "Portfolio",
          image: mediaUrl(p.portfolio?.[i]),
        })),
        activity: applications.slice(0, 5).map((x) => ({ title: `${x.status} — ${x.opportunityTitle}`, time: dateLabel(x.createdAt) })),
        posts: posts.slice(0, 2).map((x) => ({
          title: x.title,
          category: x.category ?? "",
          date: dateLabel(x.publishedAt ?? x.createdAt),
          image: mediaUrl(x.coverImage),
        })),
      },
    });
    setReady(true);
  }, []);
  useEffect(() => {
    void refresh().catch((error) => {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
      else {
        setReady(true);
        toast.error(error instanceof Error ? error.message : "Unable to load member data.");
      }
    });
  }, [refresh, router, toast]);
  if (!ready) return <LoadingState label="Loading your member workspace…" />;
  return <Context.Provider value={{ ...value, refresh }}>{children}</Context.Provider>;
}
