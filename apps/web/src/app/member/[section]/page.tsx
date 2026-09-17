import { notFound } from "next/navigation";
import { MemberWorkspace } from "@/components/member-workspace";
const sections = ["profile","portfolio","applications","opportunities","settings"];
type Props = { params: Promise<{section:string}> };
export default async function Page({params}:Props){ const {section}=await params; if(!sections.includes(section)) notFound(); return <MemberWorkspace section={section}/>; }
