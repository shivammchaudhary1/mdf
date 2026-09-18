"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { SiteMedia } from "@/components/site/site-media";
import { useToast } from "@/components/ui/toast-provider";
import { useMemberDashboardStore } from "@/store/member-dashboard-store";
import { MemberData, useMemberData } from "@/components/member-data";
import { api } from "@/services/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { allPages, uploadMedia, type OpportunityRecord } from "@/services/workspace";

const nav = [
  ["dashboard", "Dashboard", "/member"],
  ["profile", "My Profile", "/member/profile"],
  ["portfolio", "My Portfolio", "/member/portfolio"],
  ["applications", "Applications", "/member/applications"],
  ["opportunities", "Opportunities", "/member/opportunities"],
  ["settings", "Settings", "/member/settings"]
] as const;

function Icon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "profile") return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>;
  if (name === "portfolio") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m6 16 4-4 3 3 2-2 3 3"/></svg>;
  if (name === "applications") return <svg {...common}><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M8 10h8M8 14h6"/></svg>;
  if (name === "opportunities") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/></svg>;
  if (name === "settings") return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1A7 7 0 0 0 15 6l-.4-2.6h-4L10 6a7 7 0 0 0-1.5 1L6 6 4 9.5 6 11a7 7 0 0 0 0 2l-2 1.5L6 18l2.5-1A7 7 0 0 0 10 18l.5 2.6h4L15 18a7 7 0 0 0 1.5-1L19 18l2-3.5-2-1.5a7 7 0 0 0 0-1Z"/></svg>;
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>;
  if (name === "bell") return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>;
  if (name === "bookmark") return <svg {...common}><path d="M6 4h12v17l-6-4-6 4z"/></svg>;
  if (name === "edit") return <svg {...common}><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10z"/></svg>;
  if (name === "upload") return <svg {...common}><path d="M12 16V4m-5 5 5-5 5 5M4 20h16"/></svg>;
  if (name === "check") return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
  return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
}

