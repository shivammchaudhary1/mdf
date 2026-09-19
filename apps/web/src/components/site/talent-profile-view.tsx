"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteMedia } from "@/components/site/site-media";
import { api } from "@/services/api";

type Talent={id:string;name:string;verified:boolean;profile:{bio?:string;city?:string;profession?:string;gender?:string;skills?:string[];languages?:string[];experience?:string;availability?:string;photo?:string;portfolio?:string[];videos?:string[];showreel?:string;previousWork?:string;socialLinks?:string[];completion?:number}|null};

export function TalentProfileView({id}:{id:string}){
 const[data,setData]=useState<Talent|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;setLoading(true);setError("");void api<Talent>(`/talent/${id}`).then(v=>{if(active)setData(v)}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Unable to load talent profile.")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[id]);
 return <><SiteHeader/><main id="main-content"><section className="site-section bg-[#fafafa]"><div className="site-shell">
  <Link href="/talent" className="text-xs font-semibold text-[#666]">← Back to Talent Network</Link>
  {loading?<div className="mt-8 rounded-[24px] bg-white p-8">Loading profile…</div>:error||!data||!data.profile?<div className="mt-8 rounded-[24px] bg-white p-8"><h1 className="font-display text-3xl font-semibold">Talent profile unavailable</h1><p className="mt-3 text-sm text-[#666]">{error||"This profile is not publicly available."}</p></div>:<div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
   <aside className="site-card overflow-hidden"><SiteMedia src={data.profile.photo} alt={data.name} kind="team" className="aspect-[4/5]"/><div className="p-6"><div className="flex items-center gap-2"><h1 className="font-display text-3xl font-semibold">{data.name}</h1>{data.verified&&<span className="rounded-full bg-[#eef7ff] px-2.5 py-1 text-[10px] font-bold text-[#2b6cb0]">Verified</span>}</div><p className="mt-2 text-sm text-[#666]">{data.profile.profession||"Creative professional"}</p><div className="mt-5 grid gap-3 text-sm"><p><strong>Location:</strong> {data.profile.city||"—"}</p><p><strong>Experience:</strong> {data.profile.experience||"—"}</p><p><strong>Availability:</strong> {data.profile.availability||"—"}</p></div></div></aside>
   <div className="grid gap-6"><article className="site-card p-7"><h2 className="font-display text-2xl font-semibold">About</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#666]">{data.profile.bio||"No biography added yet."}</p></article>
   <article className="site-card p-7"><h2 className="font-display text-2xl font-semibold">Skills & Languages</h2><div className="mt-4 flex flex-wrap gap-2">{[...(data.profile.skills??[]),...(data.profile.languages??[])].map((x,i)=><span key={`${x}-${i}`} className="rounded-full bg-[#f4f4f2] px-3 py-1.5 text-xs">{x}</span>)}</div></article>
   {data.profile.previousWork&&<article className="site-card p-7"><h2 className="font-display text-2xl font-semibold">Previous Work</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#666]">{data.profile.previousWork}</p></article>}
   {!!data.profile.portfolio?.length&&<article className="site-card p-7"><h2 className="font-display text-2xl font-semibold">Portfolio</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.profile.portfolio.map((src,i)=><SiteMedia key={`${src}-${i}`} src={src} alt={`${data.name} portfolio ${i+1}`} kind="gallery" className="aspect-[4/5] rounded-xl"/>)}</div></article>}
   {(data.profile.showreel||data.profile.videos?.length||data.profile.socialLinks?.length)?<article className="site-card p-7"><h2 className="font-display text-2xl font-semibold">Links</h2><div className="mt-4 flex flex-wrap gap-3">{data.profile.showreel&&<a href={data.profile.showreel} target="_blank" rel="noreferrer" className="rounded-full bg-[#111] px-4 py-2 text-xs font-semibold text-white">Open Showreel</a>}{data.profile.videos?.map((x,i)=><a key={x} href={x} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold">Video {i+1}</a>)}{data.profile.socialLinks?.map((x,i)=><a key={x} href={x} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold">Social {i+1}</a>)}</div></article>:null}
   </div></div>}
 </div></section></main><SiteFooter/></>
}
