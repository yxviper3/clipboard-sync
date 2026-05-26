import { useRef } from "react";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import toast from "react-hot-toast";
import ClipboardItemCard from "../components/ClipboardItemCard";
import Composer from "../components/Composer";
import EmptyState from "../components/EmptyState";
import GlassPanel from "../components/GlassPanel";
import HeaderStatus from "../components/HeaderStatus";
import MobileActionBar from "../components/MobileActionBar";
import NetworkAccessCard from "../components/NetworkAccessCard";
import PwaInstallCard from "../components/PwaInstallCard";
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
    uploadProgress,
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
    <main className="relative min-h-screen overflow-x-hidden px-4 pb-32 pt-5 text-white sm:px-6 md:pb-8 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:px-8 lg:py-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(45,212,191,0.16),transparent_30%),radial-gradient(circle_at_95%_12%,rgba(217,70,239,0.16),transparent_28%),linear-gradient(135deg,#060711_0%,#0b1020_46%,#111827_100%)]" />
      <div className="glow-orb pointer-events-none absolute left-[8%] top-24 h-64 w-64 rounded-full bg-cyan-300/12 blur-3xl" />
      <div className="glow-orb-delay pointer-events-none absolute right-[6%] top-16 h-72 w-72 rounded-full bg-violet-400/12 blur-3xl" />
      <div className="glow-orb-slow pointer-events-none absolute bottom-20 left-[42%] h-64 w-64 rounded-full bg-sky-300/8 blur-3xl" />

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

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto max-w-7xl 2xl:max-w-[1440px] lg:flex lg:h-full lg:flex-col"
      >
        <HeaderStatus
          roomCode={roomCode}
          connected={connected}
          onlineDevices={onlineDevices}
          onClear={handleClear}
          onDisconnect={onDisconnect}
        />

        <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[440px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[460px_minmax(0,1fr)] 2xl:gap-8">
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Composer
              uploading={uploading}
              uploadProgress={uploadProgress}
              onlineDevices={onlineDevices}
              connected={connected}
              onSend={sendText}
              onUpload={uploadFile}
            />
            <div className="hidden lg:block">
              <NetworkAccessCard roomCode={roomCode} />
            </div>
            <GlassPanel className="hidden p-4 lg:block">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-300/12 text-violet-100">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">同步提示</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    网页无法静默读取系统剪贴板。复制和粘贴都需要你主动点击或按快捷键，这是浏览器的安全限制。
                  </p>
                </div>
              </div>
            </GlassPanel>
          </div>

          <section className="min-w-0 lg:flex lg:min-h-0 lg:flex-col">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold lg:text-xl">同步历史</h2>
                <p className="mt-0.5 text-sm text-slate-400">按时间倒序排列，刷新后仍会保留。</p>
              </div>
              <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-slate-300">
                {items.length} 条
              </div>
            </div>

            {loading ? (
              <div className="grid min-h-[280px] place-items-center rounded-[28px] border border-white/10 bg-white/[0.045] backdrop-blur-xl lg:flex-1">
                <div className="text-center text-slate-300">
                  <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-cyan-200/20 border-t-cyan-200" />
                  正在连接房间...
                </div>
              </div>
            ) : items.length ? (
              <motion.div layout className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
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

            <div className="mt-4 lg:hidden">
              <PwaInstallCard />
            </div>
          </section>
        </div>
      </motion.div>

      <MobileActionBar onUploadClick={handleMobileUpload} onClear={handleClear} onDisconnect={onDisconnect} />
    </main>
  );
}
