"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type data from "@/data/admin-dashboard.json";
import { useAdminRecords } from "./use-admin-records";
import { castingView } from "@/services/admin-workspace";
import { allPages, slugFor, type ApplicationRecord } from "@/services/workspace";
import type { ProjectRecord } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminMoreButton,AdminPageHeader,AdminPrimaryButton,AdminStatus } from "@/components/admin/admin-shared";
import { AdminDialog,AdminDialogActions,AdminDialogForm,AdminDialogGrid,AdminFormField } from "@/components/admin/admin-dialog";

type Casting=(typeof data.castings)[number] & { age?:string; gender?:string; compensation?:string; description?:string };

export function AdminCastingView(){
 const toast=useToast();
 const active=useAdminDashboardStore(s=>s.castingFilter);
 const setActive=useAdminDashboardStore(s=>s.setCastingFilter);
 const [castings,,refresh]=useAdminRecords("/admin/castings",castingView);
 const [creating,setCreating]=useState(false);
 const [selected,setSelected]=useState<Casting|null>(null);
 const [applicants,setApplicants]=useState<ApplicationRecord[]>([]);
 useEffect(()=>{if(!selected)return;let active=true;void allPages<ApplicationRecord>(`/admin/applications?opportunityId=${selected.id}`).then(items=>{if(active)setApplicants(items);}).catch(error=>toast.error(error.message));return()=>{active=false;};},[selected,toast]);


 const visible=useMemo(()=>castings.filter(c=>active==="All"||c.status===active),[active,castings]);

 async function createCasting(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const form=new FormData(event.currentTarget);const title=String(form.get("title")??"").trim();
  try {
   const projectName=String(form.get("project")??"").trim();const projects=await allPages<ProjectRecord>(`/admin/projects?search=${encodeURIComponent(projectName)}`);const project=projects.find(p=>p.title.toLowerCase()===projectName.toLowerCase());if(!project)throw new Error("Choose the exact name of an existing project.");
   const age=String(form.get("age")??"").trim();const range=age.match(/^(\d+)\s*[-–]\s*(\d+)$/);if(age&&!range)throw new Error("Use an age range such as 22–30.");
   const status=String(form.get("status"));const body={title,slug:slugFor(title),projectId:project._id,role:title,category:String(form.get("category")??""),location:String(form.get("location")??""),...(form.get("deadline")?{deadline:String(form.get("deadline"))}:{}),...(range?{ageMin:Number(range[1]),ageMax:Number(range[2])}:{}),gender:String(form.get("gender")??"Any"),compensation:String(form.get("compensation")??""),description:String(form.get("description")??""),status:status==="Draft"?"Draft":"Open",published:status!=="Draft"};
   await api("/admin/castings",{method:"POST",body:JSON.stringify(body)});await refresh();setCreating(false);toast.success("Casting call saved.");
  }catch(error){toast.error(error instanceof Error?error.message:"Unable to save casting.");}
 }

 return <div className="ad-stack">
  <AdminPageHeader eyebrow="Opportunity management" title="Casting Calls" description="Create, publish and monitor every open role from one focused workspace." action={<AdminPrimaryButton onClick={()=>setCreating(true)}>New Casting Call</AdminPrimaryButton>}/>
  <AdminFilters values={["All","Open","Closing Soon","Draft"]} active={active} onChange={setActive}/>

  <section className="ad-casting-grid">{visible.map(c=><article className="ad-casting-card" key={c.id}>
    <div className="ad-casting-top"><span>{c.category}</span><AdminStatus value={c.status}/></div>
    <h2>{c.title}</h2><p>{c.project}</p>
    <div className="ad-casting-detail"><div><span>Location</span><strong>{c.location||"—"}</strong></div><div><span>Deadline</span><strong>{c.deadline||"—"}</strong></div><div><span>Applications</span><strong>{c.applications}</strong></div></div>
    <div className="ad-casting-actions"><button onClick={()=>setSelected(c)}>View Applicants</button><AdminMoreButton onArchive={async()=>{await api(`/admin/castings/${c.id}`,{method:"DELETE"});await refresh();}}/></div>
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
        {applicants.map(person=><div key={person.applicant.name}><div className="ad-mini-avatar">{person.applicant.name[0]}</div><div><strong>{person.applicant.name}</strong><span>Application submission</span></div><AdminStatus value={person.status}/><button type="button" onClick={()=>window.location.assign("/admin/applications")}>Review</button></div>)}
      </div>
      <p className="ad-dialog-footnote">This is temporary reference data. The final list will come from the Applications API filtered by casting ID.</p>
      <AdminDialogActions onCancel={()=>setSelected(null)} primaryLabel="Open Applications Page" primaryType="button" onPrimary={()=>{setSelected(null);window.location.assign("/admin/applications")}}/>
    </div>
  </AdminDialog>
 </div>
}
