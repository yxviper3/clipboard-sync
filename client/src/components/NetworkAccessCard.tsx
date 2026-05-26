import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { Copy, RefreshCw, ShieldAlert, Smartphone } from "lucide-react";
import { API_URL } from "../utils/config";

interface NetworkAccessCardProps {
  roomCode: string;
}

interface NetworkResponse {
  urls?: string[];
}

export default function NetworkAccessCard({ roomCode }: NetworkAccessCardProps) {
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNetwork = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/network`, { cache: "no-store" });
      const network = (await response.json()) as NetworkResponse;
      setUrls(network.urls || []);
    } catch {
      setUrls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNetwork();
  }, []);

  const accessUrl = useMemo(() => {
    const bestUrl = urls[0] || window.location.origin;
    return roomCode ? `${bestUrl}/?room=${roomCode}` : bestUrl;
  }, [roomCode, urls]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(accessUrl);
    toast.success("手机访问地址已复制");
  };

  return (
    <div className="rounded-3xl border border-cyan-200/12 bg-cyan-200/[0.055] p-4 shadow-panel backdrop-blur-2xl">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300/12 text-cyan-100">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">手机访问地址</div>
              <p className="mt-1 text-xs leading-5 text-slate-400">手机和电脑连接同一个 WiFi 后，扫码或输入这个地址。</p>
            </div>
            <button
              type="button"
              onClick={() => void loadNetwork()}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200 transition hover:bg-white/[0.1]"
              title="刷新地址"
              aria-label="刷新地址"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-2xl bg-white p-2">
              <QRCodeCanvas value={accessUrl} size={88} />
            </div>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => void copyUrl()}
                className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-left transition hover:border-cyan-200/30 hover:bg-black/25"
                title="复制手机访问地址"
              >
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-cyan-100">{accessUrl}</span>
                <Copy className="h-4 w-4 shrink-0 text-cyan-100" />
              </button>
              <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-amber-100/85">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>如果手机打不开，请把 Windows 网络改为“专用网络”，或允许 copy.exe 通过防火墙。</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
