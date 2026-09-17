"use client";

import { useMemo, useState, type FormEvent } from "react";
import data from "@/data/admin-dashboard.json";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminMoreButton,AdminPageHeader,AdminSearch,AdminStatus } from "@/components/admin/admin-shared";
import { AdminDialog,AdminDialogActions,AdminDialogForm,AdminDialogGrid,AdminFormField } from "@/components/admin/admin-dialog";

type Application=(typeof data.applications)[number] & { notes?:string };

export function AdminApplicationsView(){
 const toast=useToast();
 const active=useAdminDashboardStore(s=>s.applicationFilter);
 const setActive=useAdminDashboardStore(s=>s.setApplicationFilter);
 const [query,setQuery]=useState("");
 const [applications,setApplications]=useState<Application[]>([...data.applications]);
 const [selected,setSelected]=useState<Application|null>(null);

 const visible=useMemo(()=>applications.filter(a=>(active==="All"||a.status===active)&&`${a.applicant} ${a.role} ${a.project}`.toLowerCase().includes(query.toLowerCase())),[active,query,applications]);

 function saveReview(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!selected)return;
  const form=new FormData(event.currentTarget);
  const status=String(form.get("status")??selected.status);
  const notes=String(form.get("notes")??"");
  setApplications(current=>current.map(item=>item.id===selected.id?{...item,status,notes}:item));
  toast.success(`${selected.applicant} updated to ${status}.`);
  setSelected(null);
 }

 function quickStatus(status:string){
  if(!selected)return;
  setApplications(current=>current.map(item=>item.id===selected.id?{...item,status}:item));
  toast.success(`${selected.applicant} updated to ${status}.`);
  setSelected(null);
 }

 return <div className="ad-stack">
  <AdminPageHeader eyebrow="Casting workflow" title="Applications" description="Review submissions, shortlist talent and keep every casting decision organized."/>
  <section className="ad-toolbar"><AdminFilters values={["All","Submitted","Under Review","Shortlisted","Selected","Rejected"]} active={active} onChange={setActive}/><AdminSearch value={query} onChange={setQuery} placeholder="Search applicant or project"/></section>

  <article className="ad-card ad-table-card">
   <div className="ad-table ad-applications-table">
    <div className="ad-table-head"><span>Applicant</span><span>Role / Project</span><span>Applied</span><span>City</span><span>Status</span><span></span></div>
    {visible.map(a=><div key={a.id} className="ad-table-row">
      <div><strong>{a.applicant}</strong><span>{a.city}</span></div>
      <div><strong>{a.role}</strong><span>{a.project}</span></div>
      <span>{a.applied}</span><span>{a.city}</span><AdminStatus value={a.status}/>
      <div className="ad-row-actions"><button onClick={()=>setSelected(a)}>Review</button><AdminMoreButton/></div>
    </div>)}
   </div>
  </article>

  <AdminDialog open={!!selected} onClose={()=>setSelected(null)} eyebrow="Application review" title={selected?.applicant??"Applicant"} description={selected?`${selected.role} · ${selected.project}`:""} width="wide">
   {selected&&<AdminDialogForm onSubmit={saveReview}>
    <div className="ad-review-summary">
      <div><span>Applicant</span><strong>{selected.applicant}</strong></div>
      <div><span>Role</span><strong>{selected.role}</strong></div>
      <div><span>Project</span><strong>{selected.project}</strong></div>
      <div><span>Applied</span><strong>{selected.applied}</strong></div>
    </div>

    <AdminDialogGrid>
      <AdminFormField label="Application Status"><select name="status" defaultValue={selected.status}><option>Submitted</option><option>Under Review</option><option>Shortlisted</option><option>Selected</option><option>Rejected</option></select></AdminFormField>
      <AdminFormField label="Applicant City"><input value={selected.city} disabled/></AdminFormField>
      <AdminFormField label="Internal Review Notes" wide><textarea name="notes" rows={5} defaultValue={selected.notes??""} placeholder="Add notes for the casting team. These are not public."/></AdminFormField>
    </AdminDialogGrid>

    <div className="ad-review-quick">
      <span>Quick decision</span>
      <div><button type="button" className="reject" onClick={()=>quickStatus("Rejected")}>Reject</button><button type="button" onClick={()=>quickStatus("Shortlisted")}>Shortlist</button><button type="button" className="select" onClick={()=>quickStatus("Selected")}>Select</button></div>
    </div>
    <AdminDialogActions onCancel={()=>setSelected(null)} primaryLabel="Save Review"/>
   </AdminDialogForm>}
  </AdminDialog>
 </div>
}
