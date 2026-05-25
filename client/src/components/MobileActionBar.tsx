import { LogOut, Paperclip, Trash2 } from "lucide-react";

interface MobileActionBarProps {
  onUploadClick: () => void;
  onClear: () => void;
  onDisconnect: () => void;
}

export default function MobileActionBar({ onUploadClick, onClear, onDisconnect }: MobileActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 md:hidden">
      <div className="flex items-center gap-2 rounded-full border border-white/12 bg-slate-950/72 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <button
          type="button"
          onClick={onUploadClick}
          className="grid h-12 w-12 place-items-center rounded-full bg-cyan-300/16 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.16)] transition hover:-translate-y-1 hover:bg-cyan-300/22 active:translate-y-0"
          aria-label="上传文件"
          title="上传文件"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClear}
          className="grid h-12 w-12 place-items-center rounded-full bg-white/[0.08] text-slate-200 transition hover:-translate-y-1 hover:bg-white/[0.13] active:translate-y-0"
          aria-label="清空"
          title="清空"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onDisconnect}
          className="grid h-12 w-12 place-items-center rounded-full bg-white/[0.08] text-slate-200 transition hover:-translate-y-1 hover:bg-white/[0.13] active:translate-y-0"
          aria-label="更换代码"
          title="更换代码"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
