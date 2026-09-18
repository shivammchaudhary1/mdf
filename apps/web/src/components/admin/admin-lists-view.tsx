"use client";

import { useEffect, useState, type FormEvent } from "react";
import type data from "@/data/admin-dashboard.json";
import { useAdminRecords } from "./use-admin-records";
import { listView } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/toast-provider";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { AdminCollectionState,AdminPageHeader,AdminPrimaryButton,AdminMoreButton } from "@/components/admin/admin-shared";
import { AdminDialog,AdminDialogActions,AdminDialogForm,AdminDialogGrid,AdminFormField } from "@/components/admin/admin-dialog";

type TalentList=(typeof data.savedLists)[number];

export function AdminListsView(){
 const toast=useToast();
 const [lists,,refresh,meta,setPage,,loading,error]=useAdminRecords("/admin/lists",listView,true,1,20);
 const [creating,setCreating]=useState(false);
 const [selected,setSelected]=useState<TalentList|null>(null);
 const [details,setDetails]=useState<{id:string;members:{id:string;name:string}[]}|null>(null);
 useEffect(()=>{if(!selected)return;let active=true;void api<{members:{id:string;name:string}[]}>(`/admin/lists/${selected.id}`).then(result=>{if(active)setDetails({id:selected.id,members:result.members});}).catch(error=>toast.error(error.message));return()=>{active=false;};},[selected,toast]);

 async function createList(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const form=new FormData(event.currentTarget);const name=String(form.get("name")??"").trim();
  try{await api("/admin/lists",{method:"POST",body:JSON.stringify({name,purpose:String(form.get("purpose")??"")})});await refresh();setCreating(false);toast.success("Talent list created.");}
  catch(error){toast.error(error instanceof Error?error.message:"Unable to create list.");}
 }

 return <div className="ad-stack">
  <AdminPageHeader eyebrow="Talent organization" title="Saved Talent Lists" description="Build reusable shortlists for projects, casting discussions and production planning." action={<AdminPrimaryButton onClick={()=>setCreating(true)}>New Talent List</AdminPrimaryButton>}/>
  <AdminCollectionState loading={loading} error={error} empty={!lists.length} emptyText="No saved talent lists yet." onRetry={()=>void refresh()}/>
  <section className="ad-list-grid">{lists.map(list=><article className="ad-list-card" key={list.id}>
    <div className="ad-list-stack"><i>{list.members}</i><i/><i/></div>
    <div><p className="ad-kicker">Saved list</p><h2>{list.name}</h2><span>{list.members} members · Updated {list.updated}</span><small>Owner: {list.owner}</small></div>
    <div className="ad-list-actions"><button onClick={()=>setSelected(list)}>Open List</button><AdminMoreButton/></div>
  </article>)}</section><PaginationControls meta={meta} onPage={setPage}/>

  <AdminDialog open={creating} onClose={()=>setCreating(false)} eyebrow="Talent organization" title="New Talent List" description="Create a reusable shortlist for casting, projects or production planning.">
    <AdminDialogForm onSubmit={createList}>
      <AdminDialogGrid>
        <AdminFormField label="List Name" wide><input name="name" placeholder="e.g. Lead Actor Options" autoFocus required/></AdminFormField>
        <AdminFormField label="Owner"><input name="owner" value="Current account" readOnly/></AdminFormField>
        <AdminFormField label="Purpose"><input name="purpose" placeholder="Casting / Project / Crew"/></AdminFormField>
      </AdminDialogGrid>
      <AdminDialogActions onCancel={()=>setCreating(false)} primaryLabel="Create List"/>
    </AdminDialogForm>
  </AdminDialog>

  <AdminDialog open={!!selected} onClose={()=>setSelected(null)} eyebrow="Saved talent list" title={selected?.name??"Talent List"} description="Saved talent currently attached to this list">
    {selected&&<div className="ad-list-preview"><div className="ad-list-preview-number">{selected.members}</div><p>Members currently saved to this list.</p><div className="ad-dialog-empty"><strong>{details?.id===selected.id?(details.members.map(member=>member.name).join(", ")||"No members saved yet."):"Loading saved members…"}</strong><span>Saved membership is loaded from your talent list.</span></div><AdminDialogActions onCancel={()=>setSelected(null)} primaryLabel="Add Talent" primaryType="button" onPrimary={()=>toast.info("Talent selection is not available in this screen yet.")}/></div>}
  </AdminDialog>
 </div>
}
