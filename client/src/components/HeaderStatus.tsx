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
    <header className="mb-6 overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.07] p-4 shadow-panel backdrop-blur-2xl md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-3xl border border-cyan-200/20 bg-cyan-200/10 text-cyan-100 shadow-glow">
            <span className="absolute inset-1 animate-pulseGlow rounded-[22px] bg-cyan-200/10 blur-md" />
            <Wifi className="relative h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Clipboard Sync</div>
            <div className="mt-1 text-sm text-slate-300">当前配对码</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[auto_1fr] lg:min-w-[640px] lg:grid-cols-[auto_auto_auto] lg:justify-end">
          <button
            type="button"
            onClick={() => void copyCode()}
            className="group rounded-[26px] border border-cyan-200/15 bg-gradient-to-br from-cyan-200/12 via-white/[0.07] to-violet-300/10 px-5 py-3 text-left shadow-glow transition hover:-translate-y-0.5 hover:border-cyan-200/30"
            title="复制连接代码"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="font-mono text-4xl font-semibold tracking-[0.28em] text-white sm:text-5xl">
                {roomCode}
              </div>
              <Copy className="h-5 w-5 shrink-0 text-cyan-100 opacity-80 transition group-hover:opacity-100" />
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">连接状态</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
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

            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">在线设备</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                {connected ? <Wifi className="h-4 w-4 text-cyan-100" /> : <WifiOff className="h-4 w-4 text-rose-100" />}
                {onlineDevices}
              </div>
            </div>
          </div>

          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
            >
              <Trash2 className="h-4 w-4" />
              清空
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
            >
              <RefreshCw className="h-4 w-4" />
              更换代码
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
              title="断开连接"
              aria-label="断开连接"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
