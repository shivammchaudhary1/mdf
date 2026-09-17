"use client";
import { useEffect, useState } from "react";
import template from "@/data/public-site.json";
import { allPages, dateLabel, mediaUrl, type ContentRecord } from "@/services/workspace";
import type { TalentRecord } from "@/services/admin-workspace";
import { useToast } from "@/components/ui/toast-provider";
type PublicRecord = ContentRecord & { type?:string; status?:string; summary?:string; location?:string; shootDate?:string; deadline?:string; ageMin?:number; ageMax?:number; gender?:string; compensation?:string };
const empty = {...template,stats:template.stats.map(stat=>({...stat,value:"—"})),brand:{...template.brand,email:"ADD_OFFICIAL_EMAIL",phone:"ADD_REAL_PHONE",location:"ADD_REAL_ADDRESS"},projects:[] as typeof template.projects,blogs:[] as typeof template.blogs,team:[] as typeof template.team,gallery:[] as typeof template.gallery,castings:[] as typeof template.castings,talents:[] as typeof template.talents};
export function usePublicData(domain:"brand"|"home"|"projects"|"blogs"|"team"|"gallery"|"castings"|"talents") {
 const [data,setData]=useState(empty);const toast=useToast();
 useEffect(()=>{let active=true;const run=async()=>{
  const domains=domain==="home"?["projects","blogs"]:domain==="brand"?[]:[domain];
  const updates:Partial<typeof empty>={};
  for(const key of domains){
   if(key==="talents"){const rows=await allPages<TalentRecord>("/talent");updates.talents=rows.map(x=>({name:x.name,role:x.profile?.profession??"",location:x.profile?.city??"",experience:x.profile?.experience??"",skills:x.profile?.skills??[],verified:x.verified,image:mediaUrl(x.profile?.photo)}));continue;}
   const rows=await allPages<PublicRecord>(key==="projects"?"/projects":key==="castings"?"/castings":`/content/${key==="blogs"?"blog":key}`);
   if(key==="projects")updates.projects=rows.map(x=>({slug:x.slug,title:x.title,category:x.type??"",status:x.status??"",summary:x.summary??x.description??"",year:new Date(x.createdAt).getFullYear().toString(),location:x.location??"",image:mediaUrl(x.coverImage)}));
   if(key==="blogs")updates.blogs=rows.map(x=>({slug:x.slug,title:x.title,category:x.category??"",date:dateLabel(x.publishedAt??x.createdAt),readTime:`${Math.max(1,Math.ceil((x.body??[]).join(" ").split(/\s+/).length/200))} min read`,summary:x.description??"",image:mediaUrl(x.coverImage)}));
   if(key==="team")updates.team=rows.map(x=>({name:x.title,role:x.role??"",group:x.data?.group??"Core Team",bio:x.description??"",image:mediaUrl(x.coverImage)}));
   if(key==="gallery")updates.gallery=rows.map(x=>({title:x.title,category:x.category??"",image:mediaUrl(x.coverImage)}));
   if(key==="castings")updates.castings=rows.map(x=>({slug:x.slug,title:x.title,project:"",category:x.category??"",location:x.location??"",age:x.ageMin!==undefined||x.ageMax!==undefined?`${x.ageMin??0}–${x.ageMax??120}`:"—",gender:x.gender??"",shoot:dateLabel(x.shootDate),deadline:dateLabel(x.deadline),compensation:x.compensation??"",summary:x.summary??x.description??""}));
  }
  const settings=await allPages<ContentRecord>("/content/settings");const company=settings.find(x=>x.slug==="company")?.data;
  if(company)updates.brand={...empty.brand,name:company.companyName||empty.brand.name,email:company.email||empty.brand.email,phone:company.phone||empty.brand.phone,location:company.location||empty.brand.location};
  if(active)setData({...empty,...updates});
 };void run().catch(error=>{if(active)toast.error(error instanceof Error?error.message:"Unable to load content.");});return()=>{active=false;};},[domain,toast]);
 return data;
}
