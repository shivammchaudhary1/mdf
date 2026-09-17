import { AdminCheckpoint } from "@/components/admin-checkpoint";
export const metadata = {
  title: "Super Admin",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <AdminCheckpoint />;
}
