"use client";
import type { ReactNode } from "react";
import { AdminIcon } from "@/components/admin/admin-icons";

export function AdminPageHeader({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}){return <section className="ad-page-header"><div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>{action}</section>}
export function AdminPrimaryButton({children,onClick}:{children:ReactNode;onClick?:()=>void}){return <button type="button" className="ad-primary" onClick={onClick}><AdminIcon name="plus"/>{children}</button>}
export function AdminStatus({value}:{value:string}){return <span className={`ad-status ${value.toLowerCase().replaceAll(" ","-")}`}>{value}</span>}
export function AdminFilters({values,active,onChange}:{values:string[];active:string;onChange:(v:string)=>void}){return <div className="ad-filters">{values.map(v=><button type="button" key={v} onClick={()=>onChange(v)} className={active===v?"active":""}>{v}</button>)}</div>}
export function AdminSearch({value,onChange,placeholder="Search"}:{value:string;onChange:(v:string)=>void;placeholder?:string}){return <label className="ad-section-search"><AdminIcon name="search"/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
export function AdminMoreButton(){return <button type="button" className="ad-more" aria-label="More actions"><AdminIcon name="more"/></button>}
