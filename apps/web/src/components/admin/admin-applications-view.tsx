"use client";
import { useMemo, useState } from "react";
import data from "@/data/admin-dashboard.json";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminMoreButton,AdminPageHeader,AdminSearch,AdminStatus } from "@/components/admin/admin-shared";

export function AdminApplicationsView(){
 const toast=useToast(),active=useAdminDashboardStore(s=>s.applicationFilter),setActive=useAdminDashboardStore(s=>s.setApplicationFilter);const[query,setQuery]=useState("");
 const visible=useMemo(()=>data.applications.filter(a=>(active==="All"||a.status===active)&&`${a.applicant} ${a.role} ${a.project}`.toLowerCase().includes(query.toLowerCase())),[active,query]);
 return <div className="ad-stack"><AdminPageHeader eyebrow="Casting workflow" title="Applications" description="Review submissions, shortlist talent and keep every casting decision organized."/><section className="ad-toolbar"><AdminFilters values={["All","Submitted","Under Review","Shortlisted","Selected","Rejected"]} active={active} onChange={setActive}/><AdminSearch value={query} onChange={setQuery} placeholder="Search applicant or project"/></section><article className="ad-card ad-table-card"><div className="ad-table ad-applications-table"><div className="ad-table-head"><span>Applicant</span><span>Role / Project</span><span>Applied</span><span>City</span><span>Status</span><span></span></div>{visible.map(a=><div key={a.id} className="ad-table-row"><div><strong>{a.applicant}</strong><span>{a.city}</span></div><div><strong>{a.role}</strong><span>{a.project}</span></div><span>{a.applied}</span><span>{a.city}</span><AdminStatus value={a.status}/><div className="ad-row-actions"><button onClick={()=>toast.success(`${a.applicant} moved to review queue.`)}>Review</button><AdminMoreButton/></div></div>)}</div></article></div>
}
