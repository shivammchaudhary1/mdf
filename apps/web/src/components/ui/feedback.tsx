import { BrandLogo } from "@/components/brand-logo";

export function EmptyState({title="More stories are on their way.",description="Please check back soon for new updates."}:{title?:string;description?:string}){
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center"><h2 className="font-display text-2xl font-semibold">{title}</h2><p className="mx-auto mt-3 max-w-lg text-slate-600">{description}</p></div>
}

export function LoadingState({label="Loading your experience…"}:{label?:string}){
  return <div role="status" className="grid min-h-[44vh] place-items-center px-5 py-20"><div className="flex flex-col items-center text-center"><BrandLogo darkInk className="!w-[118px]"/><div className="mt-7 h-11 w-11 animate-spin rounded-full border-[3px] border-slate-200 border-t-[var(--brand-red)] motion-reduce:animate-none"/><p className="mt-4 text-sm font-semibold text-slate-600">{label}</p><span className="sr-only">{label}</span></div></div>
}

export function DemoNotice(){return <p className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Development preview · Company copy and original photographs are pending. Published content will appear as it is added.</p>}
