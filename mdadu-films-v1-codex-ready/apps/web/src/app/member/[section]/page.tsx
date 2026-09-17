import { MemberWorkspace } from "@/components/member-workspace";
import { notFound } from "next/navigation";
export const metadata = {
  title: "Member Community",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (
    ![
      "profile",
      "portfolio",
      "applications",
      "opportunities",
      "settings",
    ].includes(section)
  )
    notFound();
  return <MemberWorkspace section={section} />;
}
