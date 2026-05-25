import toast from "react-hot-toast";
import { Copy, LogOut, RefreshCw, Trash2, WifiOff, Wifi } from "lucide-react";

interface HeaderStatusProps {
  roomCode: string;
  connected: boolean;
  onlineDevices: number;
  onClear: () => void;
  onDisconnect: () => void;
}

export default function HeaderStatus({
  roomCode,
  connected,
  onlineDevices,
  onClear,
  onDisconnect
}: HeaderStatusProps) {
  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    toast.success("连接代码已复制");
  };

  return (
    <header className="mb-4 overflow-hidden rounded-[26px] border border-white/8 bg-white/[0.055] p-3 shadow-panel backdrop-blur-2xl md:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-200/15 bg-cyan-200/10 text-cyan-100 shadow-glow">
            <span className="absolute inset-1 animate-pulseGlow rounded-[18px] bg-cyan-200/10 blur-md" />
            <Wifi className="relative h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Clipboard Sync</div>
            <div className="mt-0.5 text-xs text-slate-400">当前配对码</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[auto_1fr] lg:min-w-[600px] lg:grid-cols-[auto_auto_auto] lg:justify-end">
          <button
            type="button"
            onClick={() => void copyCode()}
            className="group rounded-[22px] border border-cyan-200/12 bg-gradient-to-br from-cyan-200/12 via-white/[0.06] to-violet-300/10 px-4 py-2.5 text-left shadow-glow transition hover:-translate-y-0.5 hover:border-cyan-200/25"
            title="复制连接代码"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="font-mono text-3xl font-semibold tracking-[0.26em] text-white sm:text-4xl">
                {roomCode}
              </div>
              <Copy className="h-4 w-4 shrink-0 text-cyan-100 opacity-80 transition group-hover:opacity-100" />
            </div>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-white/8 bg-black/15 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">连接状态</div>
              <div className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-white">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    connected
                      ? "animate-pulse bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.95)]"
                      : "bg-rose-300 shadow-[0_0_14px_rgba(253,164,175,0.65)]"
                  }`}
                />
                {connected ? "在线" : "重连中"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/15 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">在线设备</div>
              <div className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-white">
                {connected ? <Wifi className="h-4 w-4 text-cyan-100" /> : <WifiOff className="h-4 w-4 text-rose-100" />}
                {onlineDevices}
              </div>
            </div>
          </div>

          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.05] px-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.09]"
            >
              <Trash2 className="h-4 w-4" />
              清空
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.05] px-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.09]"
            >
              <RefreshCw className="h-4 w-4" />
              更换代码
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/8 bg-white/[0.05] text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/[0.09]"
              title="退出房间"
              aria-label="退出房间"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
