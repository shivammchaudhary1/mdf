import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { CollectionBrowser } from "@/components/collection-browser";
import { DemoNotice } from "@/components/ui/feedback";
import { getCollection } from "@/services/content";
import type { CollectionKind } from "@/types/content";

export async function CollectionPage({kind,page=1,limit=12}:{kind:CollectionKind;page?:number;limit?:number}){
  const collection=await getCollection(kind,page,limit);const meta=collection.meta;
  const start=Math.min(Math.max(1,meta.page-2),Math.max(1,meta.pages-4));
  return <PageShell eyebrow={collection.eyebrow} title={collection.title} description={collection.description}>
    <div className="mt-12">{collection.isDemo&&<DemoNotice/>}<CollectionBrowser items={collection.items} kind={kind}/>
      {meta.pages>1?<nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
        <Link aria-disabled={meta.page<=1} className={`site-button site-button-outline ${meta.page<=1?"pointer-events-none opacity-40":""}`} href={`?page=${Math.max(1,meta.page-1)}`}>← Previous</Link>
        {Array.from({length:Math.min(5,meta.pages)},(_,i)=>start+i).filter(v=>v<=meta.pages).map(v=><Link key={v} aria-current={v===meta.page?"page":undefined} href={`?page=${v}`} className={`grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-semibold ${v===meta.page?"border-[#111] bg-[#111] text-white":"border-black/10 bg-white text-[#555]"}`}>{v}</Link>)}
        <Link aria-disabled={meta.page>=meta.pages} className={`site-button site-button-outline ${meta.page>=meta.pages?"pointer-events-none opacity-40":""}`} href={`?page=${Math.min(meta.pages,meta.page+1)}`}>Next →</Link>
      </nav>:null}
    </div>
  </PageShell>
}
