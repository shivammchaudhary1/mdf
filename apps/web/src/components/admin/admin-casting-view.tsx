"use client";
import { useMemo } from "react";
import data from "@/data/admin-dashboard.json";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminMoreButton,AdminPageHeader,AdminPrimaryButton,AdminStatus } from "@/components/admin/admin-shared";

export function AdminCastingView(){
 const toast=useToast(),active=useAdminDashboardStore(s=>s.castingFilter),setActive=useAdminDashboardStore(s=>s.setCastingFilter);const visible=useMemo(()=>data.castings.filter(c=>active==="All"||c.status===active),[active]);
 return <div className="ad-stack"><AdminPageHeader eyebrow="Opportunity management" title="Casting Calls" description="Create, publish and monitor every open role from one focused workspace." action={<AdminPrimaryButton onClick={()=>toast.success("Casting creation UI ready for backend wiring.")}>New Casting Call</AdminPrimaryButton>}/><AdminFilters values={["All","Open","Closing Soon","Draft"]} active={active} onChange={setActive}/><section className="ad-casting-grid">{visible.map(c=><article className="ad-casting-card" key={c.id}><div className="ad-casting-top"><span>{c.category}</span><AdminStatus value={c.status}/></div><h2>{c.title}</h2><p>{c.project}</p><div className="ad-casting-detail"><div><span>Location</span><strong>{c.location}</strong></div><div><span>Deadline</span><strong>{c.deadline}</strong></div><div><span>Applications</span><strong>{c.applications}</strong></div></div><div className="ad-casting-actions"><button onClick={()=>toast.success(`Opening applicants for ${c.title}.`)}>View Applicants</button><AdminMoreButton/></div></article>)}</section></div>
}
