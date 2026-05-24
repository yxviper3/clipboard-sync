import { ImagePlus, LogOut, Trash2 } from "lucide-react";

interface MobileActionBarProps {
  onUploadClick: () => void;
  onClear: () => void;
  onDisconnect: () => void;
}

export default function MobileActionBar({ onUploadClick, onClear, onDisconnect }: MobileActionBarProps) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 rounded-[28px] border border-white/12 bg-slate-950/75 p-2 shadow-panel backdrop-blur-2xl md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onUploadClick}
          className="grid place-items-center rounded-2xl bg-white/[0.08] px-3 py-3 text-sm font-semibold text-white"
          aria-label="上传图片"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClear}
          className="grid place-items-center rounded-2xl bg-white/[0.08] px-3 py-3 text-sm font-semibold text-white"
          aria-label="清空"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onDisconnect}
          className="grid place-items-center rounded-2xl bg-white/[0.08] px-3 py-3 text-sm font-semibold text-white"
          aria-label="更换代码"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
