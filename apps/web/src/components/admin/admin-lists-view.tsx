"use client";
import data from "@/data/admin-dashboard.json";
import { useToast } from "@/components/ui/toast-provider";
import { AdminPageHeader,AdminPrimaryButton,AdminMoreButton } from "@/components/admin/admin-shared";

export function AdminListsView(){
 const toast=useToast();
 return <div className="ad-stack"><AdminPageHeader eyebrow="Talent organization" title="Saved Talent Lists" description="Build reusable shortlists for projects, casting discussions and production planning." action={<AdminPrimaryButton onClick={()=>toast.success("New list UI ready for backend wiring.")}>New Talent List</AdminPrimaryButton>}/><section className="ad-list-grid">{data.savedLists.map(list=><article className="ad-list-card" key={list.id}><div className="ad-list-stack"><i>{list.members}</i><i/><i/></div><div><p className="ad-kicker">Saved list</p><h2>{list.name}</h2><span>{list.members} members · Updated {list.updated}</span><small>Owner: {list.owner}</small></div><div className="ad-list-actions"><button onClick={()=>toast.success(`Opening ${list.name}.`)}>Open List</button><AdminMoreButton/></div></article>)}</section></div>
}
