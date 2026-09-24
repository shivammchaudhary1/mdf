"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/toast-provider";
import { cachedApi } from "@/services/api";
import { dateLabel } from "@/services/workspace";

type DashboardApplication = {
  _id: string;
  applicant: { name: string; city?: string };
  opportunityTitle: string;
  roleSnapshot?: string;
  status: string;
  createdAt: string;
};

type Dashboard = {
  metrics: Record<string, number>;
  pipeline: Record<string, number>;
  growth: { _id: { year: number; month: number }; count: number }[];
  activity: { _id: string; action: string; entityType: string; summary?: string; createdAt: string }[];
  latestApplications: DashboardApplication[];
};

const emptyDashboard: Dashboard = {
  metrics: {},
  pipeline: {},
  growth: [],
  activity: [],
  latestApplications: [],
};

export function useAdminDashboard() {
  const [result, setResult] = useState<Dashboard>(emptyDashboard);
  const toast = useToast();

  useEffect(() => {
    let active = true;

    void cachedApi<Dashboard>("/admin/dashboard", { ttl: 15_000 })
      .then((dashboard) => {
        if (active) setResult(dashboard);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load dashboard."));

    return () => {
      active = false;
    };
  }, [toast]);

  const metrics = result.metrics;
  const pipeline = ["Submitted", "Under Review", "Shortlisted", "Selected"].map((label) => ({
    label,
    value: result.pipeline[label] ?? 0,
    percent: metrics.applications ? ((result.pipeline[label] ?? 0) * 100) / metrics.applications : 0,
  }));

  const max = Math.max(1, ...result.growth.map((item) => item.count));
  const growth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() - 5 + index);

    const count =
      result.growth.find(
        (item) => item._id.year === date.getUTCFullYear() && item._id.month === date.getUTCMonth() + 1,
      )?.count ?? 0;

    return {
      label: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      value: (count / max) * 100,
    };
  });

  const applications = result.latestApplications.map((application) => ({
    id: application._id,
    applicant: application.applicant.name,
    role: application.roleSnapshot ?? application.opportunityTitle,
    project: application.opportunityTitle,
    city: application.applicant.city ?? "—",
    applied: dateLabel(application.createdAt),
    status: application.status,
    notes: "",
  }));

  return {
    stats: [
      { label: "Total Members", value: metrics.members ?? 0, delta: "", tone: "positive", helper: "", icon: "members" },
      { label: "Verified Talent", value: metrics.verified ?? 0, delta: "", tone: "positive", helper: "", icon: "check" },
      { label: "Open Castings", value: metrics.openCastings ?? 0, delta: "", tone: "neutral", helper: "", icon: "casting" },
      {
        label: "Pending Applications",
        value: metrics.pending ?? 0,
        delta: "",
        tone: "warning",
        helper: "",
        icon: "applications",
      },
      {
        label: "Total Visitors",
        value: metrics.totalVisitors ?? 0,
        delta: "",
        tone: "positive",
        helper: "Unique browsers",
        icon: "visitors",
      },
    ],
    pipeline,
    growth,
    applications,
    recentActivity: result.activity.map((item) => ({
      title: item.summary ?? item.action,
      meta: item.action,
      type: item.entityType,
      time: dateLabel(item.createdAt),
    })),
    queue: {
      pending: metrics.pending ?? 0,
      unverified: (metrics.members ?? 0) - (metrics.verified ?? 0),
      contacts: metrics.newContacts ?? 0,
      drafts: metrics.draftBlogCount ?? 0,
    },
  };
}
