"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { AdminIcon } from "@/components/admin/admin-icons";
import { AdminNotifications } from "@/components/admin/admin-notifications";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useToast } from "@/components/ui/toast-provider";
import data from "@/data/admin-dashboard.json";

export const adminNav=[
["dashboard","Overview","/admin"],["users","Members & Talent","/admin/users"],["applications","Applications","/admin/applications"],["projects","Projects","/admin/projects"],["casting","Casting Calls","/admin/casting"],["blog","Blog & News","/admin/blog"],["gallery","Gallery","/admin/gallery"],["bts","Behind the Scenes","/admin/behind-the-scenes"],["shows","Shows & Media","/admin/shows"],["team","Team","/admin/team"],["lists","Saved Talent Lists","/admin/lists"],["contacts","Contact Queries","/admin/contacts"],["settings","Company Settings","/admin/settings"],["legal","Legal Content","/admin/legal"]
] as const;

export function AdminShell({section,children}:{section:string;children:ReactNode}){
 const pathname=usePathname(),router=useRouter(),toast=useToast();
 const open=useAdminDashboardStore(s=>s.mobileOpen),setOpen=useAdminDashboardStore(s=>s.setMobileOpen);
 const query=useAdminDashboardStore(s=>s.query),setQuery=useAdminDashboardStore(s=>s.setQuery);
 function logout(){toast.success("Signed out from the admin UI demo.");router.push("/login")}

 return <div className="ad-shell">
  <aside className={`ad-sidebar ${open?"is-open":""}`}>
   <div className="ad-sidebar-brand"><Link href="/" onClick={()=>setOpen(false)}><BrandLogo className="!w-[108px]"/></Link><button className="ad-close" onClick={()=>setOpen(false)}>×</button></div>
   <div className="ad-admin-chip"><div className="ad-avatar">{data.admin.initials}</div><div><strong>{data.admin.name}</strong><span>Super Admin</span></div></div>
   <nav className="ad-nav">{adminNav.map(([key,label,href])=>{const active=key==="dashboard"?pathname==="/admin":pathname.startsWith(href);return <Link key={key} href={href} onClick={()=>setOpen(false)} className={active?"active":""}><AdminIcon name={key}/><span>{label}</span></Link>})}</nav>
   <div className="ad-sidebar-bottom"><Link href="/">← Public Website</Link><Link href="/member">Member Dashboard</Link><button onClick={logout}><AdminIcon name="logout"/>Sign Out</button></div>
  </aside>

  {open&&<button className="ad-backdrop" aria-label="Close admin navigation" onClick={()=>setOpen(false)}/>}

  <div className="ad-main">
   <header className="ad-topbar">
    <div className="ad-topbar-left"><button className="ad-menu" onClick={()=>setOpen(true)}>☰</button><div><span>SUPER ADMIN</span><strong>{adminNav.find(([k])=>k===section)?.[1]??"Overview"}</strong></div></div>
    <div className="ad-topbar-right">
      <label className="ad-global-search"><AdminIcon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search platform"/><kbd>⌘ K</kbd></label>
      <AdminNotifications/>
      <div className="ad-avatar ad-avatar-top">{data.admin.initials}</div>
    </div>
   </header>
   <main className="ad-content">{children}</main>
  </div>
 </div>
}
