"use client";
import { useMemo } from "react";
import data from "@/data/admin-dashboard.json";
import { SiteMedia } from "@/components/site/site-media";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminMoreButton,AdminPageHeader,AdminPrimaryButton,AdminStatus } from "@/components/admin/admin-shared";

type Kind="blog"|"gallery"|"bts"|"shows"|"team";
const cfg={
 blog:{eyebrow:"Editorial CMS",title:"Blog & News",description:"Draft, publish and manage editorial content for the public journal.",action:"New Post"},
 gallery:{eyebrow:"Media CMS",title:"Gallery",description:"Curate the public image gallery without mixing references with production assets.",action:"Add Media"},
 bts:{eyebrow:"Media CMS",title:"Behind the Scenes",description:"Manage production-process media and on-set stories.",action:"Add BTS Item"},
 shows:{eyebrow:"External media",title:"Shows & Media",description:"Manage YouTube, Instagram and external media links shown across the site.",action:"Add Media Link"},
 team:{eyebrow:"People CMS",title:"Team",description:"Control who appears on the public team page and how their roles are presented.",action:"Add Team Member"}
} as const;

export function AdminContentView({kind}:{kind:Kind}){
 const toast=useToast(),active=useAdminDashboardStore(s=>s.contentFilter),setActive=useAdminDashboardStore(s=>s.setContentFilter);
 const list=data[kind] as Array<Record<string,string>>;
 const config=cfg[kind];
 const statuses=["All",...Array.from(new Set(list.map(i=>i.status)))];
 const visible=useMemo(()=>list.filter(i=>active==="All"||i.status===active),[active,list]);

 return <div className="ad-stack">
  <AdminPageHeader eyebrow={config.eyebrow} title={config.title} description={config.description} action={<AdminPrimaryButton onClick={()=>toast.success(`${config.action} UI ready for backend integration.`)}>{config.action}</AdminPrimaryButton>}/>
  <AdminFilters values={statuses} active={active} onChange={setActive}/>
  {kind==="gallery"||kind==="bts"||kind==="team"?
   <section className="ad-content-grid">{visible.map(item=><article className="ad-content-card" key={item.id}><SiteMedia src={item.image} alt={item.title??item.name??"Content"} kind={kind==="team"?"team":"gallery"} className={kind==="team"?"aspect-[4/4.5]":"aspect-[4/3]"}/><div><div className="ad-content-meta"><span>{item.category??item.group??""}</span><AdminStatus value={item.status}/></div><h2>{item.title??item.name}</h2><p>{item.role??item.date??""}</p><div className="ad-content-actions"><button onClick={()=>toast.success("Opening editor.")}>Edit</button><AdminMoreButton/></div></div></article>)}</section>
   :
   <article className="ad-card ad-table-card"><div className="ad-table ad-content-table"><div className="ad-table-head"><span>Title</span><span>Category / Platform</span><span>Date</span><span>Status</span><span></span></div>{visible.map(item=><div className="ad-table-row" key={item.id}><div><strong>{item.title}</strong><span>{item.author??""}</span></div><span>{item.category??item.platform}</span><span>{item.date}</span><AdminStatus value={item.status}/><div className="ad-row-actions"><button onClick={()=>toast.success("Opening editor.")}>Edit</button><AdminMoreButton/></div></div>)}</div></article>
  }
 </div>
}
