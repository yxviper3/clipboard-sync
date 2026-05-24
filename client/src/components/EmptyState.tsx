import { Clipboard } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-white/10 bg-white/[0.045] p-8 text-center backdrop-blur-xl">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-cyan-300/12 text-cyan-100">
          <Clipboard className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-white">还没有同步内容</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          在任意设备发送文本、链接、图片或文件，它会立即出现在这里。
        </p>
      </div>
    </div>
  );
}
