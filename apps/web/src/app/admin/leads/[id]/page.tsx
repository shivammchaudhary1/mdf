import type { Metadata } from "next";

import { AdminLeadDetailView } from "@/components/admin/admin-lead-detail-view";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Lead Details — Super Admin",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell section="leads">
      <AdminLeadDetailView leadId={id} />
    </AdminShell>
  );
}
