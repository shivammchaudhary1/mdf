"use client";
import { useEffect, useState } from "react";

export function GlobalUploadIndicator(){
  const[active,setActive]=useState(0);
  useEffect(()=>{const start=()=>setActive(v=>v+1);const end=()=>setActive(v=>Math.max(0,v-1));window.addEventListener("mdadu-upload-start",start);window.addEventListener("mdadu-upload-end",end);return()=>{window.removeEventListener("mdadu-upload-start",start);window.removeEventListener("mdadu-upload-end",end)}},[]);
  if(!active)return null;
  return <div className="fixed inset-0 z-[130] grid place-items-center bg-black/35 px-5 backdrop-blur-[2px]"><div className="flex min-w-[230px] flex-col items-center rounded-3xl border border-white/70 bg-white px-8 py-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.24)]"><span className="loader" aria-hidden="true"/><strong className="mt-5 text-base text-slate-950">Uploading & optimising…</strong><span className="mt-1 text-xs leading-5 text-slate-500">Please keep this page open while your file is processed.</span></div></div>
}
