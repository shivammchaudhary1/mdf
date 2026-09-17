import { MemberWorkspace } from "@/components/member-workspace";
export const metadata = {
  title: "Member Dashboard",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <MemberWorkspace />;
}
