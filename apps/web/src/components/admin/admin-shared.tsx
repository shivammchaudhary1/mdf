"use client";

import { useState, type ReactNode } from "react";
import { AdminIcon } from "@/components/admin/admin-icons";
import { useToast } from "@/components/ui/toast-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AdminPageHeader({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}){
  return <section className="ad-page-header"><div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>{action}</section>
}

export function AdminPrimaryButton({children,onClick}:{children:ReactNode;onClick?:()=>void}){
  return <button type="button" className="ad-primary" onClick={onClick}><AdminIcon name="plus"/>{children}</button>
}

export function AdminStatus({value}:{value:string}){
  return <span className={`ad-status ${value.toLowerCase().replaceAll(" ","-")}`}>{value}</span>
}

export function AdminFilters({values,active,onChange}:{values:string[];active:string;onChange:(v:string)=>void}){
  return <div className="ad-filters">{values.map(v=><button type="button" key={v} onClick={()=>onChange(v)} className={active===v?"active":""}>{v}</button>)}</div>
}

export function AdminSearch({value,onChange,placeholder="Search"}:{value:string;onChange:(v:string)=>void;placeholder?:string}){
  return <label className="ad-section-search"><AdminIcon name="search"/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>
}

export function AdminMoreButton({onEdit,onArchive}:{onEdit?:()=>void;onArchive?:()=>Promise<void>}){
  const [open,setOpen]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const [busy,setBusy]=useState(false);
  const toast=useToast();
  async function archive(){if(!onArchive||busy)return;setBusy(true);try{await onArchive();setConfirm(false);toast.success("Item archived.");}catch(error){toast.error(error instanceof Error?error.message:"Unable to archive item.");}finally{setBusy(false);}}

  return <span className="ad-more-wrap">
    <button type="button" className="ad-more" aria-label="More actions" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><AdminIcon name="more"/></button>
    {open&&<>
      <button type="button" className="ad-more-dismiss" aria-label="Close actions" onClick={()=>setOpen(false)}/>
      <span className="ad-more-menu">
        {onEdit&&<button type="button" onClick={()=>{setOpen(false);onEdit()}}>Edit</button>}
        <button type="button" onClick={()=>{setOpen(false);toast.info("Duplication is not available for this item yet.")}}>Duplicate</button>
        <button type="button" onClick={()=>{setOpen(false);if(onArchive)setConfirm(true);else toast.info("Archiving is not available for this item.")}}>Archive</button>
      </span>
    </>}
    <ConfirmDialog open={confirm} title="Archive this item?" description="The item will no longer be published." confirmLabel="Archive" destructive loading={busy} onCancel={()=>setConfirm(false)} onConfirm={()=>void archive()}/>
  </span>
}
