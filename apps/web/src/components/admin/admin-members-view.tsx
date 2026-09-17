"use client";
import { useMemo, useState } from "react";
import data from "@/data/admin-dashboard.json";
import { SiteMedia } from "@/components/site/site-media";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminMoreButton,AdminPageHeader,AdminPrimaryButton,AdminSearch,AdminStatus } from "@/components/admin/admin-shared";

export function AdminMembersView(){
 const toast=useToast(),active=useAdminDashboardStore(s=>s.memberFilter),setActive=useAdminDashboardStore(s=>s.setMemberFilter);const[query,setQuery]=useState("");
 const visible=useMemo(()=>data.members.filter(m=>(active==="All"||(active==="Verified"?m.verified:active==="Unverified"?!m.verified:m.status===active))&&`${m.name} ${m.email} ${m.role} ${m.city}`.toLowerCase().includes(query.toLowerCase())),[active,query]);
 return <div className="ad-stack"><AdminPageHeader eyebrow="Community management" title="Members & Talent" description="Search, verify and review the people who make up the M. Dadu Films community." action={<AdminPrimaryButton onClick={()=>toast.success("Member creation UI ready for backend integration.")}>Add Member</AdminPrimaryButton>}/><section className="ad-toolbar"><AdminFilters values={["All","Verified","Unverified","Needs Review"]} active={active} onChange={setActive}/><AdminSearch value={query} onChange={setQuery} placeholder="Search members"/></section><article className="ad-card ad-table-card"><div className="ad-table ad-members-table"><div className="ad-table-head"><span>Member</span><span>Category</span><span>Location</span><span>Profile</span><span>Status</span><span></span></div>{visible.map(m=><div key={m.id} className="ad-table-row"><div className="ad-person-cell"><SiteMedia src={m.image} alt={m.name} kind="team" className="h-10 w-10 shrink-0 rounded-full"/><div><strong>{m.name}</strong><span>{m.email}</span></div></div><span>{m.role}</span><span>{m.city}</span><div className="ad-completion"><strong>{m.completion}%</strong><i><b style={{width:`${m.completion}%`}}/></i></div><div className="ad-member-status">{m.verified?<span className="verified">✓ Verified</span>:<AdminStatus value={m.status}/>}</div><AdminMoreButton/></div>)}</div>{!visible.length&&<div className="ad-empty">No members match this filter.</div>}</article></div>
}
