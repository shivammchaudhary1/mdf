"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useAdminRecords } from "./use-admin-records";
import { contentView } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { slugFor, uploadMedia } from "@/services/workspace";
import { SiteMedia } from "@/components/site/site-media";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { AdminFilters,AdminMoreButton,AdminPageHeader,AdminPrimaryButton,AdminStatus } from "@/components/admin/admin-shared";
import { AdminDialog,AdminDialogActions,AdminDialogForm,AdminDialogGrid,AdminFormField } from "@/components/admin/admin-dialog";

type Kind="blog"|"gallery"|"bts"|"shows"|"team"|"work";
type ContentItem=Record<string,string>;

const cfg={
 work:{eyebrow:"Production services",title:"Our Work",description:"Manage production work categories shown on the public website.",action:"Add Work Item"},
 blog:{eyebrow:"Editorial CMS",title:"Blog & News",description:"Draft, publish and manage editorial content for the public journal.",action:"New Post"},
 gallery:{eyebrow:"Media CMS",title:"Gallery",description:"Curate the public image gallery without mixing references with production assets.",action:"Add Media"},
 bts:{eyebrow:"Media CMS",title:"Behind the Scenes",description:"Manage production-process media and on-set stories.",action:"Add BTS Item"},
 shows:{eyebrow:"External media",title:"Shows & Media",description:"Manage YouTube, Instagram and external media links shown across the site.",action:"Add Media Link"},
 team:{eyebrow:"People CMS",title:"Team",description:"Control who appears on the public team page and how their roles are presented.",action:"Add Team Member"}
} as const;

function CreateFields({kind}:{kind:Kind}){
 if(kind==="work") return <><AdminFormField label="Title" wide><input name="title" placeholder="Feature Films" autoFocus required/></AdminFormField><AdminFormField label="Category"><input name="category" defaultValue="Production"/></AdminFormField><AdminFormField label="Status"><select name="status"><option>Published</option><option>Draft</option></select></AdminFormField><AdminFormField label="Description" wide><textarea name="summary" rows={5}/></AdminFormField></>;
 if(kind==="blog") return <>
  <AdminFormField label="Post Title" wide><input name="title" placeholder="Article title" autoFocus required/></AdminFormField>
  <AdminFormField label="Category"><select name="category"><option>Casting</option><option>Production</option><option>Stories</option><option>Talent</option><option>News</option></select></AdminFormField>
  <AdminFormField label="Author"><input name="author" defaultValue="Editorial Team"/></AdminFormField>
  <AdminFormField label="Status"><select name="status"><option>Draft</option><option>Published</option></select></AdminFormField>
  <AdminFormField label="Publish Date"><input name="date" type="date"/></AdminFormField>
  <AdminFormField label="Summary" wide><textarea name="summary" rows={5} placeholder="Short article summary."/></AdminFormField>
 </>;

 if(kind==="gallery") return <>
  <AdminFormField label="Media Title" wide><input name="title" placeholder="e.g. Golden Hour Setup" autoFocus required/></AdminFormField>
  <AdminFormField label="Category"><select name="category"><option>BTS</option><option>Projects</option><option>Events</option><option>Talent</option><option>Other</option></select></AdminFormField>
  <AdminFormField label="Status"><select name="status"><option>Published</option><option>Draft</option></select></AdminFormField>
  <AdminFormField label="Date"><input name="date" type="date"/></AdminFormField>
  <AdminFormField label="Caption" wide><textarea name="summary" rows={4} placeholder="Optional image caption."/></AdminFormField>
 </>;

 if(kind==="bts") return <>
  <AdminFormField label="BTS Title" wide><input name="title" placeholder="e.g. Lighting Setup — The Last Frame" autoFocus required/></AdminFormField>
  <AdminFormField label="Category"><select name="category"><option>Production</option><option>On Set</option><option>Team</option><option>Location</option></select></AdminFormField>
  <AdminFormField label="Status"><select name="status"><option>Published</option><option>Draft</option></select></AdminFormField>
  <AdminFormField label="Date"><input name="date" type="date"/></AdminFormField>
  <AdminFormField label="Caption" wide><textarea name="summary" rows={4} placeholder="What is happening in this moment?"/></AdminFormField>
 </>;

 if(kind==="shows") return <>
  <AdminFormField label="Media Title" wide><input name="title" placeholder="e.g. Rangmanch — First Look" autoFocus required/></AdminFormField>
  <AdminFormField label="Platform"><select name="platform"><option>YouTube</option><option>Instagram</option><option>Vimeo</option><option>Other</option></select></AdminFormField>
  <AdminFormField label="Status"><select name="status"><option>Published</option><option>Scheduled</option><option>Draft</option></select></AdminFormField>
  <AdminFormField label="Publish Date"><input name="date" type="date"/></AdminFormField>
  <AdminFormField label="External URL" wide><input name="url" type="url" placeholder="https://..." required/></AdminFormField>
 </>;

 return <>
  <AdminFormField label="Full Name" wide><input name="name" placeholder="Team member name" autoFocus required/></AdminFormField>
  <AdminFormField label="Role"><input name="role" placeholder="Creative Producer"/></AdminFormField>
  <AdminFormField label="Group"><select name="group"><option>Core Team</option><option>Creative Team</option><option>Advisors</option></select></AdminFormField>
  <AdminFormField label="Status"><select name="status"><option>Published</option><option>Draft</option></select></AdminFormField>
  <AdminFormField label="Bio" wide><textarea name="summary" rows={5} placeholder="Short public bio."/></AdminFormField>
 </>;
}

