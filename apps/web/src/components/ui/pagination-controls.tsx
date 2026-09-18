"use client";
import type { PageMeta } from "@/services/workspace";
export function PaginationControls({meta,onPage,compact=false}:{meta?:PageMeta;onPage:(p:number)=>void;compact?:boolean}){
 if(!meta||meta.pages<=1)return null; const start=Math.max(1,meta.page-2),end=Math.min(meta.pages,start+4);
 return <nav aria-label="Pagination" className={compact?"mt-5 flex flex-wrap items-center justify-center gap-2":"mt-8 flex flex-wrap items-center justify-center gap-2"}>
  <button type="button" className="site-button site-button-outline" disabled={meta.page<=1} onClick={()=>onPage(meta.page-1)}>← Previous</button>
  {Array.from({length:end-start+1},(_,i)=>start+i).map(p=><button type="button" key={p} aria-current={p===meta.page?"page":undefined} onClick={()=>onPage(p)} className={`grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-semibold ${p===meta.page?"border-[#111] bg-[#111] text-white":"border-black/10 bg-white text-[#555]"}`}>{p}</button>)}
  <button type="button" className="site-button site-button-outline" disabled={meta.page>=meta.pages} onClick={()=>onPage(meta.page+1)}>Next →</button>
 </nav>
}
