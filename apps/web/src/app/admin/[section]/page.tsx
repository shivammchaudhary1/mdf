import { notFound } from "next/navigation";
import { AdminWorkspace } from "@/components/admin-workspace";

const sections=["users","applications","projects","casting","blog","gallery","behind-the-scenes","shows","team","lists","contacts","settings","legal"];
type Props={params:Promise<{section:string}>};

export async function generateMetadata({params}:Props){
 const {section}=await params;
 const labels:Record<string,string>={users:"Members & Talent",applications:"Applications",projects:"Projects",casting:"Casting Calls",blog:"Blog & News",gallery:"Gallery","behind-the-scenes":"Behind the Scenes",shows:"Shows & Media",team:"Team",lists:"Saved Talent Lists",contacts:"Contact Queries",settings:"Company Settings",legal:"Legal Content"};
 return {title:labels[section]?`${labels[section]} — Super Admin`:"Super Admin",robots:{index:false,follow:false}}
}
export default async function Page({params}:Props){const{section}=await params;if(!sections.includes(section))notFound();return <AdminWorkspace section={section}/>}
