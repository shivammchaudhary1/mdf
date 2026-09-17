"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { api, ApiError } from "@/services/api";
import { allPages } from "@/services/workspace";

export function useAdminRecords<Source, View>(path: string, map: (item: Source) => View, paginated = true) {
  const [records,setRecords]=useState<View[]>([]);
  const toast=useToast(); const router=useRouter();
  const refresh=useCallback(async()=>{const result=paginated?await allPages<Source>(path):await api<Source[]>(path);setRecords(result.map(map));},[path,map,paginated]);
  useEffect(()=>{let active=true;const load=async()=>{const result=paginated?await allPages<Source>(path):await api<Source[]>(path);if(active)setRecords(result.map(map));};void load().catch(error=>{if(!active)return;if(error instanceof ApiError&&error.status===401)router.replace("/login");else toast.error(error instanceof Error?error.message:"Unable to load records.");});return()=>{active=false;};},[path,map,paginated,toast,router]);
  return [records,setRecords,refresh] as const;
}