function Shell({ section, children }: { section: string; children: ReactNode }) {
  const { data } = useMemberData();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const open = useMemberDashboardStore((s) => s.mobileOpen);
  const setOpen = useMemberDashboardStore((s) => s.setMobileOpen);

  async function logout() {
    try { await api("/auth/logout", { method: "POST" }); router.replace("/login"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to sign out."); }
  }

  return (
    <div className="md-member-shell">
      <aside className={`md-member-sidebar ${open ? "is-open" : ""}`}>
        <div className="md-side-head">
          <Link href="/"><BrandLogo darkInk className="!w-[108px]" /></Link>
          <button onClick={() => setOpen(false)} className="md-close">×</button>
        </div>

        <div className="md-mini-user">
          <div className="md-avatar">{data.member.firstName[0]}</div>
          <div><strong>{data.member.name}</strong><span>{data.member.profession}</span></div>
        </div>

        <nav className="md-side-nav">
          {nav.map(([key, label, href]) => {
            const active = key === "dashboard" ? pathname === "/member" : pathname.startsWith(href);
            return (
              <Link key={key} href={href} onClick={() => setOpen(false)} className={active ? "active" : ""}>
                <Icon name={key}/><span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="md-side-bottom">
          <Link href="/">← Public website</Link>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>

      {open && <button className="md-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />}

      <div className="md-main">
        <header className="md-topbar">
          <div className="md-topbar-left">
            <button className="md-menu" onClick={() => setOpen(true)}>☰</button>
            <div><span>M. Dadu Films Community</span><strong>{nav.find(([k]) => k === section)?.[1] ?? "Dashboard"}</strong></div>
          </div>
          <div className="md-top-actions">
            <Link href="/member/opportunities" className="md-search-pill"><Icon name="search"/> Find opportunities</Link>
            <button className="md-icon-button"><Icon name="bell"/><i /></button>
            <Link href="/member/profile" className="md-avatar md-top-avatar">{data.member.firstName[0]}</Link>
          </div>
        </header>
        <main className="md-content">{children}</main>
      </div>

      <nav className="md-mobile-nav">
        {nav.slice(0,5).map(([key, label, href]) => {
          const active = key === "dashboard" ? pathname === "/member" : pathname.startsWith(href);
          return <Link key={key} href={href} className={active ? "active" : ""}><Icon name={key}/><span>{label.replace("My ","")}</span></Link>;
        })}
      </nav>
    </div>
  );
}

function Header({ kicker, title, description, action }: { kicker: string; title: string; description: string; action?: ReactNode }) {
  return <section className="md-page-header"><div><p>{kicker}</p><h1>{title}</h1><span>{description}</span></div>{action}</section>;
}

function Status({ status, tone }: { status: string; tone: string }) {
  return <span className={`md-status ${tone}`}>{status}</span>;
}

function Dashboard() {
  const { data } = useMemberData();
  return (
    <div className="md-stack">
      <section className="md-welcome-grid">
        <article className="md-welcome">
          <div><p className="md-kicker">Good evening, {data.member.firstName}</p><h1>Keep creating. Your next opportunity starts here.</h1><span>Stay visible, keep your portfolio fresh and apply to roles that match your craft.</span></div>
          <div className="md-actions"><Link href="/member/opportunities" className="md-primary">Explore Opportunities →</Link><Link href="/member/profile" className="md-secondary dark">Update Profile</Link></div>
        </article>
        <Link href="/member/profile" className="md-profile-strength">
          <div><p className="md-kicker">Profile strength</p><h2>{data.member.profileCompletion}% complete</h2></div>
          <div className="md-ring" style={{"--p": `${data.member.profileCompletion * 3.6}deg`} as React.CSSProperties}><span>{data.member.profileCompletion}%</span></div>
          <div className="md-progress"><i style={{width:`${data.member.profileCompletion}%`}} /></div>
          <span>Add portfolio photos and a showreel to improve visibility.</span>
        </Link>
      </section>

      <section className="md-stats">
        {data.stats.map((s,i)=><article key={s.label}><div className="md-stat-icon"><Icon name={i===0?"applications":i===1?"check":i===2?"profile":"bookmark"}/></div><div><strong>{s.value}</strong><p>{s.label}</p><span>{s.helper}</span></div></article>)}
      </section>

      <section className="md-dashboard-grid">
        <div className="md-main-column">
          <article className="md-card">
            <div className="md-card-head"><div><p className="md-kicker">Current progress</p><h2>Recent Applications</h2></div><Link href="/member/applications">View all →</Link></div>
            <div className="md-app-list">
              {data.applications.slice(0,3).map(a=><div key={a.id} className="md-app-row"><div className="md-project-mark">{a.project[0]}</div><div><strong>{a.role}</strong><span>{a.project} · {a.location}</span></div><Status status={a.status} tone={a.tone}/></div>)}
            </div>
          </article>

          <article className="md-card">
            <div className="md-card-head"><div><p className="md-kicker">Matched for you</p><h2>Recommended Opportunities</h2></div><Link href="/member/opportunities">Explore all →</Link></div>
            <div className="md-rec-grid">
              {data.opportunities.slice(0,2).map(o=><Link href="/member/opportunities" key={o.id} className="md-rec-card"><SiteMedia src={o.image} alt={o.title} kind="team" className="aspect-[16/8] rounded-xl"/><div><span>{o.match} match</span><h3>{o.title}</h3><p>{o.project} · {o.location}</p></div></Link>)}
            </div>
          </article>
        </div>

        <aside className="md-side-column">
          <article className="md-card">
            <div className="md-card-head"><div><p className="md-kicker">Profile setup</p><h2>Complete your profile</h2></div></div>
            <div className="md-checklist">{data.profileChecklist.map(i=><div key={i.label} className={i.done?"done":""}><span>{i.done?<Icon name="check"/>:""}</span>{i.label}</div>)}</div>
            <Link href="/member/profile" className="md-text-link">Continue profile setup →</Link>
          </article>
          <article className="md-card">
            <div className="md-card-head"><div><p className="md-kicker">Latest updates</p><h2>Activity</h2></div></div>
            <div className="md-activity">{data.activity.map(x=><div key={x.title}><i/><p>{x.title}<span>{x.time}</span></p></div>)}</div>
          </article>
        </aside>
      </section>

      <article className="md-card">
        <div className="md-card-head"><div><p className="md-kicker">Learn & grow</p><h2>From the Journal</h2></div><Link href="/blog">Visit blog →</Link></div>
        <div className="md-posts">{data.posts.map(p=><Link href="/blog" key={p.title}><SiteMedia src={p.image} alt={p.title} kind="blog" className="aspect-[16/8] rounded-xl"/><p className="md-kicker">{p.category}</p><h3>{p.title}</h3><span>{p.date}</span></Link>)}</div>
      </article>
    </div>
  );
}

function Profile() {
  const { data, refresh } = useMemberData();
  const fields = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  function choosePhoto() {
    if(saving)return;const input=document.createElement("input");input.type="file";input.accept="image/jpeg,image/png,image/webp";
    input.onchange=async()=>{const file=input.files?.[0];if(!file)return;setSaving(true);try{const result=await uploadMedia(file);await api("/member/profile",{method:"PUT",body:JSON.stringify({photoMediaId:result.id})});await refresh();toast.success("Profile photo saved.");}catch(error){toast.error(error instanceof Error?error.message:"Unable to save photo.");}finally{setSaving(false);}};input.click();
  }
  async function save() {
    if (saving) return;
    const values = Array.from(fields.current?.querySelectorAll("input, textarea") ?? []).map(field => (field as HTMLInputElement).value);
    const [bio, profession, city, gender, birthDate, experience, availability] = values;
    setSaving(true);
    try { await api("/member/profile", { method: "PUT", body: JSON.stringify({bio,profession,city,gender,...(birthDate?{birthDate}:{}),experience,availability}) }); await refresh(); setEditing(false); toast.success("Profile saved."); }
    catch(error) { toast.error(error instanceof Error?error.message:"Unable to save profile."); }
    finally { setSaving(false); }
  }
  const toast = useToast();
  const [editing,setEditing]=useState(false);
  const p=data.profile;
  return <div className="md-stack">
    <Header kicker="Your identity" title="My Profile" description="Keep your public profile current so casting teams see the right version of you." action={<button className="md-secondary" onClick={()=>setEditing(v=>!v)}><Icon name="edit"/>{editing?"Cancel":"Edit Profile"}</button>}/>
    <section className="md-profile-grid">
      <aside className="md-card md-profile-summary">
        <div className="md-profile-photo"><SiteMedia src={data.member.photo} alt={data.member.name} kind="team" className="aspect-square rounded-full"/><button onClick={choosePhoto} disabled={saving}><Icon name="edit"/></button></div>
        <h2>{data.member.name}</h2><p>{data.member.profession}</p>
        <div className="md-badges"><span>{data.member.verified?"✓ Verified Member":"Not verified"}</span><span>{data.member.availability}</span></div>
        <div className="md-mini-details"><div><span>Location</span><strong>{data.member.location}</strong></div><div><span>Experience</span><strong>{p.experience}</strong></div><div><span>Member since</span><strong>{data.member.memberSince}</strong></div></div>
        <button className="md-primary full">Preview Public Profile</button>
      </aside>
      <div className="md-form-stack" ref={fields} key={`${JSON.stringify(data.profile)}-${editing}`}>
        <article className="md-card"><div className="md-card-head"><div><p className="md-kicker">Introduction</p><h2>About You</h2></div></div><label className="md-field"><span>Bio</span><textarea rows={5} defaultValue={p.bio} disabled={!editing}/></label></article>
        <article className="md-card"><div className="md-card-head"><div><p className="md-kicker">Basic details</p><h2>Personal & Professional</h2></div></div><div className="md-form-grid">{[["Profession",p.profession],["City",p.city],["Gender",p.gender],["Date of Birth",p.birthDate],["Experience",p.experience],["Availability",p.availability]].map(([l,v])=><label className="md-field" key={l}><span>{l}</span><input defaultValue={v} disabled={!editing}/></label>)}</div></article>
        <article className="md-card"><div className="md-card-head"><div><p className="md-kicker">Skills</p><h2>Skills & Languages</h2></div></div><div className="md-tag-block"><span>Skills</span><div>{p.skills.map(x=><i key={x}>{x}</i>)}</div><span>Languages</span><div>{p.languages.map(x=><i key={x}>{x}</i>)}</div></div></article>
        {editing&&<div className="md-save-row"><button className="md-secondary" onClick={()=>setEditing(false)}>Cancel</button><button className="md-primary" disabled={saving} onClick={save}>Save Changes</button></div>}
      </div>
    </section>
  </div>;
}

function Portfolio() {
  const { data, profile, refresh } = useMemberData();
  const [busy, setBusy] = useState(false);
  const [removing,setRemoving]=useState<string|null>(null);
  async function remove(){if(!removing||busy)return;setBusy(true);try{await api("/member/profile",{method:"PUT",body:JSON.stringify({portfolioMediaIds:(profile.portfolioMediaIds??[]).filter(id=>id!==removing)})});await refresh();setRemoving(null);toast.success("Photograph removed from portfolio.");}catch(error){toast.error(error instanceof Error?error.message:"Unable to remove photograph.");}finally{setBusy(false);}}
  function chooseFile(resume = false) {
    if (busy) return;
    if (!resume && (profile.portfolioMediaIds?.length ?? 0) >= 8) { toast.info("Your portfolio can contain a maximum of 8 photographs."); return; }
    const input = document.createElement("input"); input.type="file"; input.accept=resume?"application/pdf":"image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      setBusy(true);
      try { const result = await uploadMedia(file); const nextPortfolio=[...new Set([...(profile.portfolioMediaIds??[]),result.id])].slice(0,8); await api("/member/profile",{method:"PUT",body:JSON.stringify(resume?{resumeMediaId:result.id}:{portfolioMediaIds:nextPortfolio})}); await refresh(); toast.success("Upload saved."); }
      catch(error){toast.error(error instanceof Error?error.message:"Upload failed.");} finally {setBusy(false);}
    }; input.click();
  }
  const toast=useToast();
  return <div className="md-stack">
    <Header kicker="Your work" title="My Portfolio" description="Curate the photographs, showreel and material that represent your creative identity." action={<button className="md-primary" disabled={busy||(profile.portfolioMediaIds?.length??0)>=8} onClick={()=>chooseFile()}><Icon name="upload"/>Add Photos</button>}/>
    <section className="md-portfolio-hero"><div><p className="md-kicker">Portfolio health</p><h2>Your portfolio is almost casting-ready.</h2><span>Add 2–4 strong photographs and one current showreel for a stronger profile.</span></div><div><strong>{data.portfolio.length}</strong><span>photos</span></div></section>
    <article className="md-card"><div className="md-card-head"><div><p className="md-kicker">Photographs</p><h2>Portfolio Gallery</h2></div><span>{data.portfolio.length} photographs</span></div><div className="md-portfolio-grid">{data.portfolio.map(i=><div key={i.id} className="md-portfolio-item"><SiteMedia src={i.image} alt={i.title} kind="gallery" className="aspect-[4/5] rounded-xl"/><p>{i.title}<span>{i.category}</span></p><button onClick={()=>setRemoving(i.id)}><Icon name="edit"/></button></div>)}<button className="md-add-photo" disabled={busy||(profile.portfolioMediaIds?.length??0)>=8} onClick={()=>chooseFile()}><Icon name="upload"/><strong>{(profile.portfolioMediaIds?.length??0)>=8?"Maximum 8 photos":"Add Photograph"}</strong><span>JPG / PNG / WebP · max 8</span></button></div></article>
    <section className="md-media-grid"><article className="md-card"><p className="md-kicker">Video</p><h2>Showreel</h2><div className="md-empty-media">▶<strong>No showreel added yet</strong><button onClick={()=>toast.info("Showreel editing is not available yet.")}>Add showreel link</button></div></article><article className="md-card"><p className="md-kicker">Document</p><h2>Resume / CV</h2><div className="md-empty-media">PDF<strong>{profile.resume?"Resume uploaded":"Resume ready for upload"}</strong><button disabled={busy} onClick={()=>chooseFile(true)}>Upload resume</button></div></article></section>
    <ConfirmDialog open={!!removing} title="Remove this photograph?" description="It will be removed from your portfolio. Other published uses are preserved." confirmLabel="Remove" destructive loading={busy} onConfirm={()=>void remove()} onCancel={()=>setRemoving(null)}/>
  </div>;
}

function Applications() {
  const { data } = useMemberData();
  const active=useMemberDashboardStore(s=>s.applicationFilter), setActive=useMemberDashboardStore(s=>s.setApplicationFilter);
  const filters=["All","Submitted","Under Review","Shortlisted","Not Selected"];
  const visible=active==="All"?data.applications:data.applications.filter(a=>a.status===active);
  return <div className="md-stack">
    <Header kicker="Track your progress" title="My Applications" description="See every role you applied to and where each application currently stands."/>
    <div className="md-filters">{filters.map(f=><button key={f} onClick={()=>setActive(f)} className={active===f?"active":""}>{f}</button>)}</div>
    <article className="md-card md-table-card"><div className="md-table-head"><span>Role / Project</span><span>Applied</span><span>Location</span><span>Status</span></div>{visible.map(a=><div className="md-table-row" key={a.id}><div><strong>{a.role}</strong><span>{a.project} · {a.type}</span></div><span>{a.appliedOn}</span><span>{a.location}</span><Status status={a.status} tone={a.tone}/></div>)}</article>
  </div>;
}

function Opportunities() {
  const { data, profile, refresh } = useMemberData();
  const saved=profile.savedOpportunityIds??[];
  const [saving,setSaving]=useState(false);
  async function toggle(id:string){if(saving)return;setSaving(true);try{await api("/member/settings",{method:"PATCH",body:JSON.stringify({savedOpportunityIds:saved.includes(id)?saved.filter(x=>x!==id):[...saved,id]})});await refresh();}catch(error){toast.error(error instanceof Error?error.message:"Unable to save opportunity.");}finally{setSaving(false);}}
  const router = useRouter();
  const [query, setQuery] = useState("");
  async function viewOpportunity(id: string) {
    try { const opportunity=(await allPages<OpportunityRecord>("/member/opportunities")).find(item=>item._id===id); if(!opportunity)throw new Error("This opportunity is no longer available."); router.push(`/${opportunity.opportunityType==="CASTING"?"casting":"projects"}/${opportunity.slug}`); }
    catch(error){toast.error(error instanceof Error?error.message:"Unable to open opportunity.");}
  }
  const toast=useToast(), active=useMemberDashboardStore(s=>s.opportunityFilter), setActive=useMemberDashboardStore(s=>s.setOpportunityFilter);
  const filters=["All","Acting","Commercial"], visible=data.opportunities.filter(o=>(active==="All"||o.category===active)&&`${o.title} ${o.project}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="md-stack">
    <Header kicker="Discover roles" title="Opportunities" description="Explore casting calls selected around your profile, location and creative interests." action={<div className="md-search-box"><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search roles or projects"/></div>}/>
    <div className="md-filters">{filters.map(f=><button key={f} onClick={()=>setActive(f)} className={active===f?"active":""}>{f}</button>)}</div>
    <section className="md-opportunity-grid">{visible.map(o=><article className="md-opportunity-card" key={o.id}><div className="md-opp-image"><SiteMedia src={o.image} alt={o.title} kind="team" className="h-full min-h-[210px]"/><span>{o.match} match</span><button className={saved.includes(o.id)?"saved":""} onClick={()=>toggle(o.id)}><Icon name="bookmark"/></button></div><div className="md-opp-body"><p>{o.category} · {o.compensation||"—"}</p><h2>{o.title}</h2><strong>{o.project}</strong><div><span>{o.location}</span><span>Deadline {o.deadline}</span></div><button className="md-primary full" onClick={()=>viewOpportunity(o.id)}>View & Apply</button></div></article>)}</section>
  </div>;
}

function Settings() {
  const { data, profile, refresh } = useMemberData();
  const fields=useRef<HTMLDivElement>(null);
  const [saving,setSaving]=useState(false);
  const [deactivating,setDeactivating]=useState(false);
  const router=useRouter();
  async function deactivate(){if(saving)return;setSaving(true);try{await api("/auth/deactivate",{method:"POST"});router.replace("/login");}catch(error){toast.error(error instanceof Error?error.message:"Unable to deactivate account.");}finally{setSaving(false);}}
  async function save() {
    if(saving)return; setSaving(true);
    const inputs=fields.current?.querySelectorAll("input");
    try { await api("/auth/account",{method:"PATCH",body:JSON.stringify({email:inputs?.[0].value,mobile:inputs?.[1].value})}); await refresh(); toast.success("Account settings saved."); }
    catch(error){toast.error(error instanceof Error?error.message:"Unable to save settings.");}finally{setSaving(false);}
  }
  async function preference(key: "emailCastingAlerts"|"emailUpdates"|"publicVisible", value: boolean) {
    try { await api("/member/settings",{method:"PATCH",body:JSON.stringify({[key]:value})}); await refresh(); toast.success("Preference saved."); }
    catch(error){toast.error(error instanceof Error?error.message:"Unable to save preference.");}
  }
  const toast=useToast(); const cast=profile.emailCastingAlerts??true, mail=profile.emailUpdates??true, visible=profile.publicVisible??true;
  const Toggle=({title,desc,value,set}:{title:string;desc:string;value:boolean;set:(v:boolean)=>void})=><div className="md-toggle-row"><div><strong>{title}</strong><p>{desc}</p></div><button className={value?"on":""} onClick={()=>set(!value)}><span/></button></div>;
  return <div className="md-stack">
    <Header kicker="Account controls" title="Settings" description="Manage your account details, preferences and public profile visibility."/>
    <section className="md-settings-grid"><div className="md-form-stack" ref={fields} key={`${data.member.email}-${data.member.mobile}`}><article className="md-card"><div className="md-card-head"><div><p className="md-kicker">Account</p><h2>Login Details</h2></div></div><div className="md-form-grid"><label className="md-field"><span>Email</span><input defaultValue={data.member.email}/></label><label className="md-field"><span>Mobile</span><input defaultValue={data.member.mobile}/></label></div><div className="md-save-row"><Link href="/forgot-password" className="md-secondary">Change Password</Link><button className="md-primary" disabled={saving} onClick={save}>Save Changes</button></div></article><article className="md-card"><div className="md-card-head"><div><p className="md-kicker">Notifications</p><h2>Email & Opportunity Alerts</h2></div></div><Toggle title="Casting recommendations" desc="Receive alerts when a role closely matches your profile." value={cast} set={v=>void preference("emailCastingAlerts",v)}/><Toggle title="Community updates" desc="Receive useful product news and community updates." value={mail} set={v=>void preference("emailUpdates",v)}/></article><article className="md-card"><div className="md-card-head"><div><p className="md-kicker">Privacy</p><h2>Profile Visibility</h2></div></div><Toggle title="Public talent profile" desc="Allow casting teams and visitors to discover your profile." value={visible} set={v=>void preference("publicVisible",v)}/></article></div><aside className="md-card md-membership"><p className="md-kicker">Account status</p><h2>Your membership</h2><span>Your account is active and ready for opportunities.</span><div><small>ACTIVE</small><strong>{data.member.verified?"Verified Member":"Not verified"}</strong></div><button onClick={()=>setDeactivating(true)}>Deactivate Account</button></aside></section>
    <ConfirmDialog open={deactivating} title="Deactivate your account?" description="You will be signed out. Contact the team to reactivate your account." confirmLabel="Deactivate" destructive loading={saving} onConfirm={()=>void deactivate()} onCancel={()=>setDeactivating(false)}/>
  </div>;
}

export function MemberWorkspace({section="dashboard"}:{section?:string}) {
  const safe = ["dashboard","profile","portfolio","applications","opportunities","settings"].includes(section)?section:"dashboard";
  return <MemberData><Shell section={safe}>{safe==="profile"?<Profile/>:safe==="portfolio"?<Portfolio/>:safe==="applications"?<Applications/>:safe==="opportunities"?<Opportunities/>:safe==="settings"?<Settings/>:<Dashboard/>}</Shell></MemberData>;
}
