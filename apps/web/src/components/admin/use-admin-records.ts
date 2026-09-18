"use client";
import { useCallback,useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { api,ApiError } from "@/services/api";
import { fetchPage,type PageMeta } from "@/services/workspace";

export function useAdminRecords<Source,View>(path:string,map:(x:Source)=>View,paginated=true,initialPage=1,limit=20){
 const[records,setRecords]=useState<View[]>([]),[meta,setMeta]=useState<PageMeta|undefined>(),[page,setPage]=useState(initialPage);
 const toast=useToast(),router=useRouter();
 useEffect(()=>{setPage(1)},[path]);
 const load=useCallback(async()=>{if(paginated){const r=await fetchPage<Source>(path,page,limit);setRecords(r.items.map(map));setMeta(r.meta)}else{const r=await api<Source[]>(path);setRecords(r.map(map));setMeta(undefined)}},[path,map,paginated,page,limit]);
 const refresh=useCallback(async()=>{await load()},[load]);
 useEffect(()=>{let active=true;void load().catch(e=>{if(!active)return;if(e instanceof ApiError&&e.status===401)router.replace("/login");else toast.error(e instanceof Error?e.message:"Unable to load records.")});return()=>{active=false}},[load,toast,router]);
 return[records,setRecords,refresh,meta,setPage,page]as const;
}
