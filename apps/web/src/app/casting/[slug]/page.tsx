import { ContentDetail } from "@/components/content-detail";
import { getContentItem } from "@/services/content";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("casting", slug);
  return { title: item?.title ?? "Not found", description: item?.description };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ContentDetail kind="casting" slug={slug} />;
}
