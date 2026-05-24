import { useRef } from "react";
import { motion } from "framer-motion";
import { LogOut, MonitorSmartphone, Radio, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ClipboardItemCard from "../components/ClipboardItemCard";
import Composer from "../components/Composer";
import EmptyState from "../components/EmptyState";
import GlassPanel from "../components/GlassPanel";
import MobileActionBar from "../components/MobileActionBar";
import StatusPill from "../components/StatusPill";
import { useClipboardRoom } from "../hooks/useClipboardRoom";

interface ClipboardPageProps {
  roomCode: string;
  onDisconnect: () => void;
}

export default function ClipboardPage({ roomCode, onDisconnect }: ClipboardPageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    items,
    onlineDevices,
    connected,
    loading,
    uploading,
    sendText,
    uploadFile,
    deleteItem,
    clearItems
  } = useClipboardRoom(roomCode);

  const handleClear = () => {
    if (!items.length) {
      toast("暂无历史记录");
      return;
    }
    void clearItems();
  };

  const handleMobileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 pb-28 pt-5 text-white sm:px-6 md:pb-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(45,212,191,0.16),transparent_30%),radial-gradient(circle_at_95%_12%,rgba(217,70,239,0.16),transparent_28%),linear-gradient(135deg,#060711_0%,#0b1020_46%,#111827_100%)]" />
      <div className="pointer-events-none absolute left-[14%] top-28 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-[8%] h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadFile(file);
          event.target.value = "";
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-panel backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/12 text-cyan-100">
              <MonitorSmartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Clipboard Sync</div>
              <h1 className="text-2xl font-semibold">当前代码 {roomCode}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <StatusPill active={connected} label="连接状态" value={connected ? "在线" : "重连中"} />
            <StatusPill label="在线设备" value={onlineDevices} />
            <button
              type="button"
              onClick={handleClear}
              className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1] md:inline-flex"
            >
              <Trash2 className="h-4 w-4" />
              清空全部
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1] md:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              更换代码
            </button>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
          <div className="space-y-5 lg:sticky lg:top-5 lg:self-start">
            <Composer uploading={uploading} onSend={sendText} onUpload={uploadFile} />
            <GlassPanel className="hidden p-5 lg:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-300/12 text-violet-100">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-white">同步提示</div>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    网页无法静默读取系统剪贴板。复制和粘贴都需要你主动点击或按快捷键，这是浏览器的安全限制。
                  </p>
                </div>
              </div>
            </GlassPanel>
          </div>

          <section className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">同步历史</h2>
                <p className="mt-1 text-sm text-slate-400">按时间倒序排列，刷新后仍会保留。</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-slate-300">
                {items.length} 条
              </div>
            </div>

            {loading ? (
              <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-white/10 bg-white/[0.045] backdrop-blur-xl">
                <div className="text-center text-slate-300">
                  <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-cyan-200/20 border-t-cyan-200" />
                  正在连接房间...
                </div>
              </div>
            ) : items.length ? (
              <motion.div layout className="space-y-3">
                {items.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ClipboardItemCard item={item} onDelete={(id) => void deleteItem(id)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </div>

      <MobileActionBar onUploadClick={handleMobileUpload} onClear={handleClear} onDisconnect={onDisconnect} />
    </main>
  );
}