function UploadBox({kind}:{kind:Kind}){
 if(kind==="shows") return null;
 return <div className="ad-dialog-upload"><span>{kind==="team"?"Profile photo":"Cover / media image"}</span><strong>Upload JPEG, PNG or WebP</strong><small>The media service optimises images and stores them using the configured storage adapter.</small><input name="cover" type="file" accept="image/jpeg,image/png,image/webp"/></div>;
}

export function AdminContentView({kind}:{kind:Kind}){
 const toast=useToast();
 const active=useAdminDashboardStore(s=>s.contentFilter);
 const setActive=useAdminDashboardStore(s=>s.setContentFilter);
 const config=cfg[kind];
 const path=`/admin/content/${kind==="bts"?"behind-the-scenes":kind==="work"?"our-work":kind}`;
 const [items,,refresh,meta,setPage]=useAdminRecords(path,contentView,true,1,20);
 const [creating,setCreating]=useState(false);
 const [editing,setEditing]=useState<ContentItem|null>(null);

 const statuses=["All",...Array.from(new Set(items.map(item=>item.status)))];
 const visible=useMemo(()=>items.filter(item=>active==="All"||item.status===active),[active,items]);

 async function persist(event:FormEvent<HTMLFormElement>,id?:string){
  event.preventDefault();const form=new FormData(event.currentTarget);const title=String(form.get(kind==="team"?"name":"title")??"").trim();
  const cover=form.get("cover");let coverMediaId:string|undefined;if(cover instanceof File&&cover.size>0)coverMediaId=(await uploadMedia(cover)).id;
  const body={title,...(!id?{slug:slugFor(title)}:{}),category:String(form.get("category")??""),role:String(form.get("role")??""),description:String(form.get("summary")??""),published:form.get("status")==="Published",status:String(form.get("status")??"Draft"),...(form.get("date")?{publishedAt:String(form.get("date"))}:{}),...(form.get("url")?{videoUrl:String(form.get("url"))}:{}),...(coverMediaId?{coverMediaId}:{}),data:{author:String(form.get("author")??""),platform:String(form.get("platform")??""),group:String(form.get("group")??"")}};
  try {await api(id?`[object Object]/${id}`:path,{method:id?"PATCH":"POST",body:JSON.stringify(body)});await refresh();setCreating(false);setEditing(null);toast.success("Content saved.");}
  catch(error){toast.error(error instanceof Error?error.message:"Unable to save content.");}
 }
 function submitNew(event:FormEvent<HTMLFormElement>){return persist(event);}
 function saveEdit(event:FormEvent<HTMLFormElement>){if(editing)return persist(event,editing.id);}

 return <div className="ad-stack">
  <AdminPageHeader eyebrow={config.eyebrow} title={config.title} description={config.description} action={<AdminPrimaryButton onClick={()=>setCreating(true)}>{config.action}</AdminPrimaryButton>}/>
  <AdminFilters values={statuses} active={active} onChange={setActive}/>

  {kind==="gallery"||kind==="bts"||kind==="team"?
   <section className="ad-content-grid">{visible.map(item=><article className="ad-content-card" key={item.id}>
    <SiteMedia src={item.image} alt={item.title??item.name??"Content"} kind={kind==="team"?"team":"gallery"} className={kind==="team"?"aspect-[4/4.5]":"aspect-[4/3]"}/>
    <div><div className="ad-content-meta"><span>{item.category??item.group??""}</span><AdminStatus value={item.status}/></div><h2>{item.title||item.name}</h2><p>{item.role||item.date||""}</p><div className="ad-content-actions"><button onClick={()=>setEditing(item)}>Edit</button><AdminMoreButton onArchive={async()=>{await api(`${path}/${item.id}`,{method:"DELETE"});await refresh();}}/></div></div>
   </article>)}</section>
   :
   <article className="ad-card ad-table-card"><div className="ad-table ad-content-table"><div className="ad-table-head"><span>Title</span><span>Category / Platform</span><span>Date</span><span>Status</span><span></span></div>{visible.map(item=><div className="ad-table-row" key={item.id}><div><strong>{item.title}</strong><span>{item.author??""}</span></div><span>{item.category||item.platform}</span><span>{item.date}</span><AdminStatus value={item.status}/><div className="ad-row-actions"><button onClick={()=>setEditing(item)}>Edit</button><AdminMoreButton onArchive={async()=>{await api(`${path}/${item.id}`,{method:"DELETE"});await refresh();}}/></div></div>)}</div></article>
  }

  <PaginationControls meta={meta} onPage={setPage}/>

  <AdminDialog open={creating} onClose={()=>setCreating(false)} eyebrow={config.eyebrow} title={config.action} description={`Create a new ${config.title.toLowerCase()} item without leaving this workspace.`} width="wide">
    <AdminDialogForm onSubmit={submitNew}>
      <AdminDialogGrid><CreateFields kind={kind}/></AdminDialogGrid>
      <UploadBox kind={kind}/>
      <AdminDialogActions onCancel={()=>setCreating(false)} primaryLabel={config.action}/>
    </AdminDialogForm>
  </AdminDialog>

  <AdminDialog open={!!editing} onClose={()=>setEditing(null)} eyebrow="Edit content" title={editing?.title||editing?.name||config.title} description="Update this CMS item in place. Published changes are reflected on the public website." width="wide">
   {editing&&<AdminDialogForm onSubmit={saveEdit}>
    <AdminDialogGrid>
      <AdminFormField label={kind==="team"?"Full Name":"Title"} wide><input name={kind==="team"?"name":"title"} defaultValue={kind==="team"?editing.name:editing.title} required/></AdminFormField>
      {kind==="team"&&<><AdminFormField label="Role"><input name="role" defaultValue={editing.role}/></AdminFormField><AdminFormField label="Group"><select name="group" defaultValue={editing.group}><option>Core Team</option><option>Creative Team</option><option>Advisors</option></select></AdminFormField></>}
      {(kind==="gallery"||kind==="bts"||kind==="blog"||kind==="work")&&<AdminFormField label="Category"><input name="category" defaultValue={editing.category}/></AdminFormField>}
      {kind==="shows"&&<AdminFormField label="Platform"><select name="platform" defaultValue={editing.platform}><option>YouTube</option><option>Instagram</option><option>Vimeo</option><option>Other</option></select></AdminFormField>}
      {kind==="blog"&&<AdminFormField label="Author"><input name="author" defaultValue={editing.author}/></AdminFormField>}
      <AdminFormField label="Status"><select name="status" defaultValue={editing.status}><option>Published</option><option>Draft</option><option>Scheduled</option></select></AdminFormField>
      {kind!=="team"&&<AdminFormField label="Date"><input name="date" defaultValue={editing.date}/></AdminFormField>}
      {kind==="shows"&&<AdminFormField label="External URL" wide><input name="url" type="url" defaultValue={editing.url}/></AdminFormField>}
      {kind!=="shows"&&<AdminFormField label="Replace Image" wide><input name="cover" type="file" accept="image/jpeg,image/png,image/webp"/></AdminFormField>}
      <AdminFormField label="Notes / Summary" wide><textarea name="summary" rows={4} defaultValue={editing.summary}/></AdminFormField>
    </AdminDialogGrid>
    <AdminDialogActions onCancel={()=>setEditing(null)} primaryLabel="Save Changes"/>
   </AdminDialogForm>}
  </AdminDialog>
 </div>
}
