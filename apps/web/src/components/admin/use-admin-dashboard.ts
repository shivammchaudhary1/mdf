"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { allPages, dateLabel, type ApplicationRecord, type ContentRecord } from "@/services/workspace";
import { applicationView } from "@/services/admin-workspace";
import { useToast } from "@/components/ui/toast-provider";
type Dashboard = { metrics: Record<string,number>; pipeline: Record<string,number>; growth: { _id:{year:number;month:number};count:number }[]; activity: { _id:string;action:string;entityType:string;summary?:string;createdAt:string }[] };
export function useAdminDashboard(){
 const [result,setResult]=useState<Dashboard>({metrics:{},pipeline:{},growth:[],activity:[]});
 const [applications,setApplications]=useState<ReturnType<typeof applicationView>[]>([]);const [drafts,setDrafts]=useState(0);const toast=useToast();
 useEffect(()=>{let active=true;void Promise.all([api<Dashboard>("/admin/dashboard"),allPages<ApplicationRecord>("/admin/applications"),allPages<ContentRecord>("/admin/content/blog")]).then(([dashboard,items,posts])=>{if(active){setResult(dashboard);setApplications(items.map(applicationView));setDrafts(posts.filter(x=>!x.published).length);}}).catch(error=>toast.error(error.message));return()=>{active=false;};},[toast]);
 const m=result.metrics;const pipeline=["Submitted","Under Review","Shortlisted","Selected"].map(label=>({label,value:result.pipeline[label]??0,percent:m.applications?(result.pipeline[label]??0)*100/m.applications:0}));
 const max=Math.max(1,...result.growth.map(x=>x.count));
 const growth=Array.from({length:6},(_,i)=>{const date=new Date();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()-5+i);const count=result.growth.find(x=>x._id.year===date.getUTCFullYear()&&x._id.month===date.getUTCMonth()+1)?.count??0;return{label:date.toLocaleDateString("en-US",{month:"short",timeZone:"UTC"}),value:count/max*100};});
 return {stats:[{label:"Total Members",value:m.users??0,delta:"",tone:"positive",helper:""},{label:"Verified Talent",value:m.verified??0,delta:"",tone:"positive",helper:""},{label:"Open Castings",value:m.openCastings??0,delta:"",tone:"neutral",helper:""},{label:"Pending Applications",value:m.pending??0,delta:"",tone:"warning",helper:""}],pipeline,growth,applications,recentActivity:result.activity.map(x=>({title:x.summary??x.action,meta:x.action,type:x.entityType,time:dateLabel(x.createdAt)})),queue:{pending:m.pending??0,unverified:(m.users??0)-(m.verified??0),contacts:m.newContacts??0,drafts}};
}
