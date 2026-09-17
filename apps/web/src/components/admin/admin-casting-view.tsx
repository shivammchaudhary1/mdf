"use client";

import { useMemo, useState, type FormEvent } from "react";
import data from "@/data/admin-dashboard.json";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminMoreButton,AdminPageHeader,AdminPrimaryButton,AdminStatus } from "@/components/admin/admin-shared";
import { AdminDialog,AdminDialogActions,AdminDialogForm,AdminDialogGrid,AdminFormField } from "@/components/admin/admin-dialog";

type Casting=(typeof data.castings)[number] & { age?:string; gender?:string; compensation?:string; description?:string };

const demoApplicants=[
 {name:"Aarav Mehta",status:"Under Review"},
 {name:"Meera Joshi",status:"Shortlisted"},
 {name:"Kabir Verma",status:"Submitted"}
];

export function AdminCastingView(){
 const toast=useToast();
 const active=useAdminDashboardStore(s=>s.castingFilter);
 const setActive=useAdminDashboardStore(s=>s.setCastingFilter);
 const [castings,setCastings]=useState<Casting[]>([...data.castings]);
 const [creating,setCreating]=useState(false);
 const [selected,setSelected]=useState<Casting|null>(null);

 const visible=useMemo(()=>castings.filter(c=>active==="All"||c.status===active),[active,castings]);

 function createCasting(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const form=new FormData(event.currentTarget);
  const title=String(form.get("title")??"").trim();
  if(!title){toast.error("Casting title is required.");return}
  const item:Casting={
    id:`casting-${Date.now()}`,
    title,
    project:String(form.get("project")??"Independent Production"),
    category:String(form.get("category")??"Acting"),
    location:String(form.get("location")??""),
    deadline:String(form.get("deadline")??""),
    applications:0,
    status:String(form.get("status")??"Draft"),
    age:String(form.get("age")??""),
    gender:String(form.get("gender")??"Any"),
    compensation:String(form.get("compensation")??"Paid"),
    description:String(form.get("description")??"")
  };
  setCastings(current=>[item,...current]);
  setCreating(false);
  toast.success(`${title} added to casting calls.`);
 }

 return <div className="ad-stack">
  <AdminPageHeader eyebrow="Opportunity management" title="Casting Calls" description="Create, publish and monitor every open role from one focused workspace." action={<AdminPrimaryButton onClick={()=>setCreating(true)}>New Casting Call</AdminPrimaryButton>}/>
  <AdminFilters values={["All","Open","Closing Soon","Draft"]} active={active} onChange={setActive}/>

  <section className="ad-casting-grid">{visible.map(c=><article className="ad-casting-card" key={c.id}>
    <div className="ad-casting-top"><span>{c.category}</span><AdminStatus value={c.status}/></div>
    <h2>{c.title}</h2><p>{c.project}</p>
    <div className="ad-casting-detail"><div><span>Location</span><strong>{c.location||"—"}</strong></div><div><span>Deadline</span><strong>{c.deadline||"—"}</strong></div><div><span>Applications</span><strong>{c.applications}</strong></div></div>
    <div className="ad-casting-actions"><button onClick={()=>setSelected(c)}>View Applicants</button><AdminMoreButton/></div>
  </article>)}</section>

  <AdminDialog open={creating} onClose={()=>setCreating(false)} eyebrow="Create opportunity" title="New Casting Call" description="Add the role details now. Publishing to the backend comes after UI approval." width="wide">
    <AdminDialogForm onSubmit={createCasting}>
      <AdminDialogGrid>
        <AdminFormField label="Casting Title" wide><input name="title" placeholder="e.g. Male Supporting Role" autoFocus required/></AdminFormField>
        <AdminFormField label="Project"><input name="project" placeholder="Project name" required/></AdminFormField>
        <AdminFormField label="Category"><select name="category"><option>Acting</option><option>Crew</option><option>Commercial</option><option>Voice</option><option>Writing</option></select></AdminFormField>
        <AdminFormField label="Location"><input name="location" placeholder="Indore / Mumbai / Remote"/></AdminFormField>
        <AdminFormField label="Deadline"><input name="deadline" type="date"/></AdminFormField>
        <AdminFormField label="Age Range"><input name="age" placeholder="e.g. 22–30"/></AdminFormField>
        <AdminFormField label="Gender"><select name="gender"><option>Any</option><option>Male</option><option>Female</option></select></AdminFormField>
        <AdminFormField label="Compensation"><select name="compensation"><option>Paid</option><option>Project based</option><option>Unpaid</option></select></AdminFormField>
        <AdminFormField label="Initial Status"><select name="status"><option>Draft</option><option>Open</option><option>Closing Soon</option></select></AdminFormField>
        <AdminFormField label="Role Description" wide><textarea name="description" rows={5} placeholder="What are you looking for?"/></AdminFormField>
      </AdminDialogGrid>
      <AdminDialogActions onCancel={()=>setCreating(false)} primaryLabel="Create Casting Call"/>
    </AdminDialogForm>
  </AdminDialog>

  <AdminDialog open={!!selected} onClose={()=>setSelected(null)} eyebrow="Applicants" title={selected?.title??"Casting Call"} description={selected?`${selected.project} · ${selected.location}`:""} width="wide">
    <div className="ad-applicant-panel">
      <div className="ad-applicant-summary"><span>Total applications</span><strong>{selected?.applications??0}</strong></div>
      <div className="ad-applicant-demo-list">
        {demoApplicants.map(person=><div key={person.name}><div className="ad-mini-avatar">{person.name[0]}</div><div><strong>{person.name}</strong><span>Demo application preview</span></div><AdminStatus value={person.status}/><button type="button" onClick={()=>toast.success(`Opening ${person.name}'s application.`)}>Review</button></div>)}
      </div>
      <p className="ad-dialog-footnote">This is temporary reference data. The final list will come from the Applications API filtered by casting ID.</p>
      <AdminDialogActions onCancel={()=>setSelected(null)} primaryLabel="Open Applications Page" primaryType="button" onPrimary={()=>{setSelected(null);window.location.assign("/admin/applications")}}/>
    </div>
  </AdminDialog>
 </div>
}
