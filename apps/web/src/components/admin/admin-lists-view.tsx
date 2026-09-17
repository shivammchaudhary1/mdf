"use client";

import { useState, type FormEvent } from "react";
import data from "@/data/admin-dashboard.json";
import { useToast } from "@/components/ui/toast-provider";
import { AdminPageHeader,AdminPrimaryButton,AdminMoreButton } from "@/components/admin/admin-shared";
import { AdminDialog,AdminDialogActions,AdminDialogForm,AdminDialogGrid,AdminFormField } from "@/components/admin/admin-dialog";

type TalentList=(typeof data.savedLists)[number];

export function AdminListsView(){
 const toast=useToast();
 const [lists,setLists]=useState<TalentList[]>([...data.savedLists]);
 const [creating,setCreating]=useState(false);
 const [selected,setSelected]=useState<TalentList|null>(null);

 function createList(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const form=new FormData(event.currentTarget);
  const name=String(form.get("name")??"").trim();
  if(!name){toast.error("List name is required.");return}
  const list:TalentList={id:`list-${Date.now()}`,name,members:0,updated:"Just now",owner:String(form.get("owner")??"Shivam")};
  setLists(current=>[list,...current]);
  setCreating(false);
  toast.success(`${name} created.`);
 }

 return <div className="ad-stack">
  <AdminPageHeader eyebrow="Talent organization" title="Saved Talent Lists" description="Build reusable shortlists for projects, casting discussions and production planning." action={<AdminPrimaryButton onClick={()=>setCreating(true)}>New Talent List</AdminPrimaryButton>}/>
  <section className="ad-list-grid">{lists.map(list=><article className="ad-list-card" key={list.id}>
    <div className="ad-list-stack"><i>{list.members}</i><i/><i/></div>
    <div><p className="ad-kicker">Saved list</p><h2>{list.name}</h2><span>{list.members} members · Updated {list.updated}</span><small>Owner: {list.owner}</small></div>
    <div className="ad-list-actions"><button onClick={()=>setSelected(list)}>Open List</button><AdminMoreButton/></div>
  </article>)}</section>

  <AdminDialog open={creating} onClose={()=>setCreating(false)} eyebrow="Talent organization" title="New Talent List" description="Create a shortlist container now and add real members after backend integration.">
    <AdminDialogForm onSubmit={createList}>
      <AdminDialogGrid>
        <AdminFormField label="List Name" wide><input name="name" placeholder="e.g. Lead Actor Options" autoFocus required/></AdminFormField>
        <AdminFormField label="Owner"><input name="owner" defaultValue="Shivam"/></AdminFormField>
        <AdminFormField label="Purpose"><input name="purpose" placeholder="Casting / Project / Crew"/></AdminFormField>
      </AdminDialogGrid>
      <AdminDialogActions onCancel={()=>setCreating(false)} primaryLabel="Create List"/>
    </AdminDialogForm>
  </AdminDialog>

  <AdminDialog open={!!selected} onClose={()=>setSelected(null)} eyebrow="Saved talent list" title={selected?.name??"Talent List"} description="Temporary list preview">
    {selected&&<div className="ad-list-preview"><div className="ad-list-preview-number">{selected.members}</div><p>Members currently saved to this list.</p><div className="ad-dialog-empty"><strong>No live talent records are loaded yet.</strong><span>After backend integration, this panel will show saved member cards with remove/reorder controls.</span></div><AdminDialogActions onCancel={()=>setSelected(null)} primaryLabel="Add Talent" primaryType="button" onPrimary={()=>toast.success("Talent picker UI will connect to real member data after backend integration.")}/></div>}
  </AdminDialog>
 </div>
}
