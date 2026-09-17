"use client";

import { useMemo, useState, type FormEvent } from "react";
import data from "@/data/admin-dashboard.json";
import { SiteMedia } from "@/components/site/site-media";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { AdminFilters,AdminPageHeader,AdminPrimaryButton,AdminStatus } from "@/components/admin/admin-shared";
import { AdminDialog,AdminDialogActions,AdminDialogForm,AdminDialogGrid,AdminFormField } from "@/components/admin/admin-dialog";

type Project = (typeof data.projects)[number] & {
  location?: string;
  summary?: string;
};

export function AdminProjectsView(){
 const toast=useToast();
 const active=useAdminDashboardStore(s=>s.projectFilter);
 const setActive=useAdminDashboardStore(s=>s.setProjectFilter);
 const [projects,setProjects]=useState<Project[]>([...data.projects]);
 const [creating,setCreating]=useState(false);
 const [editing,setEditing]=useState<Project|null>(null);

 const visible=useMemo(()=>projects.filter(p=>active==="All"||p.status===active),[active,projects]);

 function createProject(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const form=new FormData(event.currentTarget);
  const title=String(form.get("title")??"").trim();
  if(!title){toast.error("Project title is required.");return}
  const project:Project={
    id:`project-${Date.now()}`,
    title,
    type:String(form.get("type")??"Short Film"),
    status:String(form.get("status")??"Development"),
    applications:0,
    team:0,
    updated:"Just now",
    image:"",
    location:String(form.get("location")??""),
    summary:String(form.get("summary")??"")
  };
  setProjects(current=>[project,...current]);
  setCreating(false);
  toast.success(`${title} added to the project UI.`);
 }

 function saveProject(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!editing)return;
  const form=new FormData(event.currentTarget);
  const updated:Project={...editing,title:String(form.get("title")??editing.title),type:String(form.get("type")??editing.type),status:String(form.get("status")??editing.status),location:String(form.get("location")??editing.location??""),summary:String(form.get("summary")??editing.summary??""),updated:"Just now"};
  setProjects(current=>current.map(item=>item.id===editing.id?updated:item));
  setEditing(null);
  toast.success("Project changes saved in the UI.");
 }

 return <div className="ad-stack">
  <AdminPageHeader eyebrow="Production management" title="Projects" description="Manage the productions that power casting, content and the public website." action={<AdminPrimaryButton onClick={()=>setCreating(true)}>New Project</AdminPrimaryButton>}/>
  <AdminFilters values={["All","Development","Pre-production","In Production","Completed"]} active={active} onChange={setActive}/>
  <section className="ad-project-grid">{visible.map(p=><article className="ad-project-card" key={p.id}>
    <SiteMedia src={p.image} alt={p.title} kind="project" className="aspect-[16/8]"/>
    <div className="ad-project-body">
      <div className="ad-project-meta"><span>{p.type}</span><AdminStatus value={p.status}/></div>
      <h2>{p.title}</h2>
      <div className="ad-project-numbers"><div><strong>{p.applications}</strong><span>Applications</span></div><div><strong>{p.team}</strong><span>Team</span></div></div>
      <div className="ad-project-footer"><span>Updated {p.updated}</span><button onClick={()=>setEditing(p)}>Manage →</button></div>
    </div>
  </article>)}</section>

  <AdminDialog open={creating} onClose={()=>setCreating(false)} eyebrow="Create" title="New Project" description="Add a project shell now; backend persistence will be connected later." width="wide">
    <AdminDialogForm onSubmit={createProject}>
      <AdminDialogGrid>
        <AdminFormField label="Project Title" wide><input name="title" placeholder="e.g. Midnight Stories" autoFocus required/></AdminFormField>
        <AdminFormField label="Project Type"><select name="type" defaultValue="Short Film"><option>Short Film</option><option>Feature Film</option><option>Web Series</option><option>Music Video</option><option>Brand Film</option><option>Documentary</option></select></AdminFormField>
        <AdminFormField label="Status"><select name="status" defaultValue="Development"><option>Development</option><option>Pre-production</option><option>In Production</option><option>Completed</option></select></AdminFormField>
        <AdminFormField label="Location"><input name="location" placeholder="Indore / Mumbai / Remote"/></AdminFormField>
        <AdminFormField label="Start Date"><input name="startDate" type="date"/></AdminFormField>
        <AdminFormField label="Short Summary" wide><textarea name="summary" rows={4} placeholder="A short internal/public project summary."/></AdminFormField>
      </AdminDialogGrid>
      <div className="ad-dialog-upload"><span>Project cover</span><strong>Image upload will connect to S3 later</strong><small>For now the standard project placeholder is used.</small></div>
      <AdminDialogActions onCancel={()=>setCreating(false)} primaryLabel="Create Project"/>
    </AdminDialogForm>
  </AdminDialog>

  <AdminDialog open={!!editing} onClose={()=>setEditing(null)} eyebrow="Manage" title={editing?.title??"Project"} description="Update the project metadata without leaving this page." width="wide">
    {editing&&<AdminDialogForm onSubmit={saveProject}>
      <AdminDialogGrid>
        <AdminFormField label="Project Title" wide><input name="title" defaultValue={editing.title} required/></AdminFormField>
        <AdminFormField label="Project Type"><select name="type" defaultValue={editing.type}><option>Short Film</option><option>Feature Film</option><option>Web Series</option><option>Music Video</option><option>Brand Film</option><option>Documentary</option></select></AdminFormField>
        <AdminFormField label="Status"><select name="status" defaultValue={editing.status}><option>Development</option><option>Pre-production</option><option>In Production</option><option>Completed</option></select></AdminFormField>
        <AdminFormField label="Location"><input name="location" defaultValue={editing.location??""}/></AdminFormField>
        <AdminFormField label="Applications"><input value={editing.applications} disabled/></AdminFormField>
        <AdminFormField label="Internal Summary" wide><textarea name="summary" rows={4} defaultValue={editing.summary??""}/></AdminFormField>
      </AdminDialogGrid>
      <AdminDialogActions onCancel={()=>setEditing(null)} primaryLabel="Save Changes"/>
    </AdminDialogForm>}
  </AdminDialog>
 </div>
}
