import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export default function PwaInstallCard() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-300/12 text-emerald-100">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">添加到手机桌面</div>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            第一次连接后添加到主屏幕，以后打开 copy.exe，再点手机桌面图标即可回到上次房间。
          </p>
          {installPrompt ? (
            <button
              type="button"
              onClick={() => void install()}
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
            >
              <Download className="h-4 w-4" />
              安装到桌面
            </button>
          ) : (
            <p className="mt-2 text-xs leading-5 text-cyan-100/80">
              如果没有安装按钮，请用浏览器菜单里的“添加到主屏幕”。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
