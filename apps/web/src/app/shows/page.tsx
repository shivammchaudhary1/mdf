import { CollectionPage } from "@/components/collection-page";
import { collectionCopy } from "@/content/placeholders/catalog";
export const metadata={title:collectionCopy["shows"].title,description:collectionCopy["shows"].description};
type Props={searchParams:Promise<{page?:string}>};
export default async function Page({searchParams}:Props){const params=await searchParams;const parsed=Number(params.page??1);const page=Number.isInteger(parsed)&&parsed>0?parsed:1;return <CollectionPage kind="shows" page={page} limit={12}/>}
