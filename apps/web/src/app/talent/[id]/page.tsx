import { TalentProfileView } from "@/components/site/talent-profile-view";
export const metadata = { title: "Talent Profile" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TalentProfileView id={id} />;
}
