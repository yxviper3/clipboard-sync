import { Clipboard } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="relative grid min-h-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-7 text-center backdrop-blur-xl lg:min-h-[300px] lg:flex-1">
      <div className="pointer-events-none absolute inset-x-8 top-12 h-px bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent" />
      <div className="pointer-events-none absolute left-10 right-10 top-24 border-t border-dashed border-white/10" />
      <div className="m-auto">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-200/12 bg-cyan-300/10 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
          <Clipboard className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">还没有同步内容</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          在任意设备发送文本、链接、图片或文件，它会立即出现在这里。
        </p>
        <div className="mx-auto mt-5 grid max-w-md gap-2">
          <div className="h-3 rounded-full bg-white/[0.055]" />
          <div className="mx-auto h-3 w-3/4 rounded-full bg-white/[0.04]" />
          <div className="mx-auto h-3 w-1/2 rounded-full bg-white/[0.035]" />
        </div>
      </div>
    </div>
  );
}
