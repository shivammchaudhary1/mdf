import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { AdminMembersView } from "@/components/admin/admin-members-view";
import { AdminApplicationsView } from "@/components/admin/admin-applications-view";
import { AdminProjectsView } from "@/components/admin/admin-projects-view";
import { AdminCastingView } from "@/components/admin/admin-casting-view";
import { AdminContentView } from "@/components/admin/admin-content-view";
import { AdminListsView } from "@/components/admin/admin-lists-view";
import { AdminContactsView } from "@/components/admin/admin-contacts-view";
import { AdminSettingsView } from "@/components/admin/admin-settings-view";

const valid=["dashboard","users","applications","projects","casting","work","blog","gallery","behind-the-scenes","shows","team","lists","contacts","settings","legal"] as const;

export function AdminWorkspace({section="dashboard"}:{section?:string}){
 const safe=valid.includes(section as (typeof valid)[number])?section:"dashboard";
 return <AdminShell section={safe==="behind-the-scenes"?"bts":safe}>
  {safe==="users"?<AdminMembersView/>:
   safe==="applications"?<AdminApplicationsView/>:
   safe==="projects"?<AdminProjectsView/>:
   safe==="casting"?<AdminCastingView/>:
   safe==="work"?<AdminContentView kind="work"/>:
   safe==="blog"?<AdminContentView kind="blog"/>:
   safe==="gallery"?<AdminContentView kind="gallery"/>:
   safe==="behind-the-scenes"?<AdminContentView kind="bts"/>:
   safe==="shows"?<AdminContentView kind="shows"/>:
   safe==="team"?<AdminContentView kind="team"/>:
   safe==="lists"?<AdminListsView/>:
   safe==="contacts"?<AdminContactsView/>:
   safe==="settings"?<AdminSettingsView/>:
   safe==="legal"?<AdminSettingsView legal/>:
   <AdminDashboardView/>}
 </AdminShell>
}
