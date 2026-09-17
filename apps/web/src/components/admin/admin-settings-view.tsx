"use client";

import { useState, type FormEvent } from "react";
import data from "@/data/admin-dashboard.json";
import { useToast } from "@/components/ui/toast-provider";
import { AdminPageHeader } from "@/components/admin/admin-shared";
import { AdminDialog,AdminDialogActions,AdminDialogForm,AdminFormField } from "@/components/admin/admin-dialog";

export function AdminSettingsView({legal=false}:{legal?:boolean}){
 const toast=useToast();
 const[saving,setSaving]=useState(false);
 const[policy,setPolicy]=useState<"privacy"|"terms"|null>(null);

 async function save(){
  setSaving(true);
  await new Promise(r=>setTimeout(r,350));
  setSaving(false);
  toast.success(legal?"Legal content saved in UI demo.":"Company settings saved in UI demo.");
 }

 function savePolicy(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const label=policy==="privacy"?"Privacy Policy":"Terms of Use";
  toast.success(`${label} draft saved in the UI.`);
  setPolicy(null);
 }

 if(legal)return <div className="ad-stack">
  <AdminPageHeader eyebrow="Trust & compliance" title="Legal Content" description="Keep registration details, copyright text and policy publishing status in one place."/>
  <section className="ad-settings-grid">
   <div className="ad-form-stack">
    <article className="ad-card"><div className="ad-card-head"><div><p className="ad-kicker">Company identity</p><h2>Registration Details</h2></div></div><div className="ad-form-grid"><label className="ad-field"><span>GST Number</span><input defaultValue={data.legal.gst} placeholder="Add verified GST number only"/></label><label className="ad-field"><span>Registration / CIN</span><input defaultValue={data.legal.registration} placeholder="Add verified registration only"/></label></div></article>
    <article className="ad-card"><div className="ad-card-head"><div><p className="ad-kicker">Policies</p><h2>Publishing Status</h2></div></div><div className="ad-policy-list"><div><strong>Privacy Policy</strong><span>{data.legal.privacyUpdated}</span><button type="button" onClick={()=>setPolicy("privacy")}>Edit</button></div><div><strong>Terms of Use</strong><span>{data.legal.termsUpdated}</span><button type="button" onClick={()=>setPolicy("terms")}>Edit</button></div></div></article>
    <article className="ad-card"><label className="ad-field"><span>Copyright Text</span><input defaultValue={data.legal.copyright}/></label></article>
    <button className="ad-primary ad-save" onClick={save}>{saving?"Saving…":"Save Legal Content"}</button>
   </div>
   <aside className="ad-card ad-trust-card"><p className="ad-kicker">Important</p><h2>Do not invent legal data.</h2><p>Only verified GST, registration and legal text should be published. Empty fields are intentionally supported until real details are supplied.</p></aside>
  </section>

  <AdminDialog open={!!policy} onClose={()=>setPolicy(null)} eyebrow="Legal content" title={policy==="privacy"?"Privacy Policy":"Terms of Use"} description="Draft the policy UI here. Have final legal wording reviewed before publication." width="wide">
    <AdminDialogForm onSubmit={savePolicy}>
      <AdminFormField label="Policy Content"><textarea name="content" rows={14} placeholder="Enter reviewed legal policy text here."/></AdminFormField>
      <label className="ad-dialog-check"><input type="checkbox" name="published"/><span>Mark as ready to publish after legal review</span></label>
      <AdminDialogActions onCancel={()=>setPolicy(null)} primaryLabel="Save Policy Draft"/>
    </AdminDialogForm>
  </AdminDialog>
 </div>;

 return <div className="ad-stack">
  <AdminPageHeader eyebrow="Platform configuration" title="Company Settings" description="Manage the public-facing company identity, contact details and social links."/>
  <section className="ad-settings-grid">
   <div className="ad-form-stack">
    <article className="ad-card"><div className="ad-card-head"><div><p className="ad-kicker">Brand</p><h2>Company Identity</h2></div></div><div className="ad-form-grid"><label className="ad-field"><span>Company Name</span><input defaultValue={data.settings.companyName}/></label><label className="ad-field"><span>Tagline</span><input defaultValue={data.settings.tagline}/></label></div></article>
    <article className="ad-card"><div className="ad-card-head"><div><p className="ad-kicker">Contact</p><h2>Public Contact Details</h2></div></div><div className="ad-form-grid"><label className="ad-field"><span>Email</span><input defaultValue={data.settings.email}/></label><label className="ad-field"><span>Phone</span><input defaultValue={data.settings.phone}/></label><label className="ad-field ad-field-wide"><span>Location</span><input defaultValue={data.settings.location}/></label></div></article>
    <article className="ad-card"><div className="ad-card-head"><div><p className="ad-kicker">Social</p><h2>Social Profiles</h2></div></div><div className="ad-form-grid"><label className="ad-field"><span>Instagram</span><input defaultValue={data.settings.instagram}/></label><label className="ad-field"><span>YouTube</span><input defaultValue={data.settings.youtube}/></label><label className="ad-field ad-field-wide"><span>LinkedIn</span><input defaultValue={data.settings.linkedin}/></label></div></article>
    <button className="ad-primary ad-save" onClick={save}>{saving?"Saving…":"Save Settings"}</button>
   </div>
   <aside className="ad-card ad-settings-note"><p className="ad-kicker">CMS direction</p><h2>Database-driven later.</h2><p>This screen currently uses temporary JSON for UI approval. After approval, these fields should load from the Settings API and MongoDB.</p></aside>
  </section>
 </div>
}
