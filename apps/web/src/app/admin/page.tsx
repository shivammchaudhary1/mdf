import { AdminWorkspace } from "@/components/admin/admin-workspace";
export const metadata = { title: "Super Admin", robots: { index: false, follow: false } };
export default function Page() {
  return <AdminWorkspace />;
}
