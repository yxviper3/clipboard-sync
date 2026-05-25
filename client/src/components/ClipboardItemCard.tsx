import toast from "react-hot-toast";
import { Copy, Download, ExternalLink, FileArchive, Image, Link2, Trash2, Type } from "lucide-react";
import type { ClipboardItem } from "../types";
import { resolveAssetUrl } from "../utils/assets";
import { copyToClipboard } from "../utils/clipboard";
import { formatBytes, formatDate, formatTime } from "../utils/format";

interface ClipboardItemCardProps {
  item: ClipboardItem;
  onDelete: (id: string) => void;
}

export default function ClipboardItemCard({ item, onDelete }: ClipboardItemCardProps) {
  const copyText = async () => {
    const ok = await copyToClipboard(item.content);
    if (ok) {
      toast.success("复制成功");
      return;
    }

    toast.error("复制失败，请长按文本手动复制");
  };

  const typeMeta = {
    text: {
      label: "文本",
      icon: Type,
      className: "bg-cyan-300/12 text-cyan-100"
    },
    link: {
      label: "链接",
      icon: Link2,
      className: "bg-violet-300/12 text-violet-100"
    },
    image: {
      label: "图片",
      icon: Image,
      className: "bg-emerald-300/12 text-emerald-100"
    },
    file: {
      label: "文件",
      icon: FileArchive,
      className: "bg-amber-300/12 text-amber-100"
    }
  }[item.type];

  const Icon = typeMeta.icon;
  const assetUrl = resolveAssetUrl(item.fileUrl || item.imageUrl);

  return (
    <article className="group overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.065] p-4 shadow-panel backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${typeMeta.className}`}>
              <Icon className="h-3.5 w-3.5" />
              {typeMeta.label}
            </span>
            <span className="text-xs text-slate-500">
              {formatDate(item.createdAt)} {formatTime(item.createdAt)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-slate-400 transition hover:bg-rose-400/12 hover:text-rose-200"
          title="删除"
          aria-label="删除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {item.type === "image" ? (
        <div className="mt-4">
          <a href={assetUrl} target="_blank" rel="noreferrer">
            <img
              src={assetUrl}
              alt={item.fileName || "Uploaded image"}
              className="max-h-[420px] w-full rounded-3xl border border-white/10 object-cover"
              loading="lazy"
            />
          </a>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 text-sm text-slate-400">
              <div className="truncate text-slate-200">{item.fileName || "image"}</div>
              <div>{formatBytes(item.fileSize)}</div>
            </div>
            <a
              href={assetUrl}
              download={item.fileName}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              <Download className="h-4 w-4" />
              下载
            </a>
          </div>
        </div>
      ) : item.type === "file" ? (
        <div className="mt-4 rounded-3xl border border-white/10 bg-black/15 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-300/12 text-amber-100">
                <FileArchive className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-slate-100">{item.fileName || item.content}</div>
                <div className="mt-1 text-sm text-slate-400">
                  {formatBytes(item.fileSize)}
                  {item.mimeType ? ` · ${item.mimeType}` : ""}
                </div>
              </div>
            </div>
            <a
              href={assetUrl}
              download={item.fileName}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
            >
              <Download className="h-4 w-4" />
              下载
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-100">{item.content}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyText()}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-300/15"
            >
              <Copy className="h-4 w-4" />
              复制
            </button>
            {item.type === "link" && (
              <a
                href={item.content}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <ExternalLink className="h-4 w-4" />
                打开
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
