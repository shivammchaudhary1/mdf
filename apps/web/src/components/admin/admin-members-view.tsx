"use client";

import { useMemo, useState, type FormEvent } from "react";
import data from "@/data/admin-dashboard.json";
import { SiteMedia } from "@/components/site/site-media";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminMoreButton,AdminPageHeader,AdminPrimaryButton,AdminSearch,AdminStatus } from "@/components/admin/admin-shared";
import { AdminDialog,AdminDialogActions,AdminDialogForm,AdminDialogGrid,AdminFormField } from "@/components/admin/admin-dialog";

type Member=(typeof data.members)[number];

export function AdminMembersView(){
 const toast=useToast();
 const active=useAdminDashboardStore(s=>s.memberFilter);
 const setActive=useAdminDashboardStore(s=>s.setMemberFilter);
 const [query,setQuery]=useState("");
 const [members,setMembers]=useState<Member[]>([...data.members]);
 const [creating,setCreating]=useState(false);
 const [selected,setSelected]=useState<Member|null>(null);

 const visible=useMemo(()=>members.filter(m=>(active==="All"||(active==="Verified"?m.verified:active==="Unverified"?!m.verified:m.status===active))&&`${m.name} ${m.email} ${m.role} ${m.city}`.toLowerCase().includes(query.toLowerCase())),[active,query,members]);

 function addMember(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const form=new FormData(event.currentTarget);
  const name=String(form.get("name")??"").trim();
  if(!name){toast.error("Member name is required.");return}
  const member:Member={
    id:`member-${Date.now()}`,
    name,
    email:String(form.get("email")??""),
    role:String(form.get("role")??"Creative Professional"),
    city:String(form.get("city")??""),
    joined:"Just now",
    completion:20,
    verified:false,
    status:"Needs Review",
    image:""
  };
  setMembers(current=>[member,...current]);
  setCreating(false);
  toast.success(`${name} added to the member UI.`);
 }

 function toggleVerify(){
  if(!selected)return;
  setMembers(current=>current.map(m=>m.id===selected.id?{...m,verified:!m.verified,status:!m.verified?"Active":"Needs Review"}:m));
  toast.success(selected.verified?"Verification removed.":"Member verified in the UI.");
  setSelected(null);
 }

 return <div className="ad-stack">
  <AdminPageHeader eyebrow="Community management" title="Members & Talent" description="Search, verify and review the people who make up the M. Dadu Films community." action={<AdminPrimaryButton onClick={()=>setCreating(true)}>Add Member</AdminPrimaryButton>}/>
  <section className="ad-toolbar"><AdminFilters values={["All","Verified","Unverified","Needs Review"]} active={active} onChange={setActive}/><AdminSearch value={query} onChange={setQuery} placeholder="Search members"/></section>

  <article className="ad-card ad-table-card"><div className="ad-table ad-members-table">
   <div className="ad-table-head"><span>Member</span><span>Category</span><span>Location</span><span>Profile</span><span>Status</span><span></span></div>
   {visible.map(m=><div key={m.id} className="ad-table-row">
    <div className="ad-person-cell"><SiteMedia src={m.image} alt={m.name} kind="team" className="h-10 w-10 shrink-0 rounded-full"/><div><strong>{m.name}</strong><span>{m.email}</span></div></div>
    <span>{m.role}</span><span>{m.city}</span>
    <div className="ad-completion"><strong>{m.completion}%</strong><i><b style={{width:`${m.completion}%`}}/></i></div>
    <div className="ad-member-status">{m.verified?<span className="verified">✓ Verified</span>:<AdminStatus value={m.status}/>}</div>
    <AdminMoreButton onEdit={()=>setSelected(m)}/>
   </div>)}
  </div>{!visible.length&&<div className="ad-empty">No members match this filter.</div>}</article>

  <AdminDialog open={creating} onClose={()=>setCreating(false)} eyebrow="Community" title="Add Member" description="Create a temporary member record for UI review." width="wide">
    <AdminDialogForm onSubmit={addMember}>
      <AdminDialogGrid>
        <AdminFormField label="Full Name" wide><input name="name" placeholder="Full name" autoFocus required/></AdminFormField>
        <AdminFormField label="Email"><input name="email" type="email" placeholder="name@example.com" required/></AdminFormField>
        <AdminFormField label="Mobile"><input name="mobile" placeholder="+91 ..."/></AdminFormField>
        <AdminFormField label="Talent Category"><input name="role" placeholder="Actor / Writer / Crew"/></AdminFormField>
        <AdminFormField label="City"><input name="city" placeholder="Indore"/></AdminFormField>
      </AdminDialogGrid>
      <AdminDialogActions onCancel={()=>setCreating(false)} primaryLabel="Add Member"/>
    </AdminDialogForm>
  </AdminDialog>

  <AdminDialog open={!!selected} onClose={()=>setSelected(null)} eyebrow="Member review" title={selected?.name??"Member"} description={selected?`${selected.role} · ${selected.city}`:""}>
    {selected&&<div className="ad-member-review">
      <div className="ad-member-review-top"><div className="ad-avatar">{selected.name.slice(0,2).toUpperCase()}</div><div><strong>{selected.email}</strong><span>Profile completion {selected.completion}%</span></div></div>
      <div className="ad-review-summary"><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Joined</span><strong>{selected.joined}</strong></div><div><span>Verification</span><strong>{selected.verified?"Verified":"Not verified"}</strong></div></div>
      <div className="ad-dialog-actions"><button type="button" className="ad-dialog-cancel" onClick={()=>setSelected(null)}>Close</button><button type="button" className="ad-dialog-primary" onClick={toggleVerify}>{selected.verified?"Remove Verification":"Verify Member"}</button></div>
    </div>}
  </AdminDialog>
 </div>
}
