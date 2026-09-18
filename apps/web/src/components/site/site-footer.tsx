"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import data from "@/data/public-site.json";
import { runtimeConfig } from "@/config/runtime";

type Socials={linkedin?:string;instagram?:string;youtube?:string;facebook?:string};
const safe=(v?:string)=>v&&/^https:\/\//i.test(v)?v:"";
function Icon({name}:{name:keyof Socials}){const common={viewBox:"0 0 24 24",width:16,height:16,"aria-hidden":true};if(name==="instagram")return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>;if(name==="youtube")return <svg {...common} fill="currentColor"><path d="M21 8.2a3 3 0 0 0-2.1-2.1C17 5.6 12 5.6 12 5.6s-5 0-6.9.5A3 3 0 0 0 3 8.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8ZM10 15.4V8.6l5 3.4-5 3.4Z"/></svg>;if(name==="linkedin")return <svg {...common} fill="currentColor"><path d="M6.5 8.2H3.4V21h3.1V8.2ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.7c0-3.9-2.1-5.8-4.9-5.8-2.3 0-3.3 1.2-3.9 2.1V8.2H9.1V21h3.1v-6.3c0-1.7.3-3.3 2.4-3.3s2.1 1.9 2.1 3.4V21H20l1-7.3Z"/></svg>;return <svg {...common} fill="currentColor"><path d="M14.2 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.8v8h3.4Z"/></svg>}

export function SiteFooter(){
 const[socials,setSocials]=useState<Socials>({});
 useEffect(()=>{let active=true;fetch(`${runtimeConfig.apiUrl}/content/settings?limit=100&page=1`,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(page=>{if(!active||!page?.items)return;const company=page.items.find((item:{slug?:string})=>item.slug==="company");setSocials(company?.data??{})}).catch(()=>undefined);return()=>{active=false}},[]);
 const entries=(["linkedin","instagram","youtube","facebook"] as const).map(name=>[name,safe(socials[name])] as const).filter(([,href])=>Boolean(href));
 return <footer className="border-t border-black/8 bg-white">
  <div className="site-shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_.75fr_.75fr_1fr] lg:py-14">
   <div><BrandLogo darkInk className="!w-[116px]"/><p className="mt-4 max-w-xs text-sm leading-6 text-[#777]">Stories. People. Possibilities.</p></div>
   <div><p className="site-footer-title">Quick Links</p><div className="mt-4 grid gap-2.5 text-sm text-[#686868]">{data.navigation.slice(0,5).map(item=><Link key={item.href} href={item.href} className="hover:text-black">{item.label}</Link>)}<Link href="/careers" className="hover:text-black">Careers</Link></div></div>
   <div><p className="site-footer-title">Follow Us</p>{entries.length?<div className="mt-4 flex gap-2">{entries.map(([name,href])=><a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-[#333] transition hover:bg-black hover:text-white"><Icon name={name}/></a>)}</div>:<p className="mt-4 max-w-[220px] text-xs leading-5 text-[#888]">Official social links will appear here when added in Company Settings.</p>}</div>
   <div><p className="site-footer-title">Work with us</p><p className="mt-4 text-sm leading-6 text-[#777]">Explore production, creative and platform opportunities with M. Dadu Films.</p><Link href="/careers" className="site-text-link mt-4 inline-flex">View Careers →</Link></div>
  </div>
  <div className="site-shell flex flex-wrap items-center justify-between gap-3 border-t border-black/5 py-5 text-[11px] text-[#888]"><span>© {new Date().getFullYear()} M. Dadu Films. All rights reserved.</span><div className="flex flex-wrap gap-5"><Link href="/privacy" className="hover:text-black">Privacy</Link><Link href="/terms" className="hover:text-black">Terms</Link><Link href="/careers" className="hover:text-black">Careers</Link><a href="/sitemap.xml" className="hover:text-black">Sitemap</a></div></div>
 </footer>
}
