"use client";
import { useMemo } from "react";
import data from "@/data/admin-dashboard.json";
import { SiteMedia } from "@/components/site/site-media";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminPageHeader,AdminPrimaryButton,AdminStatus } from "@/components/admin/admin-shared";

export function AdminProjectsView(){
 const toast=useToast(),active=useAdminDashboardStore(s=>s.projectFilter),setActive=useAdminDashboardStore(s=>s.setProjectFilter);const visible=useMemo(()=>data.projects.filter(p=>active==="All"||p.status===active),[active]);
 return <div className="ad-stack"><AdminPageHeader eyebrow="Production management" title="Projects" description="Manage the productions that power casting, content and the public website." action={<AdminPrimaryButton onClick={()=>toast.success("New project form UI ready for backend wiring.")}>New Project</AdminPrimaryButton>}/><AdminFilters values={["All","Development","Pre-production","In Production","Completed"]} active={active} onChange={setActive}/><section className="ad-project-grid">{visible.map(p=><article className="ad-project-card" key={p.id}><SiteMedia src={p.image} alt={p.title} kind="project" className="aspect-[16/8]"/><div className="ad-project-body"><div className="ad-project-meta"><span>{p.type}</span><AdminStatus value={p.status}/></div><h2>{p.title}</h2><div className="ad-project-numbers"><div><strong>{p.applications}</strong><span>Applications</span></div><div><strong>{p.team}</strong><span>Team</span></div></div><div className="ad-project-footer"><span>Updated {p.updated}</span><button onClick={()=>toast.success(`Opening ${p.title} editor.`)}>Manage →</button></div></div></article>)}</section></div>
}
