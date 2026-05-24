import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Cable, Dice5, Radar, ShieldCheck, Smartphone, Wifi } from "lucide-react";
import toast from "react-hot-toast";
import GlassPanel from "../components/GlassPanel";
import { API_URL } from "../utils/config";
import { isValidRoomCode, randomRoomCode } from "../utils/room";

interface PairingPageProps {
  onConnect: (code: string) => void;
}

export default function PairingPage({ onConnect }: PairingPageProps) {
  const [code, setCode] = useState("");
  const [shareBaseUrl, setShareBaseUrl] = useState(window.location.origin);
  const pairingUrl = useMemo(() => {
    if (!isValidRoomCode(code)) return "";
    return `${shareBaseUrl}${window.location.pathname}?room=${code}`;
  }, [code, shareBaseUrl]);

  useEffect(() => {
    const currentHost = window.location.hostname;
    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(currentHost);

    if (!isLocalHost) {
      setShareBaseUrl(window.location.origin);
      return;
    }

    fetch(`${API_URL}/api/network`)
      .then((response) => response.json())
      .then((network: { urls?: string[] }) => {
        if (network.urls?.[0]) {
          setShareBaseUrl(network.urls[0]);
        }
      })
      .catch(() => {
        setShareBaseUrl(window.location.origin);
      });
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValidRoomCode(code)) {
      toast.error("请输入 0000 到 9999 的 4 位数字代码");
      return;
    }
    onConnect(code);
  };

  const generate = () => {
    setCode(randomRoomCode());
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(45,212,191,0.18),transparent_32%),radial-gradient(circle_at_80%_5%,rgba(168,85,247,0.2),transparent_34%),linear-gradient(135deg,#070812_0%,#0d1020_48%,#111827_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/12 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_460px]">
          <section className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100">
                <Wifi className="h-4 w-4" />
                Local device pairing
              </div>
              <h1 className="mt-7 text-5xl font-semibold leading-tight tracking-normal text-white xl:text-6xl">
                四位代码连接，剪贴板在设备间流动。
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                在电脑和手机输入同一个 4 位数字代码，文本、链接和图片会实时同步。第一版适合局域网和个人临时使用。
              </p>
            </motion.div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
              {[
                { icon: Cable, title: "实时同步", desc: "Socket.IO" },
                { icon: ShieldCheck, title: "房间隔离", desc: "0000-9999" },
                { icon: Smartphone, title: "移动适配", desc: "扫码加入" }
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                  <item.icon className="h-5 w-5 text-cyan-100" />
                  <div className="mt-4 font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
          >
            <GlassPanel className="relative overflow-hidden p-5 sm:p-7">
              <div className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" />
              <div className="absolute -bottom-28 left-8 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

              <div className="relative">
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-[32px] border border-cyan-200/20 bg-cyan-200/10 shadow-glow">
                  <div className="relative">
                    <span className="absolute inset-0 animate-pulseGlow rounded-full bg-cyan-200/20 blur-xl" />
                    <Radar className="relative h-11 w-11 text-cyan-100" />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <h2 className="text-2xl font-semibold">连接设备</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    在另一台设备输入相同 4 位代码即可同步。
                  </p>
                </div>

                <form onSubmit={submit} className="mt-7">
                  <label className="sr-only" htmlFor="room-code">
                    4 位数字代码
                  </label>
                  <input
                    id="room-code"
                    value={code}
                    onChange={(event) => {
                      const next = event.target.value.replace(/\D/g, "").slice(0, 4);
                      setCode(next);
                    }}
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    autoFocus
                    placeholder="1234"
                    className="h-24 w-full rounded-[28px] border border-white/10 bg-black/25 text-center font-mono text-5xl font-semibold tracking-[0.42em] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-200/60 focus:ring-4 focus:ring-cyan-200/10 sm:text-6xl"
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <button
                      type="submit"
                      className="rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 px-5 py-4 font-semibold text-slate-950 shadow-glow transition hover:scale-[1.01] active:scale-[0.99]"
                    >
                      连接设备
                    </button>
                    <button
                      type="button"
                      onClick={generate}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-4 font-semibold text-white transition hover:bg-white/[0.12]"
                    >
                      <Dice5 className="h-5 w-5" />
                      随机代码
                    </button>
                  </div>
                </form>

                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                  {pairingUrl ? (
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-white p-2">
                        <QRCodeCanvas value={pairingUrl} size={96} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">扫码加入当前代码</div>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          手机扫码后会自动进入代码 {code}。
                        </p>
                        <p className="mt-2 truncate font-mono text-xs text-cyan-100/80">
                          {pairingUrl}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-slate-400">
                      输入或生成 4 位代码后，这里会显示手机扫码加入二维码。
                    </p>
                  )}
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
