"use client";
import { useState } from "react";
import data from "@/data/admin-dashboard.json";
import { useToast } from "@/components/ui/toast-provider";
import { AdminPageHeader,AdminStatus } from "@/components/admin/admin-shared";

export function AdminContactsView(){
 const toast=useToast();const[selected,setSelected]=useState(data.contacts[0]);
 return <div className="ad-stack"><AdminPageHeader eyebrow="Inbox" title="Contact Queries" description="Review production, casting and collaboration messages submitted from the public website."/><section className="ad-inbox"><div className="ad-inbox-list">{data.contacts.map(i=><button type="button" key={i.id} onClick={()=>setSelected(i)} className={selected.id===i.id?"active":""}><div><strong>{i.name}</strong><span>{i.subject}</span></div><time>{i.received}</time><AdminStatus value={i.status}/></button>)}</div><article className="ad-inbox-message"><div className="ad-inbox-message-head"><div><p className="ad-kicker">{selected.status}</p><h2>{selected.subject}</h2><span>{selected.name} · {selected.email}</span></div><AdminStatus value={selected.status}/></div><p>{selected.message}</p><div className="ad-inbox-actions"><button onClick={()=>toast.success("Reply composer will connect to email/backend later.")}>Reply</button><button onClick={()=>toast.success("Marked as resolved in UI demo.")}>Mark Resolved</button></div></article></section></div>
}
