import { StaticDetailView } from "@/components/site/static-detail-view";

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <StaticDetailView kind="projects" slug={slug} />;
}
