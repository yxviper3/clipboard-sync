import { ChangeEvent, ClipboardEvent, DragEvent, KeyboardEvent, useRef, useState } from "react";
import { Loader2, Send, Sparkles, UploadCloud } from "lucide-react";
import GlassPanel from "./GlassPanel";
import { formatBytes } from "../utils/format";

interface ComposerProps {
  uploading: boolean;
  uploadProgress: number;
  onlineDevices: number;
  connected: boolean;
  onSend: (content: string) => Promise<boolean>;
  onUpload: (file: File) => Promise<boolean>;
}

export default function Composer({
  uploading,
  uploadProgress,
  onlineDevices,
  connected,
  onSend,
  onUpload,
}: ComposerProps) {
  const [content, setContent] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const submit = async () => {
    if (sending || !connected) return;
    setSending(true);
    try {
      const ok = await onSend(content);
      if (ok) setContent("");
    } finally {
      setSending(false);
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    setSelectedFile(file);
    const ok = await onUpload(file);
    if (ok) setSelectedFile(null);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      await uploadFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) {
      await uploadFiles(event.dataTransfer.files);
    }
  };

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(event.clipboardData.files)[0];
    if (file) {
      event.preventDefault();
      setSelectedFile(file);
      const ok = await onUpload(file);
      if (ok) setSelectedFile(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !sending) {
      event.preventDefault();
      void submit();
    }
  };

  const sendDisabled = sending || !connected;
  const uploadStatusVisible = selectedFile && uploading;

  return (
    <GlassPanel className="p-5 sm:p-6 lg:p-5 xl:p-6">
      <div className="flex items-center gap-3">
        <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-cyan-200/15 bg-cyan-300/15 text-cyan-200 shadow-glow">
          <span className="absolute inset-1 rounded-2xl bg-cyan-200/10 blur-md" />
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">发送到所有设备</h2>
          <p className="text-sm text-slate-400">Ctrl + Enter 发送，支持粘贴图片和上传 100MB 内文件</p>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="输入文本、链接，或在这里 Ctrl+V 粘贴图片..."
        className="mt-5 min-h-36 w-full resize-none rounded-3xl border border-white/12 bg-slate-950/35 p-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-400/75 focus:border-cyan-300/70 focus:bg-slate-950/45 focus:shadow-[0_0_32px_rgba(34,211,238,0.14)] focus:ring-4 focus:ring-cyan-300/10 lg:min-h-32"
      />

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`mt-4 hidden rounded-3xl border border-dashed p-4 transition lg:block xl:p-5 ${
          dragging
            ? "border-cyan-200 bg-cyan-300/12 shadow-[0_0_34px_rgba(34,211,238,0.16)]"
            : "border-white/15 bg-white/[0.04] hover:border-cyan-200/30 hover:bg-white/[0.06]"
        }`}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3.5 text-slate-200 transition hover:bg-white/[0.06]"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          <span>{uploading ? "文件上传中..." : "拖拽文件到这里，或点击选择文件"}</span>
        </button>

        {uploadStatusVisible && <UploadProgress file={selectedFile} uploadProgress={uploadProgress} className="mt-3" />}
      </div>

      {uploadStatusVisible && (
        <UploadProgress file={selectedFile} uploadProgress={uploadProgress} className="mt-3 lg:hidden" />
      )}

      <div className="mt-5">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={sendDisabled}
          title={
            !connected
              ? "连接断开，正在重连"
              : onlineDevices <= 1
                ? "暂无其他在线设备，也会保存在当前房间"
                : "发送到所有在线设备"
          }
          className="inline-flex h-16 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 px-5 text-lg font-semibold text-slate-950 shadow-glow transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 lg:h-12 lg:text-sm"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin lg:h-4 lg:w-4" /> : <Send className="h-5 w-5 lg:h-4 lg:w-4" />}
          {sending ? "发送中..." : onlineDevices <= 1 ? "发送内容" : "发送到设备"}
        </button>
      </div>
    </GlassPanel>
  );
}

function UploadProgress({
  file,
  uploadProgress,
  className = "",
}: {
  file: File;
  uploadProgress: number;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/20 p-3 ${className}`}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="min-w-0">
          <div className="truncate font-semibold text-white">{file.name}</div>
          <div className="mt-1 text-xs text-slate-400">
            {formatBytes(file.size)}
            {file.type ? ` · ${file.type}` : ""}
          </div>
        </div>
        <div className="shrink-0 font-mono text-xs text-cyan-100">{uploadProgress}%</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all duration-200"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>
  );
}
