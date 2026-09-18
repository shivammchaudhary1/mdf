"use client";
import { useState } from "react";
import { useAdminRecords } from "./use-admin-records";
import { contactView } from "@/services/admin-workspace";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/toast-provider";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { AdminPageHeader,AdminStatus } from "@/components/admin/admin-shared";

export function AdminContactsView(){
 const toast=useToast();const[contacts,,refresh,meta,setPage]=useAdminRecords("/admin/contacts",contactView,true,1,20);const[selectedId,setSelectedId]=useState("");const selected=contacts.find(x=>x.id===selectedId)??contacts[0]??{id:"",name:"",email:"",subject:"",message:"",status:"",received:""};
 async function resolve(){if(!selected.id)return;try{await api(`/admin/contacts/${selected.id}`,{method:"PATCH",body:JSON.stringify({status:"Resolved"})});await refresh();toast.success("Marked as resolved.");}catch(error){toast.error(error instanceof Error?error.message:"Unable to update contact.");}}

 return <div className="ad-stack"><AdminPageHeader eyebrow="Inbox" title="Contact Queries" description="Review production, casting and collaboration messages submitted from the public website."/><section className="ad-inbox"><div className="ad-inbox-list">{contacts.map(i=><button type="button" key={i.id} onClick={()=>setSelectedId(i.id)} className={selected.id===i.id?"active":""}><div><strong>{i.name}</strong><span>{i.subject}</span></div><time>{i.received}</time><AdminStatus value={i.status}/></button>)}</div><article className="ad-inbox-message"><div className="ad-inbox-message-head"><div><p className="ad-kicker">{selected.status}</p><h2>{selected.subject}</h2><span>{selected.name} · {selected.email}</span></div><AdminStatus value={selected.status}/></div><p>{selected.message}</p><div className="ad-inbox-actions"><button onClick={()=>toast.info("Email replies are not configured yet.")}>Reply</button><button onClick={resolve}>Mark Resolved</button></div></article></section><PaginationControls meta={meta} onPage={setPage}/></div>
}
